import { Link } from '@inertiajs/react';
import { ArrowUpRight } from 'lucide-react';
import type { PortfolioProject } from '@/types';
import { localized } from './public-layout';
import type { Locale } from './public-layout';

export function ProjectGrid({
    projects,
    locale,
}: {
    projects: PortfolioProject[];
    locale: Locale;
}) {
    const ar = locale === 'ar';

    return (
        <div className="folio-projects">
            {projects.map((project, index) => (
                <article key={project.id} className="folio-project">
                    <Link
                        className="folio-project-image"
                        href={`/work/${project.slug}`}
                        aria-label={`${ar ? 'دراسة حالة' : 'Case study'}: ${localized(project, 'name', locale)}`}
                    >
                        {project.image_url ? (
                            <img
                                src={project.image_url}
                                alt={localized(project, 'name', locale)}
                                width={1440}
                                height={1000}
                                loading={index === 0 ? 'eager' : 'lazy'}
                                decoding="async"
                            />
                        ) : (
                            <span>{localized(project, 'name', locale)}</span>
                        )}
                        <span className="folio-image-action">
                            <ArrowUpRight aria-hidden size={24} />
                        </span>
                    </Link>
                    <div className="folio-project-meta">
                        <span>
                            {project.category &&
                                localized(project.category, 'name', locale)}
                        </span>
                        <span>
                            {project.status === 'completed'
                                ? ar
                                    ? 'مكتمل'
                                    : 'Completed'
                                : ar
                                  ? 'قيد التطوير'
                                  : 'In development'}
                        </span>
                    </div>
                    <h3>
                        <Link href={`/work/${project.slug}`}>
                            {localized(project, 'name', locale)}
                        </Link>
                    </h3>
                    <p>{localized(project, 'description', locale)}</p>
                    {localized(project, 'role', locale) && (
                        <p className="folio-role">
                            {localized(project, 'role', locale)}
                        </p>
                    )}
                    <ul
                        className="folio-tags"
                        aria-label={ar ? 'التقنيات' : 'Technologies'}
                    >
                        {project.skills.map((skill) => (
                            <li key={skill.name_en}>
                                {localized(skill, 'name', locale)}
                            </li>
                        ))}
                    </ul>
                    <Link
                        className="folio-text-link"
                        href={`/work/${project.slug}`}
                    >
                        {ar ? 'اقرأ دراسة الحالة' : 'Read case study'}{' '}
                        <ArrowUpRight aria-hidden size={17} />
                    </Link>
                </article>
            ))}
        </div>
    );
}
