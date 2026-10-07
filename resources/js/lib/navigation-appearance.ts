import type { CSSProperties } from 'react';
import type { PortfolioProfile } from '@/types';

export type NavigationAppearance = Pick<
    PortfolioProfile,
    | 'nav_background'
    | 'nav_text'
    | 'nav_muted'
    | 'nav_active_background'
    | 'nav_active_text'
    | 'nav_border'
    | 'nav_glass_enabled'
    | 'nav_opacity'
    | 'nav_blur'
>;

export function navigationStyle(
    profile: Partial<NavigationAppearance>,
): CSSProperties {
    return {
        '--nav-background': profile.nav_background ?? '#0a0a0a',
        '--nav-text': profile.nav_text ?? '#f5f5f2',
        '--nav-muted': profile.nav_muted ?? '#a1a1aa',
        '--nav-active-background': profile.nav_active_background ?? '#006c55',
        '--nav-active-text': profile.nav_active_text ?? '#ffffff',
        '--nav-border': profile.nav_border ?? '#383838',
        '--nav-opacity': `${(profile.nav_opacity ?? 0.72) * 100}%`,
        '--nav-blur': `${profile.nav_blur ?? 20}px`,
    } as CSSProperties;
}
