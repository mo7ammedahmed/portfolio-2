import { Link, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import type { Paginated } from '@/types';

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="paper-grid grid min-h-64 place-items-center rounded-xl border border-dashed p-8 text-center">
            <div className="max-w-sm rounded-xl bg-card/90 p-6 shadow-sm backdrop-blur">
                <h2 className="font-editorial text-2xl">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
                {action && <div className="mt-5">{action}</div>}
            </div>
        </div>
    );
}

export function ResourceActions({
    editHref,
    deleteHref,
    label,
}: {
    editHref: string;
    deleteHref: string;
    label: string;
}) {
    return (
        <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" asChild>
                <Link href={editHref} aria-label={`Edit ${label}`}>
                    <Pencil className="size-4" />
                </Link>
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                aria-label={`Delete ${label}`}
                onClick={() => {
                    if (
                        window.confirm(
                            `Delete “${label}”? This cannot be undone.`,
                        )
                    ) {
                        router.delete(deleteHref, { preserveScroll: true });
                    }
                }}
            >
                <Trash2 className="size-4" />
            </Button>
        </div>
    );
}

export function Pagination<T>({ pagination }: { pagination: Paginated<T> }) {
    if (pagination.last_page <= 1) {
        return null;
    }

    return (
        <nav
            aria-label="Pagination"
            className="mt-6 flex flex-wrap items-center gap-2"
        >
            {pagination.links.map((link, index) =>
                link.url ? (
                    <Button
                        key={`${link.label}-${index}`}
                        variant={link.active ? 'default' : 'outline'}
                        size="sm"
                        asChild
                    >
                        <Link
                            href={link.url}
                            preserveScroll
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    </Button>
                ) : (
                    <span
                        key={`${link.label}-${index}`}
                        className="px-2 text-sm text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ),
            )}
        </nav>
    );
}
