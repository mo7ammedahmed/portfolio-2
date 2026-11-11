import type { MouseEvent } from 'react';
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
