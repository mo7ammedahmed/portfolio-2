import { Form, Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/invitations/accept';

type Invitation = {
    id: number;
    email: string;
    owner: string;
    role: string;
    expiresAt: string;
};

export default function AcceptInvitation({
    invitation,
    token,
}: {
    invitation: Invitation;
    token: string;
}) {
    return (
        <>
            <Head title="Accept invitation" />

            <div className="mb-2 rounded-xl border bg-muted/40 p-4">
                <div className="flex items-start gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
                        <ShieldCheck className="size-4" />
                    </span>
                    <div>
                        <p className="text-sm font-semibold">
                            Join {invitation.owner}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            You will join as {invitation.role}. This invitation
                            expires{' '}
                            {new Date(
                                invitation.expiresAt,
                            ).toLocaleDateString()}
                            .
                        </p>
                    </div>
                </div>
            </div>

            <Form
                action={store(invitation.id).url}
                method="post"
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <input type="hidden" name="token" value={token} />
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                value={invitation.email}
                                disabled
                                aria-describedby="invitation-email-note"
                            />
                            <p
                                id="invitation-email-note"
                                className="text-xs text-muted-foreground"
                            >
                                This account is tied to the invited address.
                            </p>
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="name">Your name</Label>
                            <Input
                                id="name"
                                name="name"
                                required
                                autoFocus
                                autoComplete="name"
                                placeholder="Full name"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                autoComplete="new-password"
                                placeholder="Create a password"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">
                                Confirm password
                            </Label>
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                required
                                autoComplete="new-password"
                                placeholder="Confirm your password"
                            />
                            <InputError
                                message={errors.password_confirmation}
                            />
                        </div>

                        <InputError message={errors.token} />

                        <Button type="submit" disabled={processing}>
                            {processing && <Spinner />}
                            Accept invitation
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

AcceptInvitation.layout = {
    title: 'Create your invited account',
    description: 'Set your name and password to join the portfolio team.',
};
