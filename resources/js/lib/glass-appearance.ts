import type { CSSProperties } from 'react';
import type { PortfolioTheme } from '@/types';

export function glassStyle(
    profile: Pick<
        PortfolioTheme,
        | 'glass_blur'
        | 'glass_surface_opacity'
        | 'glass_border_opacity'
        | 'glass_saturation'
        | 'glass_border_enabled'
        | 'glass_light_opacity'
        | 'glass_dark_opacity'
    >,
    dark: boolean,
): CSSProperties {
    const opacity =
        (dark ? profile.glass_dark_opacity : profile.glass_light_opacity) ??
        profile.glass_surface_opacity ??
        0.64;

    return {
        '--glass-blur': `${profile.glass_blur ?? 1.25}px`,
        '--glass-surface-percent': `${opacity * 100}%`,
        '--glass-border-percent': `${(profile.glass_border_enabled === false ? 0 : (profile.glass_border_opacity ?? 0.22)) * 100}%`,
        '--glass-saturation': profile.glass_saturation ?? 1.35,
        '--glass-edge':
            profile.glass_border_enabled === false
                ? 'transparent'
                : 'color-mix(in srgb, var(--portfolio-foreground) 10%, transparent)',
    } as CSSProperties;
}
