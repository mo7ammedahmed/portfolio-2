import { useState } from 'react';
import { projectRepositories } from '@/lib/project-repositories';
import type { PortfolioProject } from '@/types';
import { localized } from './public-layout';
import type { Locale } from './public-layout';

export function ProjectImage({
    src,
    alt,
    className = '',
    priority = false,
}: {
    src: string;
    alt: string;
    className?: string;
    priority?: boolean;
}) {
    const [failed, setFailed] = useState(false);

    return failed ? (
        <div
            role="img"
            aria-label={alt}
            className={`grid place-items-center bg-current/5 p-6 text-center ${className}`}
        >
            <span>{alt}</span>
        </div>
    ) : (
        <img
            src={src}
            alt={alt}
            width={1440}
            height={1000}
            loading={priority ? 'eager' : 'lazy'}
            onError={() => setFailed(true)}
            className={className}
        />
    );
}

export function ProjectDetails({
    project,
    locale,
}: {
    project: PortfolioProject;
    locale: Locale;
}) {
    const ar = locale === 'ar';
    const sections = [
        ['role', ar ? 'دوري في المشروع' : 'My contribution'],
        ['challenge', ar ? 'التحدي' : 'The challenge'],
        ['solution', ar ? 'الحل والتنفيذ' : 'Approach & implementation'],
        ['outcomes', ar ? 'ما يقدمه المشروع' : 'What the project delivers'],
    ];

    return (
        <div className="project-details space-y-8">
            <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="rounded-full border px-3 py-1">
                    {project.status === 'completed'
                        ? ar
                            ? 'مكتمل'
                            : 'Completed'
                        : ar
                          ? 'قيد التطوير'
                          : 'In development'}
                </span>
                {project.category && (
                    <span>{localized(project.category, 'name', locale)}</span>
                )}
            </div>
            <p className="text-base leading-8 whitespace-pre-line">
                {localized(project, 'description', locale)}
            </p>
            <div className="flex flex-wrap gap-3">
                {project.url && (
                    <a
                        className="rounded-full border px-4 py-2 underline underline-offset-4"
                        href={project.url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {ar ? 'زيارة الموقع ↗' : 'Visit website ↗'}
                    </a>
                )}
                {projectRepositories(project).map((link) => (
                    <a
                        key={link.url}
                        className="rounded-full border px-4 py-2 underline underline-offset-4"
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {link.label} ↗
                    </a>
                ))}
            </div>
            {!!project.skills.length && (
                <ul
                    aria-label={ar ? 'التقنيات' : 'Technologies'}
                    className="flex flex-wrap gap-2"
                >
                    {project.skills.map((skill) => (
                        <li
                            className="rounded-lg bg-current/5 px-3 py-2 text-sm"
                            key={skill.name_en}
                        >
                            {localized(skill, 'name', locale)}
                        </li>
                    ))}
                </ul>
            )}
            {project.image_url && (
                <ProjectImage
                    key={project.image_url}
                    src={project.image_url}
                    alt={localized(project, 'name', locale)}
                    className="aspect-[16/10] w-full rounded-xl border object-contain"
                    priority
                />
            )}
            <div className="grid gap-8 md:grid-cols-2">
                {sections
                    .filter(([field]) => localized(project, field, locale))
                    .map(([field, title], index) => (
                        <section key={field} className="border-t pt-5">
                            <span className="text-xs opacity-60">
                                0{index + 1}
                            </span>
                            <h2 className="my-3 text-xl font-medium">
                                {title}
                            </h2>
                            <p className="leading-8 whitespace-pre-line opacity-85">
                                {localized(project, field, locale)}
                            </p>
                        </section>
                    ))}
            </div>
            {!!project.images.length && (
                <section
                    aria-label={ar ? 'صور المشروع' : 'Project gallery'}
                    className="grid gap-6"
                >
                    {project.images.map((image) => (
                        <figure key={image.id}>
                            <a
                                href={image.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <ProjectImage
                                    src={image.url}
                                    alt={localized(image, 'alt', locale)}
                                    className="w-full rounded-xl border object-contain"
                                />
                            </a>
                            <figcaption className="mt-2 text-sm opacity-70">
                                {localized(image, 'alt', locale)}
                            </figcaption>
                        </figure>
                    ))}
                </section>
            )}
        </div>
    );
}
