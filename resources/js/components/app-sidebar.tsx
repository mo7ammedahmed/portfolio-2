import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BriefcaseBusiness,
    FolderKanban,
    LayoutGrid,
    MessageSquare,
    RadioTower,
    Shapes,
    Sparkles,
    UserRound,
    UsersRound,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { analytics as analyticsIndex, team } from '@/routes/portfolio';
import { index as categoriesIndex } from '@/routes/portfolio/categories';
import { index as experiencesIndex } from '@/routes/portfolio/experiences';
import { index as integrationsIndex } from '@/routes/portfolio/integrations';
import { index as messagesIndex } from '@/routes/portfolio/messages';
import { edit as profileEdit } from '@/routes/portfolio/profile';
import { index as projectsIndex } from '@/routes/portfolio/projects';
import { index as skillsIndex } from '@/routes/portfolio/skills';
import type { NavItem } from '@/types';

type PermissionNavItem = NavItem & {
    permission?: string;
    ownerOnly?: boolean;
};

const mainNavItems: PermissionNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Team access',
        href: team(),
        icon: UsersRound,
        ownerOnly: true,
    },
    {
        title: 'Analytics',
        href: analyticsIndex(),
        icon: Activity,
        permission: 'portfolio.analytics',
    },
    {
        title: 'Pixels & integrations',
        href: integrationsIndex(),
        icon: RadioTower,
        permission: 'portfolio.profile',
    },
    {
        title: 'Messages',
        href: messagesIndex(),
        icon: MessageSquare,
        permission: 'portfolio.messages',
    },
    {
        title: 'Profile',
        href: profileEdit(),
        icon: UserRound,
        permission: 'portfolio.profile',
    },
    {
        title: 'Projects',
        href: projectsIndex(),
        icon: FolderKanban,
        permission: 'portfolio.projects',
    },
    {
        title: 'Experience',
        href: experiencesIndex(),
        icon: BriefcaseBusiness,
        permission: 'portfolio.experiences',
    },
    {
        title: 'Skills',
        href: skillsIndex(),
        icon: Sparkles,
        permission: 'portfolio.skills',
    },
    {
        title: 'Categories',
        href: categoriesIndex(),
        icon: Shapes,
        permission: 'portfolio.categories',
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'View live portfolio',
        href: '/',
        icon: Sparkles,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    const visibleNavItems = mainNavItems.filter((item) => {
        if (item.ownerOnly) {
            return auth.user?.is_owner;
        }

        return (
            !item.permission ||
            auth.user?.is_owner ||
            auth.user?.permissions.includes(item.permission)
        );
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
