import { usePage } from '@inertiajs/react';
import type { ImgHTMLAttributes } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';

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
            <img
                src={imageUrl}
                alt={alt}
                className={className}
                {...props}
            />
        );
    }

    return <AppLogoIcon className={className} {...(props as object)} />;
}
