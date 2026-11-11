import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import type { CSSProperties } from 'react';
import { hueOf, initials } from '@/components/admin/motion';
import { PageHeading } from '@/components/admin/page-heading';
import {
    EmptyState,
    Pagination,
    ResourceActions,
} from '@/components/admin/resource-ui';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/portfolio/experiences';
import type { Paginated } from '@/types';

type ExperienceRow = {
    id: number;
    name_en: string;
    name_ar: string;
    company_en: string;
    location_en: string;
    started_at: string | null;
    display_year: number | null;
    ended_at: string | null;
    is_current: boolean;
    is_visible: boolean;
};

export default function ExperiencesIndex({
    experiences,
}: {
    experiences: Paginated<ExperienceRow>;
}) {
    return (
        <>
            <Head title="Experience" />
            <div className="mx-auto w-full max-w-6xl p-5 sm:p-8">
                <PageHeading
                    eyebrow="Career timeline"
                    title="Experience"
                    description="Tell the story of where you contributed, what you owned, and how your work created value."
                    action={
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                New role
                            </Link>
                        </Button>
                    }
                />
                {experiences.data.length ? (
                    <>
                        <div className="mt-8 overflow-hidden rounded-xl border bg-card">
                            <div className="studio-timeline divide-y">
                                {experiences.data.map((experience) => (
                                    <div
                                        key={experience.id}
                                        className="grid gap-4 p-5 md:grid-cols-[3rem_1fr_14rem_6rem] md:items-center"
                                    >
                                        <span
                                            className="studio-avatar"
                                            style={
                                                {
                                                    '--h': hueOf(
                                                        experience.company_en ||
                                                            experience.name_en,
                                                    ),
                                                } as CSSProperties
                                            }
                                            aria-hidden
                                        >
                                            {initials(
                                                experience.company_en ||
                                                    experience.name_en,
                                            )}
                                        </span>
                                        <div>
                                            <p className="font-semibold">
                                                {experience.name_en}
                                            </p>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {experience.company_en} ·{' '}
                                                {experience.location_en}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                            <span className="tabular-nums">
                                                {experience.started_at?.slice(
                                                    0,
                                                    7,
                                                ) ?? experience.display_year}
                                                {(experience.started_at ||
                                                    experience.display_year) &&
                                                experience.ended_at &&
                                                !experience.is_current
                                                    ? ` — ${experience.ended_at.slice(0, 7)}`
                                                    : ''}
                                            </span>
                                            {experience.is_current && (
                                                <span className="studio-pill is-live">
                                                    Present
                                                </span>
                                            )}
                                            {!experience.is_visible && (
                                                <span className="studio-pill">
                                                    Draft
                                                </span>
                                            )}
                                        </div>
                                        <ResourceActions
                                            editHref={edit.url(experience.id)}
                                            deleteHref={destroy.url(
                                                experience.id,
                                            )}
                                            label={experience.name_en}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Pagination pagination={experiences} />
                    </>
                ) : (
                    <div className="mt-8">
                        <EmptyState
                            title="No experience yet"
                            description="Add roles in reverse chronological order to build your professional timeline."
                            action={
                                <Button asChild>
                                    <Link href={create()}>
                                        Add your first role
                                    </Link>
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>
        </>
    );
}

ExperiencesIndex.layout = {
    breadcrumbs: [{ title: 'Experience', href: index() }],
};
