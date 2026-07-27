import { useLayoutEffect } from 'react';

import type { PortfolioTheme } from '@/types';

const themeProperties: Record<keyof PortfolioTheme, string> = {
    theme_accent: '--dashboard-accent',
    theme_dark_background: '--dashboard-dark-background',
    theme_dark_surface: '--dashboard-dark-surface',
    theme_dark_foreground: '--dashboard-dark-foreground',
    theme_dark_muted: '--dashboard-dark-muted',
    theme_light_background: '--dashboard-light-background',
    theme_light_surface: '--dashboard-light-surface',
    theme_light_foreground: '--dashboard-light-foreground',
    theme_light_muted: '--dashboard-light-muted',
};

function contrastingText(hex: string): string {
    const darkText = '#090a09';
    const lightText = '#ffffff';

    return contrastRatio(hex, darkText) >= contrastRatio(hex, lightText)
        ? darkText
        : lightText;
}

function relativeLuminance(hex: string): number {
    const normalized = hex.replace('#', '');
    const channels = [0, 2, 4].map((offset) => {
        const channel = Number.parseInt(
            normalized.slice(offset, offset + 2),
            16,
        );
        const ratio = channel / 255;

        return ratio <= 0.04045
            ? ratio / 12.92
            : ((ratio + 0.055) / 1.055) ** 2.4;
    });

    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(first: string, second: string): number {
    const firstLuminance = relativeLuminance(first);
    const secondLuminance = relativeLuminance(second);
    const lighter = Math.max(firstLuminance, secondLuminance);
    const darker = Math.min(firstLuminance, secondLuminance);

    return (lighter + 0.05) / (darker + 0.05);
}

function mixHex(first: string, second: string, amount: number): string {
    const parse = (hex: string, offset: number): number =>
        Number.parseInt(hex.replace('#', '').slice(offset, offset + 2), 16);
    const channel = (offset: number): string =>
        Math.round(
            parse(first, offset) * (1 - amount) +
                parse(second, offset) * amount,
        )
            .toString(16)
            .padStart(2, '0');

    return `#${channel(0)}${channel(2)}${channel(4)}`;
}

function readableAccent(accent: string, background: string): string {
    if (contrastRatio(accent, background) >= 4.5) {
        return accent;
    }

    const target =
        contrastRatio('#090a09', background) >=
        contrastRatio('#ffffff', background)
            ? '#090a09'
            : '#ffffff';

    for (let step = 1; step <= 20; step += 1) {
        const candidate = mixHex(accent, target, step * 0.05);

        if (contrastRatio(candidate, background) >= 4.5) {
            return candidate;
        }
    }

    return target;
}

export function useDashboardPalette(theme: PortfolioTheme | null): void {
    useLayoutEffect(() => {
        if (!theme) {
            return;
        }

        const root = document.documentElement;

        root.dataset.dashboardPalette = 'true';

        Object.entries(themeProperties).forEach(([attribute, property]) => {
            root.style.setProperty(
                property,
                theme[attribute as keyof PortfolioTheme],
            );
        });
        root.style.setProperty(
            '--dashboard-accent-foreground',
            contrastingText(theme.theme_accent),
        );
        root.style.setProperty(
            '--dashboard-light-highlight',
            readableAccent(theme.theme_accent, theme.theme_light_background),
        );
        root.style.setProperty(
            '--dashboard-dark-highlight',
            readableAccent(theme.theme_accent, theme.theme_dark_background),
        );

        return () => {
            delete root.dataset.dashboardPalette;

            Object.values(themeProperties).forEach((property) => {
                root.style.removeProperty(property);
            });
            root.style.removeProperty('--dashboard-accent-foreground');
            root.style.removeProperty('--dashboard-light-highlight');
            root.style.removeProperty('--dashboard-dark-highlight');
        };
    }, [theme]);
}
