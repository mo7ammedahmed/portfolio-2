import { Moon, Sun } from 'lucide-react';
import { revealTheme } from '@/components/admin/motion';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { updateAppearance } = useAppearance();

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="ml-auto"
                aria-label="Toggle dark mode"
                // Read the theme at click time: the server can't know it, so
                // rendering from state would break hydration.
                onClick={(event) => {
                    const dark =
                        document.documentElement.classList.contains('dark');
                    revealTheme(event, () =>
                        updateAppearance(dark ? 'light' : 'dark'),
                    );
                }}
            >
                <Moon className="size-4 dark:hidden" />
                <Sun className="hidden size-4 dark:block" />
            </Button>
        </header>
    );
}
