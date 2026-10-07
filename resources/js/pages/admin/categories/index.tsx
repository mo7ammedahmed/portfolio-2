import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PageHeading } from '@/components/admin/page-heading';
import {
    EmptyState,
    Pagination,
    ResourceActions,
} from '@/components/admin/resource-ui';
import { Button } from '@/components/ui/button';
import { create, destroy, edit, index } from '@/routes/portfolio/categories';
import type { Paginated } from '@/types';

type CategoryRow = {
    id: number;
    name_ar: string;
    name_en: string;
    description_en: string;
    color: string;
    is_visible: boolean;
    sort_order: number;
    projects_count: number;
};

export default function CategoriesIndex({
    categories,
}: {
    categories: Paginated<CategoryRow>;
}) {
    return (
        <>
            <Head title="Categories" />
            <div className="mx-auto w-full max-w-6xl p-5 sm:p-8">
                <PageHeading
                    eyebrow="Taxonomy"
                    title="Categories"
                    description="Create a small, intentional set of labels that helps visitors understand the kinds of work you do."
                    action={
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                New category
                            </Link>
                        </Button>
                    }
                />
                {categories.data.length ? (
                    <>
                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {categories.data.map((category) => (
                                <article
                                    key={category.id}
                                    className="rounded-xl border bg-card p-5"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-3">
                                            <span
                                                className="mt-1 size-4 shrink-0 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        category.color,
                                                }}
                                            />
                                            <div>
                                                <h2 className="font-editorial text-2xl">
                                                    {category.name_en}
                                                </h2>
                                                <p
                                                    className="mt-1 text-sm text-muted-foreground"
                                                    dir="rtl"
                                                >
                                                    {category.name_ar}
                                                </p>
                                            </div>
                                        </div>
                                        <ResourceActions
                                            editHref={edit.url(category.id)}
                                            deleteHref={destroy.url(
                                                category.id,
                                            )}
                                            label={category.name_en}
                                        />
                                    </div>
                                    <p className="mt-5 line-clamp-2 text-sm leading-6 text-muted-foreground">
                                        {category.description_en}
                                    </p>
                                    <div className="mt-5 flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                                        <span>
                                            {category.projects_count} projects
                                        </span>
                                        <span>
                                            {category.is_visible
                                                ? 'Public'
                                                : 'Hidden'}{' '}
                                            · Order {category.sort_order}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <Pagination pagination={categories} />
                    </>
                ) : (
                    <div className="mt-8">
                        <EmptyState
                            title="No categories yet"
                            description="Add two or three broad focus areas for a clean, useful portfolio structure."
                            action={
                                <Button asChild>
                                    <Link href={create()}>
                                        Create a category
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

CategoriesIndex.layout = {
    breadcrumbs: [{ title: 'Categories', href: index() }],
};
