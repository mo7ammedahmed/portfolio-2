import { Head, Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import { localized, PublicLayout } from '@/components/portfolio/public-layout';
import type { Locale } from '@/components/portfolio/public-layout';
import type {
    PortfolioProfile,
    PortfolioProject,
    TrackingIntegration,
} from '@/types';

export default function CaseStudy({
    project,
    profile,
    locale,
    trackingIntegrations,
}: {
    project: PortfolioProject;
    profile: PortfolioProfile;
    locale: Locale;
    trackingIntegrations: TrackingIntegration[];
}) {
    const ar = locale === 'ar';
    const sections = [
        { field: 'role', title: ar ? 'دوري في المشروع' : 'My contribution' },
        { field: 'challenge', title: ar ? 'المشكلة' : 'The challenge' },
        { field: 'solution', title: ar ? 'الحل' : 'The approach' },
        {
            field: 'outcomes',
            title: ar ? 'ما يقدمه المشروع' : 'What the project delivers',
        },
    ];

    return (
        <PublicLayout
            profile={profile}
            locale={locale}
            trackingIntegrations={trackingIntegrations}
        >
            <Head title={localized(project, 'name', locale)} />
            <article className="folio-case">
                <Link className="folio-text-link" href="/#work">
                    {ar ? 'العودة إلى الأعمال' : 'Back to work'}
                </Link>
                <div className="folio-case-heading">
                    <p className="folio-kicker">
                        {project.category &&
                            localized(project.category, 'name', locale)}{' '}
                        /{' '}
                        {project.status === 'completed'
                            ? ar
                                ? 'مكتمل'
                                : 'Completed'
                            : ar
                              ? 'قيد التطوير'
                              : 'In development'}
                    </p>
                    <h1>{localized(project, 'name', locale)}</h1>
                    <p className="folio-intro">
                        {localized(project, 'description', locale)}
                    </p>
                    <ul className="folio-tags">
                        {project.skills.map((skill) => (
                            <li key={skill.name_en}>
                                {localized(skill, 'name', locale)}
                            </li>
                        ))}
                    </ul>
                    <div className="folio-actions">
                        {project.url && (
                            <a
                                className="folio-button"
                                href={project.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {ar ? 'زيارة الموقع' : 'Visit website'}
                                <ArrowUpRight size={18} />
                            </a>
                        )}
                        {project.repository_url && (
                            <a
                                className="folio-text-link"
                                href={project.repository_url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {ar ? 'عرض المستودع' : 'View source'}
                            </a>
                        )}
                    </div>
                </div>
                {project.image_url && (
                    <img
                        className="folio-case-cover"
                        src={project.image_url}
                        alt={localized(project, 'name', locale)}
                        width={1440}
                        height={1000}
                        fetchPriority="high"
                    />
                )}
                <div className="folio-case-story">
                    {sections.map(
                        ({ field, title }) =>
                            localized(project, field, locale) && (
                                <section key={field}>
                                    <h2>{title}</h2>
                                    <p>{localized(project, field, locale)}</p>
                                </section>
                            ),
                    )}
                </div>
                {!!project.images.length && (
                    <section
                        className="folio-gallery"
                        aria-label={ar ? 'صور المشروع' : 'Project gallery'}
                    >
                        {project.images.map((image) => (
                            <figure key={image.id}>
                                <img
                                    src={image.url}
                                    alt={localized(image, 'alt', locale)}
                                    width={1440}
                                    height={1000}
                                    loading="lazy"
                                />
                                <figcaption>
                                    {localized(image, 'alt', locale)}
                                </figcaption>
                            </figure>
                        ))}
                    </section>
                )}
                <section className="folio-case-cta">
                    <h2>
                        {ar
                            ? 'لنبنِ مشروعك القادم.'
                            : 'Let’s build your next project.'}
                    </h2>
                    <Link className="folio-button" href="/#contact">
                        {ar ? 'تواصل معي' : 'Get in touch'}
                    </Link>
                </section>
            </article>
        </PublicLayout>
    );
}
