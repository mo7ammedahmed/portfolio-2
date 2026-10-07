import { Link, router } from '@inertiajs/react';
import { Languages, Moon, Sun } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect } from 'react';
import { MarketingIntegrations } from '@/components/portfolio/marketing-integrations';
import { useAppearance } from '@/hooks/use-appearance';
import { gradientToCss } from '@/lib/color-utils';
import type { Gradient, PortfolioProfile, TrackingIntegration } from '@/types';
import { PortfolioSeo } from './seo';

export type Locale = 'ar' | 'en';
export function localized(item: object, field: string, locale: Locale): string {
    return String(
        (item as Record<string, unknown>)[`${field}_${locale}`] ?? '',
    );
}
function color(value: string | Gradient | undefined, fallback: string): string {
    return typeof value === 'string'
        ? value
        : (value?.stops?.[0]?.color ?? fallback);
}
export function PublicLayout({
    profile,
    locale,
    trackingIntegrations = [],
    children,
}: {
    profile: PortfolioProfile;
    locale: Locale;
    trackingIntegrations?: TrackingIntegration[];
    children: ReactNode;
}) {
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const dark = resolvedAppearance === 'dark';
    const ar = locale === 'ar';
    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = ar ? 'rtl' : 'ltr';
    }, [locale, ar]);
    const mode = dark ? 'dark' : 'light';
    const background = profile[`theme_${mode}_background`];
    const palette = {
        backgroundImage:
            background && typeof background !== 'string'
                ? gradientToCss(background)
                : undefined,
        '--folio-bg': color(
            profile[`theme_${mode}_background`],
            dark ? '#070707' : '#f4f3ee',
        ),
        '--folio-surface': color(
            profile[`theme_${mode}_surface`],
            dark ? '#141414' : '#ffffff',
        ),
        '--folio-fg':
            profile[`theme_${mode}_foreground`] ||
            (dark ? '#f4f4f1' : '#171917'),
        '--folio-muted':
            profile[`theme_${mode}_muted`] || (dark ? '#b0b5b0' : '#555d57'),
        '--folio-accent': color(profile[`theme_${mode}_accent`], '#006c55'),
    } as CSSProperties;
    const switchLocale = () => {
        document.cookie = `portfolio_locale=${ar ? 'en' : 'ar'}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
        router.reload();
    };

    return (
        <div
            className="folio"
            dir={ar ? 'rtl' : 'ltr'}
            lang={locale}
            style={palette}
        >
            <PortfolioSeo />
            <MarketingIntegrations integrations={trackingIntegrations} />
            <a className="folio-skip" href="#main-content">
                {ar ? 'انتقل إلى المحتوى' : 'Skip to content'}
            </a>
            <header className="folio-header">
                <Link href="/" className="folio-brand">
                    {localized(profile, 'name', locale)}
                    <span>
                        {ar
                            ? 'تطوير الويب والمنتجات'
                            : 'Web & product development'}
                    </span>
                </Link>
                <nav aria-label={ar ? 'التنقل الرئيسي' : 'Main navigation'}>
                    <Link href="/#work">{ar ? 'الأعمال' : 'Work'}</Link>
                    <Link href="/#about">{ar ? 'نبذة' : 'About'}</Link>
                    <Link href="/#contact">{ar ? 'تواصل' : 'Contact'}</Link>
                </nav>
                <div className="folio-controls">
                    <button
                        type="button"
                        onClick={switchLocale}
                        aria-label={
                            ar ? 'Switch to English' : 'التبديل إلى العربية'
                        }
                    >
                        <Languages size={18} />
                        <span>{ar ? 'EN' : 'ع'}</span>
                    </button>
                    <button
                        type="button"
                        onClick={() =>
                            updateAppearance(dark ? 'light' : 'dark')
                        }
                        aria-label={ar ? 'تغيير المظهر' : 'Switch theme'}
                    >
                        {dark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>
            <main id="main-content">{children}</main>
            <footer className="folio-footer">
                <span>
                    © {new Date().getFullYear()}{' '}
                    {localized(profile, 'name', locale)}
                </span>
                <a href="/#work">
                    {ar ? 'استكشف الأعمال' : 'Explore the work'}
                </a>
            </footer>
        </div>
    );
}
