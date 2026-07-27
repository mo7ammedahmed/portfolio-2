import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    BriefcaseBusiness,
    Clock3,
    Eye,
    FolderKanban,
    Monitor,
    MousePointerClick,
    Smartphone,
    Sparkles,
    Tablet,
    Users,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { PageHeading } from '@/components/admin/page-heading';
import { Button } from '@/components/ui/button';
import { dashboard } from '@/routes';
import { analytics as analyticsIndex } from '@/routes/portfolio';
import { edit as profileEdit } from '@/routes/portfolio/profile';
import {
    create as projectCreate,
    edit as projectEdit,
    index as projectsIndex,
} from '@/routes/portfolio/projects';

type DailyPoint = {
    date: string;
    label: string;
    visitors: number;
    sessions: number;
    pageViews: number;
};

type Analytics = {
    summary: {
        visitors: number;
        sessions: number;
        pageViews: number;
        averageDuration: number;
        visitorsToday: number;
    };
    daily: DailyPoint[];
    topPages: {
        path: string;
        views: number;
        averageDuration: number;
    }[];
    recentVisitors: {
        id: number;
        visitor: string;
        startedAt: string;
        lastSeenAt: string;
        durationSeconds: number;
        pageViews: number;
        landingPage: string;
        lastPage: string | null;
        browser: string;
        platform: string;
        deviceType: string;
        source: string;
    }[];
};

type Props = {
    metrics: {
        projects: number;
        featuredProjects: number;
        experiences: number;
        skills: number;
        profileComplete: boolean;
    };
    recentProjects: {
        id: number;
        name_en: string;
        is_visible: boolean;
        updated_at: string;
    }[];
    analytics: Analytics;
};

export default function Dashboard({
    metrics,
    recentProjects,
    analytics,
}: Props) {
    const contentCards = [
        {
            label: 'Projects',
            value: metrics.projects,
            note: `${metrics.featuredProjects} featured`,
            icon: FolderKanban,
        },
        {
            label: 'Experience',
            value: metrics.experiences,
            note: 'timeline entries',
            icon: BriefcaseBusiness,
        },
        {
            label: 'Skills',
            value: metrics.skills,
            note: 'capabilities listed',
            icon: Sparkles,
        },
    ];
    const summaryCards = [
        {
            label: 'Unique visitors',
            value: analytics.summary.visitors.toLocaleString(),
            note: `+${analytics.summary.visitorsToday} today`,
            icon: Users,
        },
        {
            label: 'Sessions',
            value: analytics.summary.sessions.toLocaleString(),
            note: 'all time',
            icon: Activity,
        },
        {
            label: 'Page views',
            value: analytics.summary.pageViews.toLocaleString(),
            note: `${(
                analytics.summary.pageViews /
                Math.max(analytics.summary.sessions, 1)
            ).toFixed(1)} per session`,
            icon: MousePointerClick,
        },
        {
            label: 'Average time',
            value: formatDuration(analytics.summary.averageDuration),
            note: 'per session',
            icon: Clock3,
        },
    ];

    return (
        <>
            <Head title="Portfolio studio" />
            <div className="mx-auto w-full max-w-7xl p-5 sm:p-8">
                <PageHeading
                    eyebrow="Portfolio studio"
                    title="Control room"
                    description="Manage your portfolio, shape its visual system, and understand how people engage with your work."
                    action={
                        <Button asChild>
                            <Link href={projectCreate()}>
                                Add project
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    }
                />

                {!metrics.profileComplete && (
                    <Link
                        href={profileEdit()}
                        className="mt-8 flex flex-col justify-between gap-4 rounded-xl border border-primary/40 bg-primary/10 p-5 sm:flex-row sm:items-center"
                    >
                        <div>
                            <p className="font-semibold">
                                Complete your public profile
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add your identity, contact details, and visual
                                theme before collecting analytics.
                            </p>
                        </div>
                        <ArrowRight className="size-5 text-highlight" />
                    </Link>
                )}

                <section className="mt-8">
                    <div className="mb-4 flex items-end justify-between gap-4">
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                                Audience / live collector
                            </p>
                            <h2 className="mt-2 font-editorial text-3xl tracking-tight">
                                Portfolio analytics
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="hidden items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:flex">
                                <span className="relative flex size-2">
                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:animate-none" />
                                    <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                                </span>
                                Collecting first-party data
                            </span>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={analyticsIndex()}>
                                    Detailed analytics
                                    <ArrowRight className="size-3.5" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {summaryCards.map((card) => (
                            <MetricCard key={card.label} {...card} />
                        ))}
                    </div>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(18rem,.75fr)]">
                        <section className="overflow-hidden rounded-xl border bg-card">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4">
                                <div>
                                    <h3 className="font-semibold">
                                        Traffic pulse
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Unique visitors and page views · last 14
                                        days
                                    </p>
                                </div>
                                <div className="flex gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-highlight" />
                                        Visitors
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <span className="size-2 rounded-full bg-foreground/35" />
                                        Views
                                    </span>
                                </div>
                            </div>
                            <TrafficChart points={analytics.daily} />
                        </section>

                        <section className="rounded-xl border bg-card p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">Top pages</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Views and average attention
                                    </p>
                                </div>
                                <Eye className="size-4 text-highlight" />
                            </div>
                            <div className="mt-6 space-y-5">
                                {analytics.topPages.length ? (
                                    analytics.topPages.map((page) => {
                                        const maximum =
                                            analytics.topPages[0]?.views ?? 1;

                                        return (
                                            <div key={page.path}>
                                                <div className="flex items-center justify-between gap-3 text-xs">
                                                    <span className="truncate font-mono">
                                                        {page.path}
                                                    </span>
                                                    <span className="shrink-0 text-muted-foreground">
                                                        {page.views} ·{' '}
                                                        {formatDuration(
                                                            page.averageDuration,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-highlight"
                                                        style={{
                                                            width: `${Math.max(
                                                                8,
                                                                (page.views /
                                                                    maximum) *
                                                                    100,
                                                            )}%`,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <EmptyAnalytics />
                                )}
                            </div>
                        </section>
                    </div>

                    <section className="mt-4 overflow-hidden rounded-xl border bg-card">
                        <div className="flex items-center justify-between border-b px-5 py-4">
                            <div>
                                <h3 className="font-semibold">
                                    Recent visitor sessions
                                </h3>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Anonymous session IDs — raw IP addresses are
                                    never stored
                                </p>
                            </div>
                            <Clock3 className="size-4 text-highlight" />
                        </div>
                        {analytics.recentVisitors.length ? (
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-muted/45 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-5 py-3 font-medium">
                                                Visitor
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Device
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Source
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Last page
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Views
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Time
                                            </th>
                                            <th className="px-5 py-3 font-medium">
                                                Seen
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {analytics.recentVisitors.map(
                                            (visitor) => (
                                                <tr
                                                    key={visitor.id}
                                                    className="transition-colors hover:bg-muted/35"
                                                >
                                                    <td className="px-5 py-4 font-mono text-xs font-semibold">
                                                        {visitor.visitor}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="flex items-center gap-2">
                                                            <DeviceIcon
                                                                type={
                                                                    visitor.deviceType
                                                                }
                                                                className="size-3.5 text-muted-foreground"
                                                            />
                                                            {visitor.browser} ·{' '}
                                                            {visitor.platform}
                                                        </span>
                                                    </td>
                                                    <td className="max-w-36 truncate px-5 py-4 text-muted-foreground">
                                                        {visitor.source}
                                                    </td>
                                                    <td className="max-w-48 truncate px-5 py-4 font-mono text-xs">
                                                        {visitor.lastPage}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {visitor.pageViews}
                                                    </td>
                                                    <td className="px-5 py-4 font-medium">
                                                        {formatDuration(
                                                            visitor.durationSeconds,
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4 text-muted-foreground">
                                                        {formatRelativeTime(
                                                            visitor.lastSeenAt,
                                                        )}
                                                    </td>
                                                </tr>
                                            ),
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8">
                                <EmptyAnalytics />
                            </div>
                        )}
                    </section>
                </section>

                <section className="mt-10 border-t pt-8">
                    <div className="mb-4">
                        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                            Content / inventory
                        </p>
                        <h2 className="mt-2 font-editorial text-3xl tracking-tight">
                            Portfolio content
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {contentCards.map((card, index) => (
                            <div
                                key={card.label}
                                className="relative overflow-hidden rounded-xl border bg-card p-6"
                            >
                                <span className="absolute top-5 right-5 font-mono text-xs text-muted-foreground">
                                    0{index + 1}
                                </span>
                                <card.icon className="size-5 text-highlight" />
                                <strong className="mt-8 block font-editorial text-5xl">
                                    {card.value}
                                </strong>
                                <div className="mt-2 flex items-baseline justify-between">
                                    <span className="font-semibold">
                                        {card.label}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {card.note}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_.5fr]">
                    <section className="rounded-xl border bg-card">
                        <div className="flex items-center justify-between border-b p-5">
                            <div>
                                <h2 className="font-editorial text-2xl">
                                    Recently edited
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Continue where you left off.
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href={projectsIndex()}>All projects</Link>
                            </Button>
                        </div>
                        <div className="divide-y">
                            {recentProjects.length ? (
                                recentProjects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={projectEdit(project.id)}
                                        className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/60"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate font-semibold">
                                                {project.name_en}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Updated{' '}
                                                {new Date(
                                                    project.updated_at,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <span
                                                className={`size-2 rounded-full ${
                                                    project.is_visible
                                                        ? 'bg-emerald-500'
                                                        : 'bg-zinc-400'
                                                }`}
                                            />
                                            {project.is_visible
                                                ? 'Public'
                                                : 'Draft'}
                                        </span>
                                    </Link>
                                ))
                            ) : (
                                <p className="p-8 text-sm text-muted-foreground">
                                    No projects yet. Add the first case study to
                                    get started.
                                </p>
                            )}
                        </div>
                    </section>

                    <aside className="paper-grid rounded-xl border p-5">
                        <div className="rounded-xl bg-foreground p-6 text-background shadow-lg">
                            <Eye className="size-5 text-highlight" />
                            <h2 className="mt-10 font-editorial text-3xl">
                                See it live
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-background/60">
                                Theme and content changes are reflected on the
                                public portfolio.
                            </p>
                            <Button
                                className="mt-6 w-full bg-primary text-primary-foreground"
                                asChild
                            >
                                <a href="/" target="_blank" rel="noreferrer">
                                    Open portfolio
                                    <ArrowRight className="size-4" />
                                </a>
                            </Button>
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}

function MetricCard({
    label,
    value,
    note,
    icon: Icon,
}: {
    label: string;
    value: string;
    note: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
}) {
    return (
        <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
                <Icon className="size-4 text-highlight" />
                <span className="text-xs text-muted-foreground">{note}</span>
            </div>
            <strong className="mt-7 block font-editorial text-4xl tracking-tight">
                {value}
            </strong>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
    );
}

function TrafficChart({ points }: { points: DailyPoint[] }) {
    const width = 800;
    const height = 250;
    const paddingX = 28;
    const paddingTop = 24;
    const paddingBottom = 42;
    const plotHeight = height - paddingTop - paddingBottom;
    const maximum = Math.max(
        1,
        ...points.flatMap((point) => [point.visitors, point.pageViews]),
    );
    const x = (index: number) =>
        paddingX +
        (index / Math.max(points.length - 1, 1)) * (width - paddingX * 2);
    const y = (value: number) =>
        paddingTop + plotHeight - (value / maximum) * plotHeight;
    const line = (key: 'visitors' | 'pageViews') =>
        points
            .map(
                (point, index) =>
                    `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point[key])}`,
            )
            .join(' ');
    const visitorLine = line('visitors');
    const area = `${visitorLine} L ${x(points.length - 1)} ${
        paddingTop + plotHeight
    } L ${x(0)} ${paddingTop + plotHeight} Z`;

    return (
        <div className="px-2 pt-4 pb-2 sm:px-5">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-auto w-full overflow-visible"
                role="img"
                aria-label="Traffic over the last fourteen days"
            >
                <defs>
                    <linearGradient
                        id="visitor-area"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--primary)"
                            stopOpacity=".28"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--primary)"
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>
                {[0, 0.5, 1].map((ratio) => (
                    <line
                        key={ratio}
                        x1={paddingX}
                        x2={width - paddingX}
                        y1={paddingTop + plotHeight * ratio}
                        y2={paddingTop + plotHeight * ratio}
                        stroke="currentColor"
                        strokeOpacity=".09"
                        strokeDasharray="3 5"
                    />
                ))}
                <path d={area} fill="url(#visitor-area)" />
                <path
                    d={line('pageViews')}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity=".28"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                />
                <path
                    d={visitorLine}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {points.map((point, index) => (
                    <g key={point.date}>
                        <circle
                            cx={x(index)}
                            cy={y(point.visitors)}
                            r="3"
                            fill="var(--primary)"
                        />
                        {(index % 3 === 0 || index === points.length - 1) && (
                            <text
                                x={x(index)}
                                y={height - 12}
                                textAnchor="middle"
                                className="fill-muted-foreground text-[10px]"
                            >
                                {point.label}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
}

function EmptyAnalytics() {
    return (
        <div className="rounded-lg border border-dashed p-5 text-center">
            <Activity className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Waiting for visitors</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Open the public portfolio to record the first session.
            </p>
        </div>
    );
}

function DeviceIcon({
    type,
    ...props
}: { type: string } & SVGProps<SVGSVGElement>) {
    if (type === 'Mobile') {
        return <Smartphone {...props} />;
    }

    if (type === 'Tablet') {
        return <Tablet {...props} />;
    }

    return <Monitor {...props} />;
}

function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;

    return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
}

function formatRelativeTime(value: string): string {
    const seconds = Math.max(
        0,
        Math.round((Date.now() - new Date(value).getTime()) / 1000),
    );

    if (seconds < 60) {
        return 'now';
    }

    if (seconds < 3600) {
        return `${Math.floor(seconds / 60)}m ago`;
    }

    if (seconds < 86400) {
        return `${Math.floor(seconds / 3600)}h ago`;
    }

    return `${Math.floor(seconds / 86400)}d ago`;
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
