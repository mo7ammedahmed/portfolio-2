import { Head, usePage } from '@inertiajs/react';

export function PortfolioSeo() {
    const { seo } = usePage<{
        seo?: {
            title: string;
            description: string;
            canonical: string;
            image: string;
        };
    }>().props;

    if (!seo) {
        return null;
    }

    return (
        <Head title={seo.title}>
            <meta head-key="robots" name="robots" content="index, follow" />
            <meta
                head-key="description"
                name="description"
                content={seo.description}
            />
            <link head-key="canonical" rel="canonical" href={seo.canonical} />
            <meta head-key="og:title" property="og:title" content={seo.title} />
            <meta
                head-key="og:description"
                property="og:description"
                content={seo.description}
            />
            <meta head-key="og:url" property="og:url" content={seo.canonical} />
            <meta head-key="og:type" property="og:type" content="website" />
            <meta head-key="og:image" property="og:image" content={seo.image} />
            <meta
                head-key="twitter:card"
                name="twitter:card"
                content="summary_large_image"
            />
        </Head>
    );
}
