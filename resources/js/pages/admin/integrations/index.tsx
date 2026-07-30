import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowUpRight,
    BookOpen,
    Check,
    CheckCircle2,
    CircleDashed,
    CircleOff,
    Clipboard,
    Code2,
    ExternalLink,
    FileCheck2,
    Globe2,
    MonitorCheck,
    PauseCircle,
    Radar,
    Save,
    Search,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useId, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { PageHeading } from '@/components/admin/page-heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    destroy,
    index as integrationsIndex,
    update,
} from '@/routes/portfolio/integrations';
import { edit as editProfile } from '@/routes/portfolio/profile';

type Platform = {
    key: string;
    label: string;
    category: string;
    description: string;
    placeholder: string;
    id_label: string;
    placement: string;
    documentation_url: string;
    diagnostics_url: string;
    diagnostics_label: string;
    brand_color: string;
    monogram: string;
    has_body_fallback: boolean;
    tracking_id: string;
    is_enabled: boolean;
    is_configured: boolean;
    updated_at: string | null;
};

type Props = {
    hasProfile: boolean;
    siteUrl: string;
    platforms: Platform[];
    detected: {
        googleVerificationFiles: string[];
    };
};

type Filter = 'All' | 'Google' | 'Advertising pixels' | 'Behavior analytics';

const filters: Filter[] = [
    'All',
    'Google',
    'Advertising pixels',
    'Behavior analytics',
];

function StatusBadge({
    isConfigured,
    isEnabled,
}: {
    isConfigured: boolean;
    isEnabled: boolean;
}) {
    if (isConfigured && isEnabled) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="size-3.5" />
                Installed
            </span>
        );
    }

    if (isConfigured) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300">
                <PauseCircle className="size-3.5" />
                Paused
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
            <CircleOff className="size-3.5" />
            Needs ID
        </span>
    );
}

function InstallationCheck({
    label,
    active,
    external = false,
}: {
    label: string;
    active: boolean;
    external?: boolean;
}) {
    return (
        <li className="flex min-w-0 items-center gap-2 text-xs">
            <span
                className={`grid size-5 shrink-0 place-items-center rounded-full border ${
                    active
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'bg-background text-muted-foreground'
                }`}
            >
                {external ? (
                    <ArrowUpRight className="size-3" />
                ) : active ? (
                    <Check className="size-3" />
                ) : (
                    <CircleDashed className="size-3" />
                )}
            </span>
            <span
                className={
                    active && !external
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                }
            >
                {label}
            </span>
        </li>
    );
}

function IntegrationCard({
    platform,
    disabled,
    siteUrl,
}: {
    platform: Platform;
    disabled: boolean;
    siteUrl: string;
}) {
    const enabledId = useId();
    const inputId = useId();
    const hintId = useId();
    const errorId = useId();
    const [copied, setCopied] = useState(false);
    const form = useForm({
        tracking_id: platform.tracking_id,
        is_enabled: platform.is_enabled,
    });
    const isConfigured =
        platform.is_configured || form.data.tracking_id.length > 0;
    const isInstalled = isConfigured && form.data.is_enabled;
    const hasDarkMonogram =
        platform.key === 'snapchat_pixel' || platform.key === 'tiktok_pixel';

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(update(platform.key).url, {
            preserveScroll: true,
            onSuccess: () => form.setDefaults(),
        });
    };

    const copyTrackingId = async () => {
        if (!form.data.tracking_id) {
            return;
        }

        await navigator.clipboard.writeText(form.data.tracking_id);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
    };

    const disconnect = () => {
        if (
            !window.confirm(
                `Remove ${platform.label} and its saved identifier?`,
            )
        ) {
            return;
        }

        router.delete(destroy(platform.key).url, { preserveScroll: true });
    };

    return (
        <article
            className="group flex min-h-full flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow] hover:border-foreground/20 hover:shadow-lg hover:shadow-black/5"
            style={
                {
                    '--connector-color': platform.brand_color,
                } as CSSProperties
            }
        >
            <header className="flex items-start gap-4 border-b p-5 sm:p-6">
                <span
                    className={`grid size-12 shrink-0 place-items-center rounded-xl text-xs font-black tracking-tight shadow-sm ${
                        hasDarkMonogram ? 'text-black' : 'text-white'
                    }`}
                    style={{ backgroundColor: platform.brand_color }}
                    aria-hidden="true"
                >
                    {platform.monogram}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                                {platform.category}
                            </p>
                            <h3 className="mt-1 text-base font-semibold">
                                {platform.label}
                            </h3>
                        </div>
                        <StatusBadge
                            isConfigured={isConfigured}
                            isEnabled={form.data.is_enabled}
                        />
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {platform.description}
                    </p>
                </div>
            </header>

            <form
                onSubmit={submit}
                className="flex flex-1 flex-col gap-5 p-5 sm:p-6"
            >
                <div className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                        <Label htmlFor={inputId}>{platform.id_label}</Label>
                        <span className="text-[11px] text-muted-foreground">
                            {platform.placement}
                        </span>
                    </div>
                    <div className="relative">
                        <Input
                            id={inputId}
                            value={form.data.tracking_id}
                            placeholder={platform.placeholder}
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck={false}
                            disabled={disabled}
                            className="pr-11 font-mono"
                            aria-invalid={Boolean(form.errors.tracking_id)}
                            aria-describedby={
                                form.errors.tracking_id ? errorId : hintId
                            }
                            onChange={(event) =>
                                form.setData(
                                    'tracking_id',
                                    event.target.value.trim(),
                                )
                            }
                        />
                        <button
                            type="button"
                            onClick={copyTrackingId}
                            disabled={form.data.tracking_id.length === 0}
                            className="absolute inset-y-0 right-1 my-auto grid size-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-35"
                            aria-label={`Copy ${platform.id_label}`}
                        >
                            {copied ? (
                                <Check className="size-4 text-emerald-600" />
                            ) : (
                                <Clipboard className="size-4" />
                            )}
                        </button>
                    </div>
                    {form.errors.tracking_id ? (
                        <p id={errorId} className="text-sm text-destructive">
                            {form.errors.tracking_id}
                        </p>
                    ) : (
                        <p
                            id={hintId}
                            className="text-xs text-muted-foreground"
                        >
                            Saved IDs are emitted only when installation is
                            enabled.
                        </p>
                    )}
                </div>

                <div className="rounded-xl border bg-background/70 p-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <Label htmlFor={enabledId}>
                                Install on public portfolio
                            </Label>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                Adds the official provider bootstrap on the next
                                full page load.
                            </p>
                        </div>
                        <Checkbox
                            id={enabledId}
                            disabled={disabled}
                            checked={form.data.is_enabled}
                            onCheckedChange={(value) =>
                                form.setData('is_enabled', Boolean(value))
                            }
                        />
                    </div>

                    <ul className="mt-4 grid gap-2 border-t pt-4 sm:grid-cols-2">
                        <InstallationCheck
                            label="Head markup"
                            active={isInstalled}
                        />
                        {platform.has_body_fallback && (
                            <InstallationCheck
                                label="Body fallback"
                                active={isInstalled}
                            />
                        )}
                        <InstallationCheck
                            label="Provider receives data"
                            active={false}
                            external
                        />
                    </ul>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t pt-4">
                    <Button asChild type="button" variant="outline" size="sm">
                        <a
                            href={platform.documentation_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <BookOpen className="size-3.5" />
                            Setup guide
                        </a>
                    </Button>
                    <Button asChild type="button" variant="outline" size="sm">
                        <a
                            href={platform.diagnostics_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            <MonitorCheck className="size-3.5" />
                            {platform.diagnostics_label}
                        </a>
                    </Button>
                    {isInstalled && (
                        <Button asChild type="button" variant="ghost" size="sm">
                            <a href={siteUrl} target="_blank" rel="noreferrer">
                                <Globe2 className="size-3.5" />
                                Open site
                            </a>
                        </Button>
                    )}
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                            {platform.updated_at
                                ? `Saved ${new Date(platform.updated_at).toLocaleString()}`
                                : 'No saved configuration'}
                        </p>
                        {form.isDirty && (
                            <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                                Unsaved changes
                            </p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {platform.is_configured && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={disconnect}
                            >
                                <Trash2 className="size-4" />
                                Remove
                            </Button>
                        )}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={
                                form.processing ||
                                disabled ||
                                form.data.tracking_id.length === 0 ||
                                !form.isDirty
                            }
                        >
                            <Save className="size-4" />
                            {form.processing ? 'Saving…' : 'Save changes'}
                        </Button>
                    </div>
                </footer>
            </form>
        </article>
    );
}

function PipelineStep({
    icon,
    index,
    label,
    description,
    state,
}: {
    icon: React.ReactNode;
    index: string;
    label: string;
    description: string;
    state: 'complete' | 'external' | 'waiting';
}) {
    return (
        <div className="relative min-w-0 p-5 sm:p-6">
            <div className="flex items-start gap-3">
                <span
                    className={`grid size-9 shrink-0 place-items-center rounded-full border ${
                        state === 'complete'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                            : state === 'external'
                              ? 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300'
                              : 'bg-background text-muted-foreground'
                    }`}
                >
                    {icon}
                </span>
                <div>
                    <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                        Step {index}
                    </p>
                    <p className="mt-1 font-semibold">{label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Integrations({
    hasProfile,
    siteUrl,
    platforms,
    detected,
}: Props) {
    const [activeFilter, setActiveFilter] = useState<Filter>('All');
    const [query, setQuery] = useState('');
    const configuredCount = platforms.filter(
        (platform) => platform.is_configured,
    ).length;
    const installedCount = platforms.filter(
        (platform) => platform.is_configured && platform.is_enabled,
    ).length;
    const pausedCount = configuredCount - installedCount;
    const activeGtm = platforms.some(
        (platform) =>
            platform.key === 'google_tag_manager' &&
            platform.is_configured &&
            platform.is_enabled,
    );
    const activeDirectTags = platforms.filter(
        (platform) =>
            !['google_tag_manager', 'google_search_console'].includes(
                platform.key,
            ) &&
            platform.is_configured &&
            platform.is_enabled,
    );
    const visiblePlatforms = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase();

        return platforms.filter((platform) => {
            const matchesFilter =
                activeFilter === 'All' || platform.category === activeFilter;
            const matchesQuery =
                normalizedQuery === '' ||
                [
                    platform.label,
                    platform.description,
                    platform.category,
                    platform.id_label,
                ].some((value) =>
                    value.toLocaleLowerCase().includes(normalizedQuery),
                );

            return matchesFilter && matchesQuery;
        });
    }, [activeFilter, platforms, query]);

    return (
        <>
            <Head title="Pixels & integrations" />
            <PageHeading
                eyebrow="Measurement control"
                title="Pixels & integrations"
                description="Install provider-approved tracking code, keep identifiers in one place, and verify delivery with the right diagnostic tool."
                action={
                    <Button asChild variant="outline">
                        <a href={siteUrl} target="_blank" rel="noreferrer">
                            Open portfolio
                            <ExternalLink className="size-4" />
                        </a>
                    </Button>
                }
            />

            <section
                aria-labelledby="installation-pipeline"
                className="mt-8 overflow-hidden rounded-2xl border bg-card"
            >
                <div className="flex flex-col gap-4 border-b bg-muted/35 p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
                    <div>
                        <p className="text-xs font-bold tracking-[0.18em] text-highlight uppercase">
                            Installation pipeline
                        </p>
                        <h2
                            id="installation-pipeline"
                            className="mt-1 font-editorial text-2xl"
                        >
                            Know what “connected” actually means
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full border bg-background px-3 py-1.5 font-medium">
                            {configuredCount} saved
                        </span>
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 font-medium text-emerald-700 dark:text-emerald-300">
                            {installedCount} installed
                        </span>
                        {pausedCount > 0 && (
                            <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-medium text-amber-700 dark:text-amber-300">
                                {pausedCount} paused
                            </span>
                        )}
                    </div>
                </div>
                <div className="grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                    <PipelineStep
                        index="01"
                        icon={<Code2 className="size-4" />}
                        label="Identifier saved"
                        description="The provider ID passes platform-specific validation."
                        state={configuredCount > 0 ? 'complete' : 'waiting'}
                    />
                    <PipelineStep
                        index="02"
                        icon={<CheckCircle2 className="size-4" />}
                        label="Markup installed"
                        description="Enabled snippets render server-side on the public page."
                        state={installedCount > 0 ? 'complete' : 'waiting'}
                    />
                    <PipelineStep
                        index="03"
                        icon={<Radar className="size-4" />}
                        label="Browser detects it"
                        description="Confirm the request using the provider helper or network tools."
                        state="external"
                    />
                    <PipelineStep
                        index="04"
                        icon={<ShieldCheck className="size-4" />}
                        label="Provider receives data"
                        description="Final delivery status lives in the provider account."
                        state="external"
                    />
                </div>
            </section>

            {!hasProfile && (
                <div className="mt-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm">
                    Create your portfolio profile before configuring
                    integrations.{' '}
                    <Link
                        href={editProfile()}
                        className="font-semibold underline underline-offset-4"
                    >
                        Open profile
                    </Link>
                </div>
            )}

            {activeGtm && activeDirectTags.length > 0 && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
                    <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-300" />
                    <div>
                        <p className="font-semibold">
                            Check for duplicate tags inside GTM
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            Google Tag Manager and{' '}
                            {activeDirectTags
                                .map((platform) => platform.label)
                                .join(', ')}{' '}
                            are installed directly. If those same tags are also
                            published inside GTM, disable the direct connector
                            to prevent duplicate events.
                        </p>
                    </div>
                </div>
            )}

            {detected.googleVerificationFiles.length > 0 && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border bg-card p-5">
                    <FileCheck2 className="mt-0.5 size-5 shrink-0 text-highlight" />
                    <div className="min-w-0">
                        <p className="font-semibold">
                            Legacy Google verification files found
                        </p>
                        <p className="mt-1 text-sm leading-6 break-words text-muted-foreground">
                            {detected.googleVerificationFiles.join(', ')}. The
                            active Search Console meta token is managed
                            separately below; keep legacy files only if an
                            existing Google property still depends on them.
                        </p>
                    </div>
                </div>
            )}

            <section aria-labelledby="connector-library" className="mt-10">
                <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-bold tracking-[0.18em] text-highlight uppercase">
                            Connector library
                        </p>
                        <h2
                            id="connector-library"
                            className="mt-1 font-editorial text-3xl"
                        >
                            Configure each destination
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {visiblePlatforms.length} of {platforms.length}{' '}
                            connectors shown
                        </p>
                    </div>
                    <div className="relative w-full lg:max-w-xs">
                        <Label htmlFor="connector-search" className="sr-only">
                            Search connectors
                        </Label>
                        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="connector-search"
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search providers or IDs"
                            className="pl-9"
                        />
                    </div>
                </div>

                <div
                    className="mt-5 flex gap-2 overflow-x-auto pb-2"
                    aria-label="Filter connectors"
                >
                    {filters.map((filter) => {
                        const count =
                            filter === 'All'
                                ? platforms.length
                                : platforms.filter(
                                      (platform) =>
                                          platform.category === filter,
                                  ).length;

                        return (
                            <button
                                key={filter}
                                type="button"
                                onClick={() => setActiveFilter(filter)}
                                aria-pressed={activeFilter === filter}
                                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none ${
                                    activeFilter === filter
                                        ? 'border-foreground bg-foreground text-background'
                                        : 'bg-card text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {filter}
                                <span
                                    className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                                        activeFilter === filter
                                            ? 'bg-background/15'
                                            : 'bg-muted'
                                    }`}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {visiblePlatforms.length > 0 ? (
                    <div className="mt-5 grid gap-5 xl:grid-cols-2">
                        {visiblePlatforms.map((platform) => (
                            <IntegrationCard
                                key={platform.key}
                                platform={platform}
                                disabled={!hasProfile}
                                siteUrl={siteUrl}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-5 grid min-h-56 place-items-center rounded-2xl border border-dashed bg-card p-8 text-center">
                        <div>
                            <Search className="mx-auto size-8 text-muted-foreground" />
                            <h3 className="mt-4 font-semibold">
                                No connectors match
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Try another provider name or clear the current
                                filter.
                            </p>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-4"
                                onClick={() => {
                                    setQuery('');
                                    setActiveFilter('All');
                                }}
                            >
                                Reset filters
                            </Button>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

Integrations.layout = {
    breadcrumbs: [
        { title: 'Pixels & integrations', href: integrationsIndex() },
    ],
};
