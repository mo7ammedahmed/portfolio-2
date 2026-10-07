import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    ImageIcon,
    Save,
    Sparkles,
    Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
    Field,
    FormSection,
    Textarea,
    TextInput,
} from '@/components/admin/form-elements';
import { PageHeading } from '@/components/admin/page-heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { prepareImageUpload } from '@/lib/prepare-image-upload';
import { resolveSkillIconUrl, skillIconOptions } from '@/lib/skill-icons';
import { cn } from '@/lib/utils';
import { create, index, store, update } from '@/routes/portfolio/skills';

type SkillData = {
    id: number;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    group_ar: string;
    group_en: string;
    proficiency: number;
    is_visible: boolean;
    sort_order: number;
    icon_key: string | null;
    image_url: string | null;
};

export default function SkillForm({ skill }: { skill: SkillData | null }) {
    const editing = Boolean(skill);
    const form = useForm({
        name_ar: skill?.name_ar ?? '',
        name_en: skill?.name_en ?? '',
        description_ar: skill?.description_ar ?? '',
        description_en: skill?.description_en ?? '',
        group_ar: skill?.group_ar ?? '',
        group_en: skill?.group_en ?? '',
        proficiency: skill?.proficiency ?? 80,
        is_visible: skill?.is_visible ?? true,
        sort_order: skill?.sort_order ?? 0,
        icon_key: skill?.icon_key ?? null,
        image: null as File | null,
        remove_image: false,
    });
    const [isPreparingImage, setIsPreparingImage] = useState(false);
    const [imageError, setImageError] = useState<string | null>(null);
    const [imageStatus, setImageStatus] = useState<string | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(
        null,
    );
    const [fileInputKey, setFileInputKey] = useState(0);
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

        form.transform((data) => ({
            ...data,
            ...(editing ? { _method: 'put' } : {}),
        }));
        form.post(editing ? update.url(skill!.id) : store.url(), {
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
            form.setData((data) => ({
                ...data,
                image: preparedImage,
                remove_image: false,
            }));
            setImageStatus(
                preparedImage !== file
                    ? `Optimized from ${formatFileSize(file.size)} to ${formatFileSize(preparedImage.size)}.`
                    : `${formatFileSize(file.size)} ready to upload.`,
            );
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

    const removeImage = () => {
        clearSelectedImage();
        setFileInputKey((key) => key + 1);
        setImageStatus(
            editing ? 'The custom image will be removed when you save.' : null,
        );
        setImageError(null);
        form.clearErrors('image');
        form.setData((data) => ({
            ...data,
            image: null,
            remove_image: editing,
        }));
    };

    const isSaving = form.processing || isPreparingImage;
    const previewUrl = selectedImageUrl
        ? selectedImageUrl
        : form.data.remove_image
          ? null
          : skill?.image_url;
    const selectedIconUrl = resolveSkillIconUrl(
        form.data.icon_key,
        form.data.name_en,
    );
    const displayedIconUrl = previewUrl ?? selectedIconUrl;
    const hasCustomImage = Boolean(previewUrl);

    return (
        <>
            <Head title={editing ? 'Edit skill' : 'New skill'} />
            <form
                onSubmit={submit}
                className="mx-auto w-full max-w-5xl p-5 sm:p-8"
            >
                <PageHeading
                    eyebrow="Capability"
                    title={editing ? 'Edit skill' : 'New skill'}
                    description="Add a practical capability and place it in a clear group."
                    action={
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" asChild>
                                <Link href={index()}>
                                    <ArrowLeft className="size-4" />
                                    Back
                                </Link>
                            </Button>
                            <Button disabled={isSaving}>
                                <Save className="size-4" />
                                {isPreparingImage
                                    ? 'Preparing image…'
                                    : form.processing
                                      ? 'Saving…'
                                      : 'Save'}
                            </Button>
                        </div>
                    }
                />
                <FormSection
                    title="Skill"
                    description="Name and describe the capability in both languages."
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
                    <Field label="Group · English" error={form.errors.group_en}>
                        <TextInput
                            placeholder="e.g. Frontend"
                            value={form.data.group_en}
                            onChange={(e) =>
                                form.setData('group_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="المجموعة · العربية"
                        error={form.errors.group_ar}
                    >
                        <TextInput
                            dir="rtl"
                            value={form.data.group_ar}
                            onChange={(e) =>
                                form.setData('group_ar', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Description · English"
                        error={form.errors.description_en}
                    >
                        <Textarea
                            value={form.data.description_en}
                            onChange={(e) =>
                                form.setData('description_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="الوصف · العربية"
                        error={form.errors.description_ar}
                    >
                        <Textarea
                            dir="rtl"
                            value={form.data.description_ar}
                            onChange={(e) =>
                                form.setData('description_ar', e.target.value)
                            }
                        />
                    </Field>
                </FormSection>
                <FormSection
                    title="Presentation"
                    description="Set proficiency, order, and the custom image used by Tech Stack."
                >
                    <Field
                        label={`Proficiency · ${form.data.proficiency}%`}
                        error={form.errors.proficiency}
                    >
                        <input
                            aria-label="Proficiency"
                            type="range"
                            min={0}
                            max={100}
                            value={form.data.proficiency}
                            onChange={(e) =>
                                form.setData(
                                    'proficiency',
                                    Number(e.target.value),
                                )
                            }
                            className="h-10 w-full accent-primary"
                        />
                    </Field>
                    <Field label="Sort order" error={form.errors.sort_order}>
                        <TextInput
                            type="number"
                            min={0}
                            value={form.data.sort_order}
                            onChange={(e) =>
                                form.setData(
                                    'sort_order',
                                    Number(e.target.value),
                                )
                            }
                        />
                    </Field>
                    <label className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium">
                        <Checkbox
                            checked={form.data.is_visible}
                            onCheckedChange={(value) =>
                                form.setData('is_visible', Boolean(value))
                            }
                        />
                        Publicly visible
                    </label>
                    <div className="sm:col-span-2">
                        <Field
                            label="Preset icon"
                            error={form.errors.icon_key}
                            hint="Choose the exact icon shown in Tech Stack. Automatic matches the English skill name."
                        >
                            <div
                                role="radiogroup"
                                aria-label="Preset icon"
                                className="grid grid-cols-3 gap-2 rounded-xl border bg-muted/20 p-3 sm:grid-cols-5 lg:grid-cols-7"
                            >
                                <button
                                    type="button"
                                    role="radio"
                                    aria-checked={!form.data.icon_key}
                                    onClick={() =>
                                        form.setData('icon_key', null)
                                    }
                                    className={cn(
                                        'relative grid min-h-20 place-items-center gap-1 rounded-lg border bg-card p-2 text-xs font-medium transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                        !form.data.icon_key &&
                                            'border-highlight bg-highlight/10',
                                    )}
                                >
                                    <Sparkles className="size-7 text-highlight" />
                                    <span>Automatic</span>
                                    {!form.data.icon_key && (
                                        <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                                            <Check className="size-3" />
                                        </span>
                                    )}
                                </button>
                                {skillIconOptions.map((icon) => {
                                    const selected =
                                        form.data.icon_key === icon.key;

                                    return (
                                        <button
                                            key={icon.key}
                                            type="button"
                                            role="radio"
                                            aria-checked={selected}
                                            aria-label={icon.label}
                                            onClick={() =>
                                                form.setData(
                                                    'icon_key',
                                                    icon.key,
                                                )
                                            }
                                            className={cn(
                                                'relative grid min-h-20 place-items-center gap-1 rounded-lg border bg-card p-2 text-xs font-medium transition hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                                                selected &&
                                                    'border-highlight bg-highlight/10',
                                            )}
                                        >
                                            <img
                                                src={icon.url}
                                                alt=""
                                                loading="lazy"
                                                className="size-9 rounded-md bg-white object-contain p-1"
                                            />
                                            <span className="max-w-full truncate">
                                                {icon.label}
                                            </span>
                                            {selected && (
                                                <span className="absolute top-1.5 right-1.5 grid size-4 place-items-center rounded-full bg-primary text-primary-foreground">
                                                    <Check className="size-3" />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </Field>
                    </div>
                    <div className="sm:col-span-2">
                        <Field
                            label="Upload a custom icon"
                            error={imageError ?? form.errors.image}
                            hint={
                                imageStatus ??
                                'Optional PNG, JPG, or WebP under 2 MB. A custom upload overrides the selected preset.'
                            }
                        >
                            <TextInput
                                key={fileInputKey}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={isPreparingImage}
                                onChange={selectImage}
                            />
                        </Field>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border bg-muted/25 p-4 sm:col-span-2">
                        <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border bg-card">
                            {displayedIconUrl ? (
                                <img
                                    src={displayedIconUrl}
                                    alt={`${form.data.name_en || 'Skill'} icon preview`}
                                    className="size-full bg-white object-contain p-3"
                                />
                            ) : (
                                <ImageIcon className="size-7 text-muted-foreground" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">
                                {hasCustomImage
                                    ? 'Custom Tech Stack visual'
                                    : form.data.icon_key
                                      ? 'Selected preset icon'
                                      : selectedIconUrl
                                        ? 'Automatic icon match'
                                        : 'Initials fallback'}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                {hasCustomImage
                                    ? 'This image overrides the automatic icon selected from the skill name.'
                                    : form.data.icon_key
                                      ? 'This preset will be shown in the public Tech Stack section.'
                                      : selectedIconUrl
                                        ? 'The icon is matched automatically from the English skill name.'
                                        : 'Choose a preset or upload a custom icon; otherwise initials are shown.'}
                            </p>
                            {hasCustomImage && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-3"
                                    onClick={removeImage}
                                >
                                    <Trash2 className="size-3.5" />
                                    Remove custom image
                                </Button>
                            )}
                        </div>
                    </div>
                </FormSection>
                <div className="flex justify-end pt-8">
                    <Button size="lg" disabled={isSaving}>
                        {isPreparingImage
                            ? 'Preparing image…'
                            : form.processing
                              ? 'Saving…'
                              : 'Save skill'}
                    </Button>
                </div>
            </form>
        </>
    );
}

function formatFileSize(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

SkillForm.layout = {
    breadcrumbs: [
        { title: 'Skills', href: index() },
        { title: 'Skill editor', href: create() },
    ],
};
