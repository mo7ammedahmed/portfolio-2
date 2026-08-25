import type { ReactNode } from 'react';

export function PageHeading({
    eyebrow,
    title,
    description,
    action,
}: {
    eyebrow: string;
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <header className="flex flex-col gap-5 border-b pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
                <p className="mb-2 text-xs font-bold tracking-[0.22em] text-highlight uppercase">
                    {eyebrow}
                </p>
                <h1 className="font-editorial text-4xl leading-none tracking-tight sm:text-5xl">
                    {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
                    {description}
                </p>
            </div>
            {action}
        </header>
    );
}
