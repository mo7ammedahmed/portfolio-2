import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/components/admin/motion';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { toUrl } from '@/lib/utils';
import type { NavItem } from '@/types';

type Insets = { t: number; r: number; b: number; l: number };

/** Exact match first, else the deepest section the current page lives under. */
function activeIndexFor(items: NavItem[], currentUrl: string): number {
    let best = -1;
    let bestLength = -1;

    items.forEach((item, index) => {
        const path = new URL(toUrl(item.href), 'http://x').pathname;
        const matches =
            currentUrl === path || currentUrl.startsWith(`${path}/`);

        if (matches && path.length > bestLength) {
            best = index;
            bestLength = path.length;
        }
    });

    return best;
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const { currentUrl } = useCurrentUrl();
    const active = activeIndexFor(items, currentUrl);
    const stageRef = useRef<HTMLDivElement>(null);
    const pillRef = useRef<HTMLSpanElement>(null);
    const insets = useRef<Insets | null>(null);

    // Stretchy pill: the edge in the direction of travel leads (.36 s), the
    // trailing edge catches up (.55 s), so it stretches like a drop of liquid.
    const place = (animate: boolean) => {
        const stage = stageRef.current;
        const pill = pillRef.current;
        const button = stage?.querySelectorAll<HTMLElement>(
            '[data-sidebar="menu-button"]',
        )[active];

        if (!stage || !pill) {
            return;
        }

        if (!button) {
            pill.style.opacity = '0';

            return;
        }

        const box = stage.getBoundingClientRect();
        const rect = button.getBoundingClientRect();
        const to: Insets = {
            t: rect.top - box.top,
            r: box.right - rect.right,
            b: box.bottom - rect.bottom,
            l: rect.left - box.left,
        };
        const paint = () => {
            const s = insets.current!;
            pill.style.clipPath = `inset(${s.t}px ${s.r}px ${s.b}px ${s.l}px round 8px)`;
        };

        pill.style.opacity = '1';

        if (!insets.current || !animate || prefersReducedMotion()) {
            if (insets.current) {
                gsap.killTweensOf(insets.current);
            }

            insets.current = to;
            paint();

            return;
        }

        const down = to.t > insets.current.t;
        const [lead, trail] = down
            ? (['b', 't'] as const)
            : (['t', 'b'] as const);

        gsap.to(insets.current, {
            [lead]: to[lead],
            l: to.l,
            r: to.r,
            duration: 0.36,
            ease: 'power3.out',
            overwrite: 'auto',
            onUpdate: paint,
        });
        gsap.to(insets.current, {
            [trail]: to[trail],
            duration: 0.55,
            ease: 'power3.out',
            overwrite: 'auto',
            onUpdate: paint,
        });
    };

    const placeRef = useRef(place);

    useLayoutEffect(() => {
        placeRef.current = place;
        place(true);
    });

    // Collapse/expand and window resizes: snap without travel. Observed once,
    // because a new observer fires immediately and would cancel the glide.
    useEffect(() => {
        const stage = stageRef.current;

        if (!stage) {
            return;
        }

        const observer = new ResizeObserver(() => placeRef.current(false));
        observer.observe(stage);

        return () => observer.disconnect();
    }, []);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <div ref={stageRef} className="relative">
                <span
                    ref={pillRef}
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-sidebar-accent opacity-0"
                />
                <SidebarMenu>
                    {items.map((item, index) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={index === active}
                                tooltip={{ children: item.title }}
                                className="data-[active=true]:bg-transparent [&>svg]:transition-colors data-[active=true]:[&>svg]:text-highlight"
                            >
                                <Link
                                    href={item.href}
                                    prefetch
                                    aria-current={
                                        index === active ? 'page' : undefined
                                    }
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </div>
        </SidebarGroup>
    );
}
