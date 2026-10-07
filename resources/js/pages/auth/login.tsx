import { Form, Head, usePage } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const ar = usePage().props.locale === 'ar';

    return (
        <>
            <Head title={ar ? 'تسجيل الدخول' : 'Log in'} />

            <PasskeyVerify
                label={ar ? 'الدخول بمفتاح المرور' : 'Sign in with a passkey'}
                loadingLabel={ar ? 'جارٍ التحقق…' : 'Authenticating…'}
                separator={
                    ar
                        ? 'أو باستخدام البريد الإلكتروني'
                        : 'or continue with email'
                }
            />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {ar ? 'البريد الإلكتروني' : 'Email address'}
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    dir="ltr"
                                    name="email"
                                    required
                                    autoComplete="email"
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">
                                        {ar ? 'كلمة المرور' : 'Password'}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ms-auto text-sm"
                                        >
                                            {ar
                                                ? 'نسيت كلمة المرور؟'
                                                : 'Forgot your password?'}
                                        </TextLink>
                                    )}
                                </div>
                                <PasswordInput
                                    id="password"
                                    name="password"
                                    required
                                    autoComplete="current-password"
                                    placeholder={
                                        ar ? 'كلمة المرور' : 'Password'
                                    }
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox id="remember" name="remember" />
                                <Label htmlFor="remember">
                                    {ar ? 'تذكرني' : 'Remember me'}
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={processing}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {ar ? 'تسجيل الدخول' : 'Log in'}
                            </Button>
                        </div>

                        <p className="text-center text-sm text-muted-foreground">
                            {ar
                                ? 'الدخول متاح لأعضاء الفريق المدعوين فقط.'
                                : 'Access is available by invitation only.'}
                        </p>
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
