import { Head, useForm } from '@inertiajs/react';
import {
    Braces,
    Check,
    MailCheck,
    MonitorCog,
    Moon,
    Save,
    Sun,
} from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
    Field,
    FormSection,
    Textarea,
    TextInput,
} from '@/components/admin/form-elements';
import { PageHeading } from '@/components/admin/page-heading';
import AlertError from '@/components/alert-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { prepareImageUpload } from '@/lib/prepare-image-upload';
import { edit, update } from '@/routes/portfolio/profile';

type ProfileData = {
    id: number;
    name_ar: string;
    name_en: string;
    role_ar: string;
    role_en: string;
    short_description_ar: string;
    short_description_en: string;
    description_ar: string;
    description_en: string;
    location_ar: string;
    location_en: string;
    linkedin: string | null;
    github: string | null;
    whatsapp: string | null;
    mobile: string | null;
    email: string;
    contact_notification_email: string | null;
    contact_notification_subject_template: string;
    contact_notification_body_template: string;
    contact_auto_reply_enabled: boolean;
    contact_auto_reply_subject_template: string;
    contact_auto_reply_body_template: string;
    website: string | null;
    resume_url: string | null;
    is_available: boolean;
    is_visible: boolean;
    theme_dark_accent: string;
    theme_light_accent: string;
    theme_dark_background: string;
    theme_dark_surface: string;
    theme_dark_foreground: string;
    theme_dark_muted: string;
    theme_light_background: string;
    theme_light_surface: string;
    theme_light_foreground: string;
    theme_light_muted: string;
    glass_effect_enabled: boolean;
    image_url: string | null;
};

export default function EditProfile({
    profile,
}: {
    profile: ProfileData | null;
}) {
    const form = useForm({
        name_ar: profile?.name_ar ?? '',
        name_en: profile?.name_en ?? '',
        role_ar: profile?.role_ar ?? '',
        role_en: profile?.role_en ?? '',
        short_description_ar: profile?.short_description_ar ?? '',
        short_description_en: profile?.short_description_en ?? '',
        description_ar: profile?.description_ar ?? '',
        description_en: profile?.description_en ?? '',
        location_ar: profile?.location_ar ?? '',
        location_en: profile?.location_en ?? '',
        linkedin: profile?.linkedin ?? '',
        github: profile?.github ?? '',
        whatsapp: profile?.whatsapp ?? '',
        mobile: profile?.mobile ?? '',
        email: profile?.email ?? '',
        contact_notification_email: profile?.contact_notification_email ?? '',
        contact_notification_subject_template:
            profile?.contact_notification_subject_template ??
            'New portfolio enquiry: {subject}',
        contact_notification_body_template:
            profile?.contact_notification_body_template ??
            'You received a new portfolio message.\n\nName: {name}\nEmail: {email}\nSubject: {subject}\n\n{message}',
        contact_auto_reply_enabled: profile?.contact_auto_reply_enabled ?? true,
        contact_auto_reply_subject_template:
            profile?.contact_auto_reply_subject_template ??
            'Thanks for your message about {subject}',
        contact_auto_reply_body_template:
            profile?.contact_auto_reply_body_template ??
            'Hi {name},\n\nThanks for reaching out. I received your message and will get back to you soon.\n\nBest,\n{portfolio_name}',
        website: profile?.website ?? '',
        resume_url: profile?.resume_url ?? '',
        is_available: profile?.is_available ?? true,
        is_visible: profile?.is_visible ?? true,
        theme_dark_accent: profile?.theme_dark_accent ?? '#d9ff43',
        theme_light_accent: profile?.theme_light_accent ?? '#006c55',
        theme_dark_background: profile?.theme_dark_background ?? '#070707',
        theme_dark_surface: profile?.theme_dark_surface ?? '#0d0d0d',
        theme_dark_foreground: profile?.theme_dark_foreground ?? '#f4f4f1',
        theme_dark_muted: profile?.theme_dark_muted ?? '#a4a4a0',
        theme_light_background: profile?.theme_light_background ?? '#f4f3ee',
        theme_light_surface: profile?.theme_light_surface ?? '#ffffff',
        theme_light_foreground: profile?.theme_light_foreground ?? '#0a0a0a',
        theme_light_muted: profile?.theme_light_muted ?? '#686864',
        glass_effect_enabled: profile?.glass_effect_enabled ?? false,
        image: null as File | null,
    });
    const [isPreparingImage, setIsPreparingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [imageStatus, setImageStatus] = useState<string | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        null,
    );
    const selectedImageUrlRef = useRef<string | null>(null);

    useEffect(() => {
        const imageUrlRef = selectedImageUrlRef;

        return () => {
            if (imageUrlRef.current) {
                URL.revokeObjectURL(imageUrlRef.current);
            }
        };
    }, []);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (isPreparingImage) {
            return;
        }

        form.transform((data) => ({ ...data, _method: 'put' }));
        form.post(update.url(), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const selectImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const input = event.currentTarget;
        const file = input.files?.[0] ?? null;

        form.clearErrors('image');
        setImageError(null);
        setImageStatus(null);

        if (!file) {
            form.setData('image', null);
            clearSelectedImage();

            return;
        }

        setIsPreparingImage(true);

        try {
            const preparedImage = await prepareImageUpload(file);
            const objectUrl = URL.createObjectURL(preparedImage);

            clearSelectedImage();
            selectedImageUrlRef.current = objectUrl;
            setSelectedImageUrl(objectUrl);
            form.setData('image', preparedImage);

            if (preparedImage !== file) {
                setImageStatus(
                    `Optimized from ${formatFileSize(file.size)} to ${formatFileSize(preparedImage.size)}.`,
                );
            } else {
                setImageStatus(`${formatFileSize(file.size)} ready to upload.`);
            }
        } catch (error) {
            form.setData('image', null);
            clearSelectedImage();
            input.value = '';
            setImageError(
                error instanceof Error
                    ? error.message
                    : 'The image could not be prepared.',
            );
        } finally {
            setIsPreparingImage(false);
        }
    };

    const clearSelectedImage = () => {
        if (selectedImageUrlRef.current) {
            URL.revokeObjectURL(selectedImageUrlRef.current);
            selectedImageUrlRef.current = null;
        }

        setSelectedImageUrl(null);
    };

    const isSaving = form.processing || isPreparingImage;
    const previewUrl = selectedImageUrl ?? profile?.image_url;

    return (
        <>
            <Head title="Edit portfolio profile" />
            <form
                onSubmit={submit}
                className="mx-auto w-full max-w-6xl p-5 sm:p-8"
            >
                <PageHeading
                    eyebrow="Public identity"
                    title="Profile"
                    description="The positioning, biography, and contact details shown across your public portfolio."
                    action={
                        <Button disabled={isSaving}>
                            <Save className="size-4" />
                            {isPreparingImage
                                ? 'Preparing image…'
                                : form.processing
                                  ? 'Saving…'
                                  : 'Save profile'}
                        </Button>
                    }
                />
                {Object.keys(form.errors).length > 0 && (
                    <div className="mt-6">
                        <AlertError
                            errors={Object.values(form.errors)}
                            title="Please review the profile fields."
                        />
                    </div>
                )}

                <FormSection
                    title="Identity"
                    description="Use a clear role and concise value proposition in both languages."
                >
                    <Field label="Name · English" error={form.errors.name_en}>
                        <TextInput
                            value={form.data.name_en}
                            onChange={(e) =>
                                form.setData('name_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="الاسم · العربية" error={form.errors.name_ar}>
                        <TextInput
                            dir="rtl"
                            value={form.data.name_ar}
                            onChange={(e) =>
                                form.setData('name_ar', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Role · English" error={form.errors.role_en}>
                        <TextInput
                            value={form.data.role_en}
                            onChange={(e) =>
                                form.setData('role_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="الدور · العربية" error={form.errors.role_ar}>
                        <TextInput
                            dir="rtl"
                            value={form.data.role_ar}
                            onChange={(e) =>
                                form.setData('role_ar', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Short pitch · English"
                        error={form.errors.short_description_en}
                    >
                        <Textarea
                            value={form.data.short_description_en}
                            onChange={(e) =>
                                form.setData(
                                    'short_description_en',
                                    e.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field
                        label="نبذة مختصرة · العربية"
                        error={form.errors.short_description_ar}
                    >
                        <Textarea
                            dir="rtl"
                            value={form.data.short_description_ar}
                            onChange={(e) =>
                                form.setData(
                                    'short_description_ar',
                                    e.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field
                        label="Biography · English"
                        error={form.errors.description_en}
                    >
                        <Textarea
                            className="min-h-40"
                            value={form.data.description_en}
                            onChange={(e) =>
                                form.setData('description_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="السيرة · العربية"
                        error={form.errors.description_ar}
                    >
                        <Textarea
                            dir="rtl"
                            className="min-h-40"
                            value={form.data.description_ar}
                            onChange={(e) =>
                                form.setData('description_ar', e.target.value)
                            }
                        />
                    </Field>
                </FormSection>

                <FormSection
                    title="Contact email delivery"
                    description="Choose where enquiries are delivered and personalize both email templates."
                >
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:col-span-2">
                        <div className="flex items-start gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/30 bg-background text-highlight">
                                <MailCheck className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold">
                                    Two emails, one conversation
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    You receive the full enquiry and the visitor
                                    receives an automatic acknowledgement when
                                    auto-reply is enabled.
                                </p>
                            </div>
                        </div>
                    </div>
                    <Field
                        label="Inbox email"
                        error={form.errors.contact_notification_email}
                        hint="Leave blank to use your public profile email."
                    >
                        <TextInput
                            type="email"
                            value={form.data.contact_notification_email}
                            placeholder={form.data.email || 'you@example.com'}
                            onChange={(event) =>
                                form.setData(
                                    'contact_notification_email',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <div className="hidden sm:block" aria-hidden="true" />
                    <Field
                        label="Owner notification subject"
                        error={
                            form.errors.contact_notification_subject_template
                        }
                    >
                        <TextInput
                            value={
                                form.data.contact_notification_subject_template
                            }
                            onChange={(event) =>
                                form.setData(
                                    'contact_notification_subject_template',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field
                        label="Owner notification body"
                        error={form.errors.contact_notification_body_template}
                    >
                        <Textarea
                            className="min-h-40 font-mono text-sm"
                            value={form.data.contact_notification_body_template}
                            onChange={(event) =>
                                form.setData(
                                    'contact_notification_body_template',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <div className="sm:col-span-2">
                        <Toggle
                            label="Send an automatic reply to visitors"
                            checked={form.data.contact_auto_reply_enabled}
                            onChange={(checked) =>
                                form.setData(
                                    'contact_auto_reply_enabled',
                                    checked,
                                )
                            }
                        />
                    </div>
                    <Field
                        label="Auto-reply subject"
                        error={form.errors.contact_auto_reply_subject_template}
                    >
                        <TextInput
                            disabled={!form.data.contact_auto_reply_enabled}
                            value={
                                form.data.contact_auto_reply_subject_template
                            }
                            onChange={(event) =>
                                form.setData(
                                    'contact_auto_reply_subject_template',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <Field
                        label="Auto-reply body"
                        error={form.errors.contact_auto_reply_body_template}
                    >
                        <Textarea
                            disabled={!form.data.contact_auto_reply_enabled}
                            className="min-h-40 font-mono text-sm"
                            value={form.data.contact_auto_reply_body_template}
                            onChange={(event) =>
                                form.setData(
                                    'contact_auto_reply_body_template',
                                    event.target.value,
                                )
                            }
                        />
                    </Field>
                    <div className="rounded-xl border bg-card p-4 sm:col-span-2">
                        <p className="flex items-center gap-2 text-sm font-semibold">
                            <Braces className="size-4 text-highlight" />
                            Available placeholders
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2 font-mono text-xs text-muted-foreground">
                            {[
                                '{name}',
                                '{email}',
                                '{subject}',
                                '{message}',
                                '{portfolio_name}',
                                '{portfolio_email}',
                            ].map((placeholder) => (
                                <code
                                    key={placeholder}
                                    className="rounded-md border bg-background px-2 py-1"
                                >
                                    {placeholder}
                                </code>
                            ))}
                        </div>
                    </div>
                </FormSection>

                <FormSection
                    title="Contact"
                    description="Public ways for people to find and reach you."
                >
                    <Field label="Email" error={form.errors.email}>
                        <TextInput
                            type="email"
                            value={form.data.email}
                            onChange={(e) =>
                                form.setData('email', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Mobile" error={form.errors.mobile}>
                        <TextInput
                            value={form.data.mobile}
                            onChange={(e) =>
                                form.setData('mobile', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Location · English"
                        error={form.errors.location_en}
                    >
                        <TextInput
                            value={form.data.location_en}
                            onChange={(e) =>
                                form.setData('location_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="الموقع · العربية"
                        error={form.errors.location_ar}
                    >
                        <TextInput
                            dir="rtl"
                            value={form.data.location_ar}
                            onChange={(e) =>
                                form.setData('location_ar', e.target.value)
                            }
                        />
                    </Field>
                    {(
                        [
                            'website',
                            'linkedin',
                            'github',
                            'whatsapp',
                            'resume_url',
                        ] as const
                    ).map((key) => (
                        <Field
                            key={key}
                            label={key.replace('_', ' ')}
                            error={form.errors[key]}
                        >
                            <TextInput
                                type="url"
                                value={form.data[key]}
                                onChange={(e) =>
                                    form.setData(key, e.target.value)
                                }
                            />
                        </Field>
                    ))}
                </FormSection>

                <FormSection
                    title="Presentation"
                    description="Control your portrait and publishing status."
                >
                    <Field
                        label="Portrait"
                        error={imageError ?? form.errors.image}
                        hint={
                            imageStatus ??
                            'JPG, PNG, or WebP. Large photos are optimized automatically.'
                        }
                    >
                        <TextInput
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={isPreparingImage}
                            onChange={selectImage}
                        />
                    </Field>
                    <Toggle
                        label="Available for work"
                        checked={form.data.is_available}
                        onChange={(checked) =>
                            form.setData('is_available', checked)
                        }
                    />
                    <Toggle
                        label="Publish portfolio"
                        checked={form.data.is_visible}
                        onChange={(checked) =>
                            form.setData('is_visible', checked)
                        }
                    />
                    {previewUrl && (
                        <div className="sm:col-span-2">
                            <img
                                src={previewUrl}
                                alt={
                                    selectedImageUrl
                                        ? 'Selected profile preview'
                                        : 'Current profile'
                                }
                                className="h-32 w-32 rounded-2xl border object-cover"
                            />
                        </div>
                    )}
                </FormSection>

                <FormSection
                    title="Portfolio palettes"
                    description="Publish the colors used by the public portfolio and dashboard in both light and dark mode."
                >
                    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 sm:col-span-2">
                        <div className="flex items-start gap-3">
                            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-primary/30 bg-background text-highlight">
                                <MonitorCog className="size-4" />
                            </span>
                            <div>
                                <p className="text-sm font-semibold">
                                    Appearance stays local
                                </p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Light, dark, or system preference stays on
                                    each device. The color palettes below are
                                    global and update the public portfolio and
                                    every dashboard user when you save.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="sm:col-span-2">
                        <Toggle
                            label="Enable the glass surface effect across the public portfolio"
                            checked={form.data.glass_effect_enabled}
                            onChange={(checked) =>
                                form.setData('glass_effect_enabled', checked)
                            }
                        />
                    </div>

                    <fieldset className="rounded-2xl border bg-card p-4 sm:col-span-2 sm:p-5">
                        <legend className="sr-only">Dark mode palette</legend>
                        <div className="flex items-start gap-3 border-b pb-4">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-[#090909] text-white">
                                <Moon className="size-4" />
                            </span>
                            <div>
                                <h3 className="font-editorial text-xl">
                                    Dark mode
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Colors used when a visitor chooses the dark
                                    appearance.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            {(
                                [
                                    ['theme_dark_accent', 'Accent'],
                                    ['theme_dark_background', 'Background'],
                                    ['theme_dark_surface', 'Surface'],
                                    ['theme_dark_foreground', 'Text'],
                                    ['theme_dark_muted', 'Muted text'],
                                ] as const
                            ).map(([key, label]) => (
                                <Field
                                    key={key}
                                    label={label}
                                    error={form.errors[key]}
                                >
                                    <ThemeColorControl
                                        label={`Dark ${label.toLowerCase()}`}
                                        value={form.data[key]}
                                        onChange={(value) =>
                                            form.setData(key, value)
                                        }
                                    />
                                </Field>
                            ))}
                        </div>

                        <div
                            className="mt-5 rounded-xl border p-4"
                            style={{
                                background: form.data.theme_dark_background,
                                color: form.data.theme_dark_foreground,
                            }}
                        >
                            <div
                                className="flex min-h-28 items-end justify-between gap-5 rounded-lg p-4"
                                style={{
                                    background: form.data.theme_dark_surface,
                                }}
                            >
                                <div>
                                    <p
                                        className="text-xs font-medium tracking-widest"
                                        style={{
                                            color: form.data.theme_dark_muted,
                                        }}
                                    >
                                        DARK PREVIEW
                                    </p>
                                    <p className="mt-2 text-lg font-semibold">
                                        Your portfolio, your atmosphere.
                                    </p>
                                </div>
                                <span
                                    className="size-9 shrink-0 rounded-full"
                                    style={{
                                        background: form.data.theme_dark_accent,
                                    }}
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="rounded-2xl border bg-card p-4 sm:col-span-2 sm:p-5">
                        <legend className="sr-only">Light mode palette</legend>
                        <div className="flex items-start gap-3 border-b pb-4">
                            <span className="grid size-10 shrink-0 place-items-center rounded-xl border bg-white text-black">
                                <Sun className="size-4" />
                            </span>
                            <div>
                                <h3 className="font-editorial text-xl">
                                    Light mode
                                </h3>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                    Colors used when a visitor chooses the light
                                    appearance.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-5 sm:grid-cols-2">
                            {(
                                [
                                    ['theme_light_accent', 'Accent'],
                                    ['theme_light_background', 'Background'],
                                    ['theme_light_surface', 'Surface'],
                                    ['theme_light_foreground', 'Text'],
                                    ['theme_light_muted', 'Muted text'],
                                ] as const
                            ).map(([key, label]) => (
                                <Field
                                    key={key}
                                    label={label}
                                    error={form.errors[key]}
                                >
                                    <ThemeColorControl
                                        label={`Light ${label.toLowerCase()}`}
                                        value={form.data[key]}
                                        onChange={(value) =>
                                            form.setData(key, value)
                                        }
                                    />
                                </Field>
                            ))}
                        </div>

                        <div
                            className="mt-5 rounded-xl border p-4"
                            style={{
                                background: form.data.theme_light_background,
                                color: form.data.theme_light_foreground,
                            }}
                        >
                            <div
                                className="flex min-h-28 items-end justify-between gap-5 rounded-lg p-4"
                                style={{
                                    background: form.data.theme_light_surface,
                                }}
                            >
                                <div>
                                    <p
                                        className="text-xs font-medium tracking-widest"
                                        style={{
                                            color: form.data.theme_light_muted,
                                        }}
                                    >
                                        LIGHT PREVIEW
                                    </p>
                                    <p className="mt-2 text-lg font-semibold">
                                        Changes publish when you save.
                                    </p>
                                </div>
                                <span
                                    className="size-9 shrink-0 rounded-full"
                                    style={{
                                        background:
                                            form.data.theme_light_accent,
                                    }}
                                />
                            </div>
                        </div>
                    </fieldset>
                </FormSection>

                <div className="flex justify-end pt-8">
                    <Button size="lg" disabled={isSaving}>
                        <Check className="size-4" />
                        {isPreparingImage
                            ? 'Preparing image…'
                            : 'Save all changes'}
                    </Button>
                </div>
            </form>
        </>
    );
}

function ThemeColorControl({
    id,
    label,
    value,
    onChange,
}: {
    id?: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex gap-3">
            <input
                aria-label={`${label} color picker`}
                type="color"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="h-10 w-14 shrink-0 cursor-pointer rounded-md border bg-card p-1"
            />
            <TextInput
                id={id}
                aria-label={`${label} hex value`}
                value={value}
                maxLength={7}
                spellCheck={false}
                onChange={(event) => onChange(event.target.value)}
                className="font-mono uppercase"
            />
        </div>
    );
}

function formatFileSize(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Toggle({
    label,
    checked,
    onChange,
}: {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}) {
    const id = useId();

    return (
        <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
            <Checkbox
                id={id}
                checked={checked}
                onCheckedChange={(value) => onChange(Boolean(value))}
            />
            <Label htmlFor={id}>{label}</Label>
        </div>
    );
}

EditProfile.layout = {
    breadcrumbs: [{ title: 'Profile', href: edit() }],
};
