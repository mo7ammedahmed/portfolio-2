import { Head, Link } from '@inertiajs/react';
import { ProjectDetails } from '@/components/portfolio/project-details';
import { localized, PublicLayout } from '@/components/portfolio/public-layout';
import type { Locale } from '@/components/portfolio/public-layout';
import type {
    PortfolioProfile,
    PortfolioProject,
    TrackingIntegration,
} from '@/types';

export default function CaseStudy({
    project,
    projects = [],
    profile,
    locale,
    trackingIntegrations,
}: {
    project: PortfolioProject;
    projects?: PortfolioProject[];
    profile: PortfolioProfile;
    locale: Locale;
    trackingIntegrations: TrackingIntegration[];
}) {
    const ar = locale === 'ar';
    const current = projects.findIndex((item) => item.id === project.id);
    const next =
        projects.length > 1 ? projects[(current + 1) % projects.length] : null;

    return (
        <PublicLayout
            profile={profile}
            locale={locale}
            trackingIntegrations={trackingIntegrations}
        >
            <Head title={localized(project, 'name', locale)} />
            <article className="folio-case">
                <Link className="folio-text-link" href="/#work">
                    {ar ? 'العودة إلى الأعمال' : 'Back to work'} ↗
                </Link>
                <div className="folio-case-heading">
                    <p className="folio-kicker">
                        {ar ? 'خلف تفاصيل المشروع' : 'Behind the project'} /{' '}
                        {String(current + 1).padStart(2, '0')}
                    </p>
                    <h1>{localized(project, 'name', locale)}</h1>
                </div>
                <ProjectDetails project={project} locale={locale} />
                {next && (
                    <section className="mt-16 border-t pt-8">
                        <p className="folio-kicker">
                            {ar ? 'المشروع التالي' : 'Next project'}
                        </p>
                        <Link
                            className="mt-3 block text-3xl underline decoration-1 underline-offset-8"
                            href={`/work/${next.slug}`}
                        >
                            {localized(next, 'name', locale)} ↗
                        </Link>
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
