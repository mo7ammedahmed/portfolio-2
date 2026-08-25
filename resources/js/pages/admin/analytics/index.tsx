import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Clock3,
    Eye,
    Globe2,
    Monitor,
    MousePointerClick,
    Repeat2,
    Smartphone,
    Tablet,
    Users,
} from 'lucide-react';
import type { ComponentType, ReactNode, SVGProps } from 'react';
import { PageHeading } from '@/components/admin/page-heading';
import { PageViewsChart } from '@/components/analytics/PageViewsChart';
import { analytics as analyticsIndex } from '@/routes/portfolio';
import { edit as profileEdit } from '@/routes/portfolio/profile';

type Metric = {
    value: number;
    change: number | null;
};

type DailyPoint = {
    date: string;
    label: string;
    visitors: number;
    sessions: number;
    pageViews: number;
};

type BreakdownItem = {
    label: string;
    value: number;
    percentage: number;
};

type RecentSession = {
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
    language: string | null;
    timezone: string | null;
    screen: string | null;
    source: string;
};

type Props = {
    hasProfile: boolean;
    filters: {
        period: number;
        availablePeriods: number[];
        startsAt: string;
        endsAt: string;
    };
    analytics: {
        summary: {
            visitors: Metric;
            sessions: Metric;
            pageViews: Metric;
            averageDuration: Metric;
            bounceRate: Metric;
            returningVisitors: Metric;
        };
        daily: DailyPoint[];
        topPages: {
            path: string;
            views: number;
            sessions: number;
            averageDuration: number;
        }[];
        landingPages: BreakdownItem[];
        exitPages: BreakdownItem[];
        sources: BreakdownItem[];
        campaigns: BreakdownItem[];
        devices: BreakdownItem[];
        browsers: BreakdownItem[];
        platforms: BreakdownItem[];
        regions: BreakdownItem[];
        languages: BreakdownItem[];
        recentSessions: RecentSession[];
    };
};

export default function Analytics({ hasProfile, filters, analytics }: Props) {
    const summaryCards = [
        {
            label: 'Unique visitors',
            value: analytics.summary.visitors.value.toLocaleString(),
            metric: analytics.summary.visitors,
            note: 'Anonymous people',
            icon: Users,
        },
        {
            label: 'Sessions',
            value: analytics.summary.sessions.value.toLocaleString(),
            metric: analytics.summary.sessions,
            note: 'Portfolio visits',
            icon: Activity,
        },
        {
            label: 'Page views',
            value: analytics.summary.pageViews.value.toLocaleString(),
            metric: analytics.summary.pageViews,
            note: `${(
                analytics.summary.pageViews.value /
                Math.max(analytics.summary.sessions.value, 1)
            ).toFixed(1)} per session`,
            icon: MousePointerClick,
        },
        {
            label: 'Average session',
            value: formatDuration(analytics.summary.averageDuration.value),
            metric: analytics.summary.averageDuration,
            note: 'Attention time',
            icon: Clock3,
        },
        {
            label: 'Bounce rate',
            value: `${analytics.summary.bounceRate.value.toFixed(1)}%`,
            metric: analytics.summary.bounceRate,
            note: 'Single-page sessions',
            icon: Eye,
            inverse: true,
        },
        {
            label: 'Returning visitors',
            value: analytics.summary.returningVisitors.value.toLocaleString(),
            metric: analytics.summary.returningVisitors,
            note: 'Visited more than once',
            icon: Repeat2,
        },
    ];

    return (
        <>
            <Head title="Portfolio analytics" />
            <div className="mx-auto w-full max-w-7xl p-5 sm:p-8">
                <PageHeading
                    eyebrow="Audience intelligence"
                    title="Analytics"
                    description="Understand how visitors discover your portfolio, what earns attention, and where engagement changes."
                    action={
                        <PeriodSelector
                            periods={filters.availablePeriods}
                            selected={filters.period}
                        />
                    }
                />

                {!hasProfile && (
                    <Link
                        href={profileEdit()}
                        className="mt-6 flex items-center justify-between gap-5 rounded-xl border border-primary/35 bg-primary/10 p-5 transition-colors hover:bg-primary/15"
                    >
                        <div>
                            <p className="font-semibold">
                                Publish your profile to start collecting data
                            </p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Analytics are scoped to your public portfolio
                                profile.
                            </p>
                        </div>
                        <ArrowUpRight className="size-5 shrink-0 text-highlight" />
                    </Link>
                )}

                <section className="mt-7" aria-labelledby="analytics-overview">
                    <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                                Performance / {filters.period} days
                            </p>
                            <h2
                                id="analytics-overview"
                                className="mt-2 font-editorial text-3xl tracking-tight"
                            >
                                Portfolio pulse
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {formatDate(filters.startsAt)} —{' '}
                            {formatDate(filters.endsAt)}
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                        {summaryCards.map((card) => (
                            <SummaryCard key={card.label} {...card} />
                        ))}
                    </div>
                </section>

                    <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(19rem,.72fr)]">
                    <section className="overflow-hidden rounded-xl border bg-card">
                        <PanelHeader
                            title="Page Views over Time"
                            description="Daily page views across the selected period"
                            aside={
                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground">
                                    <Legend
                                        color="bg-foreground/25"
                                        label="Views"
                                    />
                                </div>
                            }
                        />
                        <PageViewsChart data={analytics.daily.map(day => ({ date: day.date, count: day.pageViews }))} />
                    </section>

                    <BreakdownPanel
                        title="Traffic sources"
                        description="Where sessions originated"
                        items={analytics.sources}
                        icon={Globe2}
                    />
                </div>

                <section className="mt-10" aria-labelledby="audience-breakdown">
                    <div className="mb-4">
                        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                            Audience / environment
                        </p>
                        <h2
                            id="audience-breakdown"
                            className="mt-2 font-editorial text-3xl tracking-tight"
                        >
                            Who is visiting
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <BreakdownPanel
                            title="Devices"
                            description="Desktop, mobile, and tablet"
                            items={analytics.devices}
                            icon={Monitor}
                        />
                        <BreakdownPanel
                            title="Browsers"
                            description="Browser distribution"
                            items={analytics.browsers}
                        />
                        <BreakdownPanel
                            title="Platforms"
                            description="Operating systems"
                            items={analytics.platforms}
                        />
                        <BreakdownPanel
                            title="Regions"
                            description="Visitor timezones"
                            items={analytics.regions}
                            icon={Globe2}
                        />
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <BreakdownPanel
                            title="Languages"
                            description="Browser language preferences"
                            items={analytics.languages}
                        />
                        <BreakdownPanel
                            title="Campaigns"
                            description="Tracked UTM campaigns"
                            items={analytics.campaigns}
                        />
                    </div>
                </section>

                <section
                    className="mt-10"
                    aria-labelledby="content-performance"
                >
                    <div className="mb-4">
                        <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                            Content / attention
                        </p>
                        <h2
                            id="content-performance"
                            className="mt-2 font-editorial text-3xl tracking-tight"
                        >
                            What visitors explore
                        </h2>
                    </div>

                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,.75fr)]">
                        <section className="overflow-hidden rounded-xl border bg-card">
                            <PanelHeader
                                title="Page performance"
                                description="Views, sessions, and average attention per section"
                            />
                            {analytics.topPages.length ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[620px] text-left text-sm">
                                        <thead className="bg-muted/45 text-[10px] tracking-[0.12em] text-muted-foreground uppercase">
                                            <tr>
                                                <th className="px-5 py-3 font-medium">
                                                    Page
                                                </th>
                                                <th className="px-5 py-3 text-right font-medium">
                                                    Views
                                                </th>
                                                <th className="px-5 py-3 text-right font-medium">
                                                    Sessions
                                                </th>
                                                <th className="px-5 py-3 text-right font-medium">
                                                    Avg. attention
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {analytics.topPages.map((page) => (
                                                <tr
                                                    key={page.path}
                                                    className="transition-colors hover:bg-muted/35"
                                                >
                                                    <td className="max-w-72 truncate px-5 py-4 font-mono text-xs font-semibold">
                                                        {page.path}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        {page.views}
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        {page.sessions}
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-medium">
                                                        {formatDuration(
                                                            page.averageDuration,
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <EmptyState compact />
                            )}
                        </section>

                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
                            <BreakdownPanel
                                title="Landing pages"
                                description="First section in each session"
                                items={analytics.landingPages}
                            />
                            <BreakdownPanel
                                title="Exit pages"
                                description="Last section seen before leaving"
                                items={analytics.exitPages}
                            />
                        </div>
                    </div>
                </section>

                <section className="mt-10 overflow-hidden rounded-xl border bg-card">
                    <PanelHeader
                        title="Recent sessions"
                        description="Anonymous session detail. Raw IP addresses are never stored."
                        aside={
                            <span className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                First-party collector
                            </span>
                        }
                    />
                    {analytics.recentSessions.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1050px] text-left text-sm">
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
                                            Journey
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Views
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Time
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Region
                                        </th>
                                        <th className="px-5 py-3 font-medium">
                                            Seen
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {analytics.recentSessions.map((session) => (
                                        <tr
                                            key={session.id}
                                            className="transition-colors hover:bg-muted/35"
                                        >
                                            <td className="px-5 py-4 font-mono text-xs font-semibold">
                                                {session.visitor}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="flex items-center gap-2">
                                                    <DeviceIcon
                                                        type={
                                                            session.deviceType
                                                        }
                                                        className="size-3.5 text-highlight"
                                                    />
                                                    <span>
                                                        {session.browser} ·{' '}
                                                        {session.platform}
                                                        {session.screen && (
                                                            <small className="mt-0.5 block text-[10px] text-muted-foreground">
                                                                {session.screen}
                                                            </small>
                                                        )}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="max-w-36 truncate px-5 py-4 text-muted-foreground">
                                                {session.source}
                                            </td>
                                            <td className="max-w-64 px-5 py-4">
                                                <span className="block truncate font-mono text-xs">
                                                    {session.landingPage}
                                                </span>
                                                <span className="mt-1 block truncate font-mono text-[10px] text-muted-foreground">
                                                    →{' '}
                                                    {session.lastPage ??
                                                        session.landingPage}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {session.pageViews}
                                            </td>
                                            <td className="px-5 py-4 font-medium">
                                                {formatDuration(
                                                    session.durationSeconds,
                                                )}
                                            </td>
                                            <td className="max-w-40 truncate px-5 py-4 text-muted-foreground">
                                                {session.timezone ?? 'Unknown'}
                                            </td>
                                            <td className="px-5 py-4 text-muted-foreground">
                                                {formatRelativeTime(
                                                    session.lastSeenAt,
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState />
                    )}
                </section>
            </div>
        </>
    );
}

function PeriodSelector({
    periods,
    selected,
}: {
    periods: number[];
    selected: number;
}) {
    return (
        <nav
            aria-label="Analytics period"
            className="inline-flex rounded-lg border bg-card p-1"
        >
            {periods.map((period) => (
                <Link
                    key={period}
                    href={analyticsIndex({ query: { period } })}
                    preserveScroll
                    aria-current={period === selected ? 'page' : undefined}
                    className={`rounded-md px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                        period === selected
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                    {period} days
                </Link>
            ))}
        </nav>
    );
}

function SummaryCard({
    label,
    value,
    metric,
    note,
    icon: Icon,
    inverse = false,
}: {
    label: string;
    value: string;
    metric: Metric;
    note: string;
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    inverse?: boolean;
}) {
    return (
        <article className="min-w-0 rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-lg border bg-background">
                    <Icon className="size-4 text-highlight" />
                </span>
                <ChangeBadge change={metric.change} inverse={inverse} />
            </div>
            <strong className="mt-6 block truncate font-editorial text-4xl tracking-tight">
                {value}
            </strong>
            <p className="mt-1 text-sm font-semibold">{label}</p>
            <p className="mt-1 text-xs text-muted-foreground">{note}</p>
        </article>
    );
}

function ChangeBadge({
    change,
    inverse,
}: {
    change: number | null;
    inverse: boolean;
}) {
    if (change === null) {
        return (
            <span className="text-[10px] text-muted-foreground">
                No prior data
            </span>
        );
    }

    const isPositive = inverse ? change <= 0 : change >= 0;
    const Icon = change >= 0 ? ArrowUpRight : ArrowDownRight;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold ${
                isPositive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            }`}
        >
            <Icon className="size-3" />
            {Math.abs(change).toFixed(1)}%
        </span>
    );
}

function PanelHeader({
    title,
    description,
    aside,
}: {
    title: string;
    description: string;
    aside?: ReactNode;
}) {
    return (
        <header className="flex flex-wrap items-center justify-between gap-4 border-b px-5 py-4">
            <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    {description}
                </p>
            </div>
            {aside}
        </header>
    );
}

function TrafficChart({ points }: { points: DailyPoint[] }) {
    const width = 900;
    const height = 300;
    const paddingX = 32;
    const paddingTop = 24;
    const paddingBottom = 44;
    const plotHeight = height - paddingTop - paddingBottom;
    const maximum = Math.max(
        1,
        ...points.flatMap((point) => [
            point.visitors,
            point.sessions,
            point.pageViews,
        ]),
    );
    const x = (index: number) =>
        paddingX +
        (index / Math.max(points.length - 1, 1)) * (width - paddingX * 2);
    const y = (value: number) =>
        paddingTop + plotHeight - (value / maximum) * plotHeight;
    const line = (key: 'visitors' | 'sessions' | 'pageViews') =>
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
    const labelInterval = Math.max(1, Math.ceil(points.length / 6));

    return (
        <div className="px-2 pt-4 pb-2 sm:px-5">
            <svg
                viewBox={`0 0 ${width} ${height}`}
                className="h-auto w-full overflow-visible"
                role="img"
                aria-label="Portfolio traffic across the selected period"
            >
                <defs>
                    <linearGradient
                        id="analytics-visitor-area"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--primary)"
                            stopOpacity=".26"
                        />
                        <stop
                            offset="100%"
                            stopColor="var(--primary)"
                            stopOpacity="0"
                        />
                    </linearGradient>
                </defs>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                    <line
                        key={ratio}
                        x1={paddingX}
                        x2={width - paddingX}
                        y1={paddingTop + plotHeight * ratio}
                        y2={paddingTop + plotHeight * ratio}
                        stroke="currentColor"
                        strokeOpacity=".08"
                        strokeDasharray="3 5"
                    />
                ))}
                <path d={area} fill="url(#analytics-visitor-area)" />
                <path
                    d={line('pageViews')}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity=".23"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                />
                <path
                    d={line('sessions')}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity=".58"
                    strokeWidth="2"
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
                        {(index % labelInterval === 0 ||
                            index === points.length - 1) && (
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

function BreakdownPanel({
    title,
    description,
    items,
    icon: Icon,
}: {
    title: string;
    description: string;
    items: BreakdownItem[];
    icon?: ComponentType<SVGProps<SVGSVGElement>>;
}) {
    return (
        <section className="rounded-xl border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
                {Icon && <Icon className="size-4 text-highlight" />}
            </div>

            {items.length ? (
                <div className="mt-6 space-y-4">
                    {items.map((item) => (
                        <div key={item.label}>
                            <div className="flex items-center justify-between gap-4 text-xs">
                                <span
                                    className="truncate font-medium"
                                    title={item.label}
                                >
                                    {item.label}
                                </span>
                                <span className="shrink-0 text-muted-foreground">
                                    {item.value.toLocaleString()} ·{' '}
                                    {item.percentage.toFixed(1)}%
                                </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-highlight"
                                    style={{
                                        width: `${Math.max(
                                            4,
                                            item.percentage,
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <EmptyState compact />
            )}
        </section>
    );
}

function Legend({ color, label }: { color: string; label: string }) {
    return (
        <span className="flex items-center gap-1.5">
            <span className={`size-2 rounded-full ${color}`} />
            {label}
        </span>
    );
}

function EmptyState({ compact = false }: { compact?: boolean }) {
    return (
        <div
            className={`text-center ${compact ? 'mt-5 border-t pt-5' : 'p-10'}`}
        >
            <Activity className="mx-auto size-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">No data for this period</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                New portfolio visits will appear here automatically.
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

    if (minutes < 60) {
        return remainder ? `${minutes}m ${remainder}s` : `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
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

function formatDate(value: string): string {
    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(`${value}T00:00:00`));
}

Analytics.layout = {
    breadcrumbs: [{ title: 'Analytics', href: analyticsIndex() }],
};
