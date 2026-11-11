import type { CSSProperties, MouseEvent, PointerEvent } from 'react';
import { useLayoutEffect, useRef } from 'react';
import { flushSync } from 'react-dom';

export const prefersReducedMotion = (): boolean =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function formatDuration(seconds: number): string {
    seconds = Math.round(seconds);

    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

const formats = {
    number: (value: number) => Math.round(value).toLocaleString(),
    duration: formatDuration,
};

/** Number ticker: counts 0 → value on mount (1.2 s, ease-out quart). */
export function CountUp({
    value,
    format = 'number',
    duration = 1200,
}: {
    value: number;
    format?: keyof typeof formats;
    duration?: number;
}) {
    const ref = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const element = ref.current;
        const render = formats[format];

        if (!element || prefersReducedMotion()) {
            return;
        }

        let frame = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            element.textContent = render(
                value * (1 - Math.pow(1 - progress, 4)),
            );

            if (progress < 1) {
                frame = requestAnimationFrame(tick);
            }
        };

        element.textContent = render(0);
        frame = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frame);
            element.textContent = render(value);
        };
    }, [value, format, duration]);

    return (
        <span ref={ref} className="tabular-nums">
            {formats[format](value)}
        </span>
    );
}

/** Smooth Catmull-Rom curve through the points, as an SVG path. */
export function smoothPath(points: [number, number][]): string {
    return points.reduce((d, [x, y], i, all) => {
        if (i === 0) {
            return `M${x},${y}`;
        }

        const [x0, y0] = all[i - 2] ?? all[i - 1];
        const [x1, y1] = all[i - 1];
        const [x3, y3] = all[i + 1] ?? [x, y];
        // Keep control points between the segment's ends: no overshoot
        // below zero or above a peak.
        const clamp = (value: number) =>
            Math.min(Math.max(value, Math.min(y1, y)), Math.max(y1, y));

        return `${d} C${x1 + (x - x0) / 6},${clamp(y1 + (y - y0) / 6)} ${x - (x3 - x1) / 6},${clamp(y - (y3 - y1) / 6)} ${x},${y}`;
    }, '');
}

/** Small trend line that draws itself in. */
export function Sparkline({ values }: { values: number[] }) {
    const width = 120;
    const height = 36;
    const maximum = Math.max(1, ...values);
    const points = values.map((value, index): [number, number] => [
        (index / Math.max(values.length - 1, 1)) * width,
        height - 3 - (value / maximum) * (height - 6),
    ]);
    const line = smoothPath(points);

    if (values.length < 2) {
        return null;
    }

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            className="h-9 w-28 overflow-visible"
            preserveAspectRatio="none"
            aria-hidden
        >
            <path
                className="studio-area"
                d={`${line} L${width},${height} L0,${height} Z`}
                fill="color-mix(in srgb, var(--highlight) 16%, transparent)"
            />
            <path
                className="studio-draw"
                pathLength={1}
                d={line}
                fill="none"
                stroke="var(--highlight)"
                strokeWidth={2}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

const ringColors = [
    'var(--chart-1)',
    'var(--chart-3)',
    'var(--chart-2)',
    'var(--chart-4)',
    'var(--chart-5)',
];

/** Donut ring with labelled segments; sweeps in once. */
export function Donut({
    segments,
    label,
    caption,
    size = '7.5rem',
    total: totalOverride,
}: {
    segments: { label: string; value: number }[];
    label: string;
    caption?: string;
    size?: string;
    /** Whole of the ring; the unfilled rest shows as track. */
    total?: number;
}) {
    const total =
        totalOverride ||
        segments.reduce((sum, item) => sum + item.value, 0) ||
        1;
    // Cumulative percentage at the end of each segment.
    const ends = segments.map(
        (_, index) =>
            (segments
                .slice(0, index + 1)
                .reduce((sum, item) => sum + item.value, 0) /
                total) *
            100,
    );
    const stops = segments.map(
        (_, index) =>
            `${ringColors[index % ringColors.length]} ${ends[index - 1] ?? 0}% ${ends[index]}%`,
    );
    const ring = `conic-gradient(${stops.join(', ')}, color-mix(in srgb, var(--foreground) 8%, transparent) ${ends.at(-1) ?? 0}% 100%)`;

    return (
        <div className="relative grid shrink-0 place-items-center">
            <div
                className="studio-donut"
                style={{ '--ring': ring, '--size': size } as CSSProperties}
                role="img"
                aria-label={segments
                    .map(
                        (item) =>
                            `${item.label} ${Math.round((item.value / total) * 100)}%`,
                    )
                    .join(', ')}
            />
            <div className="absolute text-center">
                <strong className="block text-xl leading-none tabular-nums">
                    {label}
                </strong>
                {caption && (
                    <span className="mt-1 block text-[10px] text-muted-foreground">
                        {caption}
                    </span>
                )}
            </div>
        </div>
    );
}

export { ringColors };

/** Pointer tilt + glare for `.studio-tilt` elements. */
export const tiltHandlers = {
    onPointerMove(event: PointerEvent<HTMLElement>) {
        if (prefersReducedMotion() || event.pointerType !== 'mouse') {
            return;
        }

        const box = event.currentTarget.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        const style = event.currentTarget.style;
        style.setProperty('--ry', `${(px - 0.5) * 14}deg`);
        style.setProperty('--rx', `${(0.5 - py) * 14}deg`);
        style.setProperty('--gx', `${px * 100}%`);
        style.setProperty('--gy', `${py * 100}%`);
    },
    onPointerLeave(event: PointerEvent<HTMLElement>) {
        const style = event.currentTarget.style;
        style.setProperty('--rx', '0deg');
        style.setProperty('--ry', '0deg');
    },
};

/** Up to two initials from a name ("Aether School OS" → "AS"). */
export function initials(text: string): string {
    return text
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0] ?? '')
        .join('')
        .toUpperCase();
}

/** Stable hue (0–359) from a string, for avatar tints. */
export function hueOf(text: string): number {
    let hash = 0;

    for (const char of text) {
        hash = (hash * 31 + char.charCodeAt(0)) % 360;
    }

    return hash;
}

type ViewTransitionDocument = Document & {
    startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/** Theme switch as a circle growing from the clicked control (.7 s). */
export function revealTheme(
    event: MouseEvent<HTMLElement>,
    apply: () => void,
): void {
    const doc = document as ViewTransitionDocument;

    if (!doc.startViewTransition || prefersReducedMotion()) {
        apply();

        return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX || rect.left + rect.width / 2;
    const y = event.clientY || rect.top + rect.height / 2;
    const radius = Math.hypot(
        Math.max(x, innerWidth - x),
        Math.max(y, innerHeight - y),
    );
    const root = document.documentElement;

    root.classList.add('studio-vt');
    const transition = doc.startViewTransition(() => flushSync(apply));

    transition.ready
        .then(
            () =>
                root.animate(
                    {
                        clipPath: [
                            `circle(0px at ${x}px ${y}px)`,
                            `circle(${radius}px at ${x}px ${y}px)`,
                        ],
                    },
                    {
                        duration: 700,
                        easing: 'cubic-bezier(.7, 0, .3, 1)',
                        pseudoElement: '::view-transition-new(root)',
                    },
                ).finished,
        )
        .catch(() => undefined)
        .finally(() => root.classList.remove('studio-vt'));
}
