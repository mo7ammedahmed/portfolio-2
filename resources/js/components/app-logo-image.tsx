import { usePage } from '@inertiajs/react';
import type { ImgHTMLAttributes } from 'react';

type AppLogoImageProps = ImgHTMLAttributes<HTMLImageElement> & {
    src?: string;
};

export default function AppLogoImage({
    src,
    className,
    alt = 'Logo',
    ...props
}: AppLogoImageProps) {
    const page = usePage();
    const imageUrl = src ?? (page.props.profileImageUrl as string | null);

    if (imageUrl) {
        return (
            <img src={imageUrl} alt={alt} className={className} {...props} />
        );
    }

    const identity = page.props.siteIdentity as
        { name_en?: string } | undefined;
    const name = identity?.name_en || String(page.props.name || 'Portfolio');
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();

    return (
        <span
            role="img"
            aria-label={alt === 'Logo' ? name : alt}
            className={`inline-flex shrink-0 items-center justify-center font-semibold tracking-tighter ${className ?? ''}`}
        >
            {initials}
        </span>
    );
}
