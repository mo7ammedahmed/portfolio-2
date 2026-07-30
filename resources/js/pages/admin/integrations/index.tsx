import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    Activity,
    Cable,
    CheckCircle2,
    CircleOff,
    ExternalLink,
    FileCheck2,
    Power,
    Radar,
    Save,
    ShieldCheck,
    Trash2,
} from 'lucide-react';
import { useId } from 'react';
import type { FormEvent } from 'react';
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
    tracking_id: string;
    is_enabled: boolean;
    is_configured: boolean;
    updated_at: string | null;
};

type Props = {
    hasProfile: boolean;
    platforms: Platform[];
    detected: {
        googleVerificationFiles: string[];
    };
};

function IntegrationCard({
    platform,
    disabled,
}: {
    platform: Platform;
    disabled: boolean;
}) {
    const enabledId = useId();
    const form = useForm({
        tracking_id: platform.tracking_id,
        is_enabled: platform.is_enabled,
    });
    const isConfigured = platform.is_configured || form.data.tracking_id !== '';
    const isActive = isConfigured && form.data.is_enabled;

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.put(update(platform.key).url, {
            preserveScroll: true,
        });
    };

    const disconnect = () => {
        if (
            !window.confirm(
                `Disconnect ${platform.label} and remove its tracking ID?`,
            )
        ) {
            return;
        }

        router.delete(destroy(platform.key).url, { preserveScroll: true });
    };

    return (
        <article className="overflow-hidden rounded-2xl border bg-card">
            <div className="flex items-start gap-4 border-b p-5 sm:p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl border bg-background font-editorial text-lg text-highlight">
                    {platform.label.charAt(0)}
                </span>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{platform.label}</h3>
                        <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${
                                isActive
                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : isConfigured
                                      ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300'
                                      : 'text-muted-foreground'
                            }`}
                        >
                            {isActive ? (
                                <CheckCircle2 className="size-3" />
                            ) : isConfigured ? (
                                <Power className="size-3" />
                            ) : (
                                <CircleOff className="size-3" />
                            )}
                            {isActive
                                ? 'Active'
                                : isConfigured
                                  ? 'Saved, disabled'
                                  : 'Not configured'}
                        </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {platform.description}
                    </p>
                </div>
            </div>

            <form onSubmit={submit} className="grid gap-5 p-5 sm:p-6">
                <div className="grid gap-2">
                    <Label htmlFor={`${enabledId}-tracking-id`}>
                        Tracking ID
                    </Label>
                    <Input
                        id={`${enabledId}-tracking-id`}
                        value={form.data.tracking_id}
                        placeholder={platform.placeholder}
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        disabled={disabled}
                        className="font-mono"
                        aria-invalid={Boolean(form.errors.tracking_id)}
                        onChange={(event) =>
                            form.setData(
                                'tracking_id',
                                event.target.value.trim(),
                            )
                        }
                    />
                    {form.errors.tracking_id && (
                        <p className="text-sm text-destructive">
                            {form.errors.tracking_id}
                        </p>
                    )}
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border bg-background p-4">
                    <div>
                        <Label htmlFor={enabledId}>Run on public pages</Label>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Disabled integrations keep their ID without loading
                            the platform script.
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

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        {platform.updated_at
                            ? `Updated ${new Date(platform.updated_at).toLocaleString()}`
                            : 'Never configured'}
                    </p>
                    <div className="flex gap-2">
                        {platform.is_configured && (
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                onClick={disconnect}
                            >
                                <Trash2 className="size-4" />
                                Remove
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={
                                form.processing ||
                                disabled ||
                                form.data.tracking_id.length === 0
                            }
                        >
                            <Save className="size-4" />
                            {form.processing ? 'Saving…' : 'Save'}
                        </Button>
                    </div>
                </div>
            </form>
        </article>
    );
}

export default function Integrations({
    hasProfile,
    platforms,
    detected,
}: Props) {
    const activeCount = platforms.filter(
        (platform) => platform.is_configured && platform.is_enabled,
    ).length;
    const googleActive = platforms.some(
        (platform) =>
            platform.category === 'Google' &&
            platform.is_configured &&
            platform.is_enabled,
    );
    const categories = Array.from(
        new Set(platforms.map((platform) => platform.category)),
    );

    return (
        <>
            <Head title="Pixels & integrations" />
            <PageHeading
                eyebrow="Measurement"
                title="Pixels & integrations"
                description="Configure analytics, advertising pixels, tag management, and Google verification from one place."
            />

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border bg-card p-5">
                    <Radar className="size-5 text-highlight" />
                    <p className="mt-5 text-3xl font-semibold">{activeCount}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Active integrations
                    </p>
                </div>
                <div className="rounded-2xl border bg-card p-5">
                    <ShieldCheck className="size-5 text-highlight" />
                    <p className="mt-5 text-lg font-semibold">
                        {googleActive ? 'Configured' : 'Not configured'}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Google platform status
                    </p>
                </div>
                <div className="rounded-2xl border bg-card p-5">
                    <Activity className="size-5 text-highlight" />
                    <p className="mt-5 text-lg font-semibold">
                        {platforms.length} connectors
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Available in this dashboard
                    </p>
                </div>
            </div>

            {!hasProfile && (
                <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-sm">
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

            {detected.googleVerificationFiles.length > 0 && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border bg-card p-5">
                    <FileCheck2 className="mt-0.5 size-5 shrink-0 text-highlight" />
                    <div>
                        <p className="font-semibold">
                            Existing Google verification files detected
                        </p>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {detected.googleVerificationFiles.join(', ')} are
                            present in the project. The dashboard-managed meta
                            token is tracked separately below.
                        </p>
                    </div>
                </div>
            )}

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
                <Cable className="mt-0.5 size-5 shrink-0 text-highlight" />
                <div>
                    <p className="font-semibold">
                        Active means installed on the portfolio
                    </p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Account-level delivery must still be verified in each
                        provider’s diagnostics, such as Google Tag Assistant or
                        the platform’s pixel helper. Enable only the services
                        covered by your privacy and consent policy.
                    </p>
                </div>
            </div>

            <div className="mt-10 grid gap-10">
                {categories.map((category) => (
                    <section
                        key={category}
                        aria-labelledby={`integration-${category}`}
                    >
                        <div className="mb-4 flex items-end justify-between gap-4 border-b pb-3">
                            <div>
                                <p className="text-xs font-semibold tracking-[0.14em] text-highlight uppercase">
                                    Connector group
                                </p>
                                <h2
                                    id={`integration-${category}`}
                                    className="mt-1 font-editorial text-2xl"
                                >
                                    {category}
                                </h2>
                            </div>
                            <ExternalLink className="size-4 text-muted-foreground" />
                        </div>
                        <div className="grid gap-4 xl:grid-cols-2">
                            {platforms
                                .filter(
                                    (platform) =>
                                        platform.category === category,
                                )
                                .map((platform) => (
                                    <IntegrationCard
                                        key={platform.key}
                                        platform={platform}
                                        disabled={!hasProfile}
                                    />
                                ))}
                        </div>
                    </section>
                ))}
            </div>
        </>
    );
}

Integrations.layout = {
    breadcrumbs: [
        { title: 'Pixels & integrations', href: integrationsIndex() },
    ],
};
