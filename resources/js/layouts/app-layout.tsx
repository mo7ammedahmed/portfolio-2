import { usePage } from '@inertiajs/react';

import { useDashboardPalette } from '@/hooks/use-dashboard-palette';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';

export default function AppLayout({
    breadcrumbs = [],
    children,
}: {
    breadcrumbs?: BreadcrumbItem[];
    children: React.ReactNode;
}) {
    const { portfolioTheme } = usePage().props;

    useDashboardPalette(portfolioTheme);

    return (
        <AppLayoutTemplate breadcrumbs={breadcrumbs}>
            {children}
        </AppLayoutTemplate>
    );
}
