import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
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
    started_at: string;
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
                            <div className="divide-y">
                                {experiences.data.map(
                                    (experience, position) => (
                                        <div
                                            key={experience.id}
                                            className="grid gap-4 p-5 md:grid-cols-[3rem_1fr_12rem_6rem] md:items-center"
                                        >
                                            <span className="font-mono text-xs text-highlight">
                                                {String(position + 1).padStart(
                                                    2,
                                                    '0',
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
                                            <div className="text-sm text-muted-foreground">
                                                {experience.started_at.slice(
                                                    0,
                                                    7,
                                                )}{' '}
                                                —{' '}
                                                {experience.is_current
                                                    ? 'Present'
                                                    : experience.ended_at?.slice(
                                                          0,
                                                          7,
                                                      )}
                                                {!experience.is_visible && (
                                                    <span className="ms-2 rounded-full bg-muted px-2 py-1 text-xs">
                                                        Draft
                                                    </span>
                                                )}
                                            </div>
                                            <ResourceActions
                                                editHref={edit.url(
                                                    experience.id,
                                                )}
                                                deleteHref={destroy.url(
                                                    experience.id,
                                                )}
                                                label={experience.name_en}
                                            />
                                        </div>
                                    ),
                                )}
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
