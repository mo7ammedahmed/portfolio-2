import { Form, Head, router } from '@inertiajs/react';
import {
    Clock3,
    Mail,
    ShieldCheck,
    Trash2,
    UserPlus,
    UsersRound,
} from 'lucide-react';
import { PageHeading } from '@/components/admin/page-heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { team } from '@/routes/portfolio';
import {
    destroy as destroyInvitation,
    store as storeInvitation,
} from '@/routes/portfolio/invitations';
import {
    destroy as destroyRole,
    store as storeRole,
    update as updateRole,
} from '@/routes/portfolio/roles';
import {
    destroy as destroyMember,
    update as updateMember,
} from '@/routes/portfolio/team-members';

type PermissionOption = {
    value: string;
    label: string;
    description: string;
};

type Role = {
    id: number;
    name: string;
    permissions: string[];
    users_count: number;
    invitations_count: number;
};

type Invitation = {
    id: number;
    email: string;
    role: { id: number; name: string } | null;
    status: 'pending' | 'expired' | 'accepted';
    expires_at: string;
    created_at: string;
};

type Member = {
    id: number;
    name: string;
    email: string;
    role: { id: number; name: string } | null;
    created_at: string;
};

type Props = {
    roles: Role[];
    invitations: Invitation[];
    members: Member[];
    permissionOptions: PermissionOption[];
};

const statusStyles: Record<Invitation['status'], string> = {
    pending: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    expired: 'bg-muted text-muted-foreground',
    accepted: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
};

export default function TeamAccess({
    roles,
    invitations,
    members,
    permissionOptions,
}: Props) {
    return (
        <>
            <Head title="Team access" />
            <div className="mx-auto w-full max-w-6xl p-5 sm:p-8">
                <PageHeading
                    eyebrow="Private access"
                    title="Team access"
                    description="Invite collaborators into this portfolio and give each person only the areas they need."
                />

                <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
                    <section className="rounded-2xl border bg-card p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                                <UserPlus className="size-4" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Invite a collaborator
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Invitations expire after seven days.
                                </p>
                            </div>
                        </div>

                        {roles.length ? (
                            <Form
                                action={storeInvitation().url}
                                method="post"
                                resetOnSuccess
                                disableWhileProcessing
                                className="mt-6 grid gap-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="invite-email">
                                                Email address
                                            </Label>
                                            <Input
                                                id="invite-email"
                                                name="email"
                                                type="email"
                                                required
                                                autoComplete="email"
                                                placeholder="collaborator@example.com"
                                            />
                                            <InputError
                                                message={errors.email}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="invite-role">
                                                Role
                                            </Label>
                                            <select
                                                id="invite-role"
                                                name="role_id"
                                                required
                                                defaultValue=""
                                                className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                            >
                                                <option value="" disabled>
                                                    Select a role
                                                </option>
                                                {roles.map((role) => (
                                                    <option
                                                        key={role.id}
                                                        value={role.id}
                                                    >
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.role_id}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                        >
                                            {processing && <Spinner />}
                                            Send invitation
                                        </Button>
                                    </>
                                )}
                            </Form>
                        ) : (
                            <div className="mt-6 rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                                Create a role before sending the first
                                invitation.
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border bg-card p-5 sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-muted">
                                <ShieldCheck className="size-4" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Create a custom role
                                </h2>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Team management always remains owner-only.
                                </p>
                            </div>
                        </div>

                        <Form
                            action={storeRole().url}
                            method="post"
                            resetOnSuccess
                            disableWhileProcessing
                            className="mt-6 grid gap-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role-name">
                                            Role name
                                        </Label>
                                        <Input
                                            id="role-name"
                                            name="name"
                                            required
                                            placeholder="Content editor"
                                        />
                                        <InputError message={errors.name} />
                                    </div>
                                    <PermissionGrid
                                        options={permissionOptions}
                                        error={errors.permissions}
                                    />
                                    <Button type="submit" disabled={processing}>
                                        {processing && <Spinner />}
                                        Create role
                                    </Button>
                                </>
                            )}
                        </Form>
                    </section>
                </div>

                <section className="mt-8">
                    <div className="flex items-end justify-between gap-4">
                        <div>
                            <p className="text-xs font-bold tracking-[0.18em] text-highlight uppercase">
                                Permission sets
                            </p>
                            <h2 className="mt-2 font-editorial text-3xl">
                                Custom roles
                            </h2>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            {roles.length} roles
                        </span>
                    </div>

                    {roles.length ? (
                        <div className="mt-5 grid gap-4 xl:grid-cols-2">
                            {roles.map((role) => (
                                <Form
                                    key={role.id}
                                    action={updateRole(role.id).url}
                                    method="put"
                                    disableWhileProcessing
                                    className="rounded-2xl border bg-card p-5"
                                >
                                    {({ processing, errors }) => (
                                        <>
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="min-w-0 flex-1">
                                                    <Label
                                                        htmlFor={`role-${role.id}-name`}
                                                    >
                                                        Role name
                                                    </Label>
                                                    <Input
                                                        id={`role-${role.id}-name`}
                                                        name="name"
                                                        defaultValue={role.name}
                                                        className="mt-2"
                                                    />
                                                    <InputError
                                                        message={errors.name}
                                                    />
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive"
                                                    aria-label={`Delete ${role.name}`}
                                                    disabled={
                                                        role.users_count > 0 ||
                                                        role.invitations_count >
                                                            0
                                                    }
                                                    onClick={() => {
                                                        if (
                                                            window.confirm(
                                                                `Delete “${role.name}”?`,
                                                            )
                                                        ) {
                                                            router.delete(
                                                                destroyRole(
                                                                    role.id,
                                                                ).url,
                                                                {
                                                                    preserveScroll: true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                            <div className="mt-5">
                                                <PermissionGrid
                                                    options={permissionOptions}
                                                    selected={role.permissions}
                                                    idPrefix={`role-${role.id}`}
                                                    error={errors.permissions}
                                                />
                                            </div>
                                            <div className="mt-5 flex items-center justify-between gap-4 border-t pt-4">
                                                <p className="text-xs text-muted-foreground">
                                                    {role.users_count} members ·{' '}
                                                    {role.invitations_count}{' '}
                                                    invitations
                                                </p>
                                                <Button
                                                    type="submit"
                                                    size="sm"
                                                    disabled={processing}
                                                >
                                                    {processing && <Spinner />}
                                                    Save role
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </Form>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-5 rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                            No roles yet. Create the first permission set above.
                        </div>
                    )}
                </section>

                <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    <AccessList
                        title="Team members"
                        icon={<UsersRound className="size-4" />}
                        empty="No collaborators have accepted an invitation yet."
                    >
                        {members.map((member) => (
                            <Form
                                key={member.id}
                                action={updateMember(member.id).url}
                                method="put"
                                disableWhileProcessing
                                className="grid gap-3 border-t px-5 py-4 first:border-t-0 sm:grid-cols-[1fr_10rem_auto] sm:items-center"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                {member.name}
                                            </p>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {member.email}
                                            </p>
                                        </div>
                                        <div>
                                            <Label
                                                htmlFor={`member-${member.id}-role`}
                                                className="sr-only"
                                            >
                                                Role for {member.name}
                                            </Label>
                                            <select
                                                id={`member-${member.id}-role`}
                                                name="role_id"
                                                defaultValue={
                                                    member.role?.id ?? ''
                                                }
                                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                                            >
                                                {roles.map((role) => (
                                                    <option
                                                        key={role.id}
                                                        value={role.id}
                                                    >
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError
                                                message={errors.role_id}
                                            />
                                        </div>
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                type="submit"
                                                size="sm"
                                                variant="outline"
                                                disabled={processing}
                                            >
                                                {processing && <Spinner />}
                                                Save
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive"
                                                aria-label={`Remove access for ${member.name}`}
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            `Remove access for ${member.name}?`,
                                                        )
                                                    ) {
                                                        router.delete(
                                                            destroyMember(
                                                                member.id,
                                                            ).url,
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                    }
                                                }}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </Form>
                        ))}
                    </AccessList>

                    <AccessList
                        title="Invitations"
                        icon={<Mail className="size-4" />}
                        empty="No invitations have been sent."
                    >
                        {invitations.map((invitation) => (
                            <div
                                key={invitation.id}
                                className="flex items-center justify-between gap-4 border-t px-5 py-4 first:border-t-0"
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold">
                                        {invitation.email}
                                    </p>
                                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                                        <Clock3 className="size-3" />
                                        {invitation.role?.name ??
                                            'No role'} ·{' '}
                                        {new Date(
                                            invitation.expires_at,
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${statusStyles[invitation.status]}`}
                                    >
                                        {invitation.status}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        aria-label={`Remove invitation for ${invitation.email}`}
                                        onClick={() =>
                                            router.delete(
                                                destroyInvitation(invitation.id)
                                                    .url,
                                                { preserveScroll: true },
                                            )
                                        }
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </AccessList>
                </div>
            </div>
        </>
    );
}

function PermissionGrid({
    options,
    selected = [],
    idPrefix = 'new-role',
    error,
}: {
    options: PermissionOption[];
    selected?: string[];
    idPrefix?: string;
    error?: string;
}) {
    return (
        <fieldset>
            <legend className="text-sm font-medium">Permissions</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {options.map((option) => {
                    const id = `${idPrefix}-${option.value}`;

                    return (
                        <label
                            key={option.value}
                            htmlFor={id}
                            className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors hover:bg-muted/40"
                        >
                            <Checkbox
                                id={id}
                                name="permissions[]"
                                value={option.value}
                                defaultChecked={selected.includes(option.value)}
                                className="mt-0.5"
                            />
                            <span>
                                <span className="block text-sm font-medium">
                                    {option.label}
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                                    {option.description}
                                </span>
                            </span>
                        </label>
                    );
                })}
            </div>
            <InputError message={error} className="mt-2" />
        </fieldset>
    );
}

function AccessList({
    title,
    icon,
    empty,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    empty: string;
    children: React.ReactNode[];
}) {
    return (
        <section className="overflow-hidden rounded-2xl border bg-card">
            <header className="flex items-center gap-2 px-5 py-4">
                {icon}
                <h2 className="font-semibold">{title}</h2>
            </header>
            {children.length ? (
                children
            ) : (
                <p className="border-t px-5 py-8 text-center text-sm text-muted-foreground">
                    {empty}
                </p>
            )}
        </section>
    );
}

TeamAccess.layout = {
    breadcrumbs: [{ title: 'Team access', href: team() }],
};
