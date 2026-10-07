import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { PageHeading } from '@/components/admin/page-heading';
import {
    EmptyState,
    Pagination,
    ResourceActions,
} from '@/components/admin/resource-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { create, destroy, edit, index } from '@/routes/portfolio/projects';
import type { Paginated } from '@/types';

type ProjectRow = {
    id: number;
    name_ar: string;
    name_en: string;
    image_url: string | null;
    url: string | null;
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
    created_at: string;
    category: { id: number; name_en: string; color: string } | null;
};

export default function ProjectsIndex({
    projects,
    filters,
}: {
    projects: Paginated<ProjectRow>;
    filters: { search: string; sort: string; direction: string };
}) {
    const [search, setSearch] = useState(filters.search);

    const submitSearch = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(
            index.url(),
            { search },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title="Projects" />
            <div className="mx-auto w-full max-w-7xl p-5 sm:p-8">
                <PageHeading
                    eyebrow="Case studies"
                    title="Projects"
                    description="Shape the work section: outcomes, links, technology, visibility, and order."
                    action={
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                New project
                            </Link>
                        </Button>
                    }
                />
                <form
                    onSubmit={submitSearch}
                    className="mt-8 flex max-w-md gap-2"
                >
                    <div className="relative flex-1">
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search projects"
                            className="bg-card pl-9"
                        />
                    </div>
                    <Button variant="outline">Search</Button>
                </form>

                {projects.data.length ? (
                    <>
                        <div className="mt-6 overflow-hidden rounded-xl border bg-card">
                            <div className="hidden grid-cols-[1fr_11rem_8rem_6rem] border-b bg-muted/50 px-5 py-3 text-xs font-bold tracking-wider text-muted-foreground uppercase md:grid">
                                <span>Project</span>
                                <span>Category</span>
                                <span>Status</span>
                                <span />
                            </div>
                            <div className="divide-y">
                                {projects.data.map((project) => (
                                    <div
                                        key={project.id}
                                        className="grid gap-4 p-5 md:grid-cols-[1fr_11rem_8rem_6rem] md:items-center"
                                    >
                                        <div className="flex min-w-0 items-center gap-4">
                                            <div className="paper-grid grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg border bg-muted">
                                                {project.image_url ? (
                                                    <img
                                                        src={project.image_url}
                                                        alt=""
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="font-editorial text-lg">
                                                        {project.name_en.slice(
                                                            0,
                                                            2,
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">
                                                    {project.name_en}
                                                </p>
                                                <p
                                                    className="truncate text-sm text-muted-foreground"
                                                    dir="rtl"
                                                >
                                                    {project.name_ar}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            {project.category ? (
                                                <>
                                                    <span
                                                        className="size-2 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                project.category
                                                                    .color,
                                                        }}
                                                    />
                                                    {project.category.name_en}
                                                </>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    Uncategorised
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2 text-xs">
                                            <span
                                                className={`rounded-full px-2 py-1 ${project.is_visible ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200' : 'bg-muted text-muted-foreground'}`}
                                            >
                                                {project.is_visible
                                                    ? 'Public'
                                                    : 'Draft'}
                                            </span>
                                            {project.is_featured && (
                                                <span className="rounded-full bg-primary/15 px-2 py-1 text-highlight">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <ResourceActions
                                            editHref={edit.url(project.id)}
                                            deleteHref={destroy.url(project.id)}
                                            label={project.name_en}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Pagination pagination={projects} />
                    </>
                ) : (
                    <div className="mt-8">
                        <EmptyState
                            title={
                                filters.search
                                    ? 'No matching projects'
                                    : 'Build your first case study'
                            }
                            description={
                                filters.search
                                    ? 'Try a different search term.'
                                    : 'Projects are the proof behind your positioning. Add one with a clear challenge and result.'
                            }
                            action={
                                !filters.search && (
                                    <Button asChild>
                                        <Link href={create()}>
                                            Add a project
                                        </Link>
                                    </Button>
                                )
                            }
                        />
                    </div>
                )}
            </div>
        </>
    );
}

ProjectsIndex.layout = {
    breadcrumbs: [{ title: 'Projects', href: index() }],
};
