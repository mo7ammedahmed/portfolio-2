import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    // Shell stays still; only the page region re-enters when the page changes.
    const { component } = usePage();

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="studio overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div
                    key={component}
                    className="studio-page flex flex-1 flex-col"
                >
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
