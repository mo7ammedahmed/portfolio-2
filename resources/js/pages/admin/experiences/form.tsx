import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import {
    Field,
    FormSection,
    Textarea,
    TextInput,
} from '@/components/admin/form-elements';
import { PageHeading } from '@/components/admin/page-heading';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { create, index, store, update } from '@/routes/portfolio/experiences';

type ExperienceData = {
    id: number;
    name_ar: string;
    name_en: string;
    company_ar: string;
    company_en: string;
    description_ar: string;
    description_en: string;
    location_ar: string;
    location_en: string;
    started_at: string;
    ended_at: string | null;
    is_current: boolean;
    is_visible: boolean;
    sort_order: number;
};

export default function ExperienceForm({
    experience,
}: {
    experience: ExperienceData | null;
}) {
    const editing = Boolean(experience);
    const form = useForm({
        name_ar: experience?.name_ar ?? '',
        name_en: experience?.name_en ?? '',
        company_ar: experience?.company_ar ?? '',
        company_en: experience?.company_en ?? '',
        description_ar: experience?.description_ar ?? '',
        description_en: experience?.description_en ?? '',
        location_ar: experience?.location_ar ?? '',
        location_en: experience?.location_en ?? '',
        started_at: experience?.started_at ?? '',
        ended_at: experience?.ended_at ?? '',
        is_current: experience?.is_current ?? false,
        is_visible: experience?.is_visible ?? true,
        sort_order: experience?.sort_order ?? 0,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (editing) {
            form.put(update.url(experience!.id), { preserveScroll: true });
        } else {
            form.post(store.url(), { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title={editing ? 'Edit experience' : 'New experience'} />
            <form
                onSubmit={submit}
                className="mx-auto w-full max-w-6xl p-5 sm:p-8"
            >
                <PageHeading
                    eyebrow="Career entry"
                    title={editing ? 'Edit experience' : 'New experience'}
                    description="Capture the role, organization, timeline, and contribution in both languages."
                    action={
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" asChild>
                                <Link href={index()}>
                                    <ArrowLeft className="size-4" />
                                    Back
                                </Link>
                            </Button>
                            <Button disabled={form.processing}>
                                <Save className="size-4" />
                                Save role
                            </Button>
                        </div>
                    }
                />
                <FormSection
                    title="Role"
                    description="Make the title and company immediately clear."
                >
                    <Field label="Role · English" error={form.errors.name_en}>
                        <TextInput
                            value={form.data.name_en}
                            onChange={(e) =>
                                form.setData('name_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="الدور · العربية" error={form.errors.name_ar}>
                        <TextInput
                            dir="rtl"
                            value={form.data.name_ar}
                            onChange={(e) =>
                                form.setData('name_ar', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Company · English"
                        error={form.errors.company_en}
                    >
                        <TextInput
                            value={form.data.company_en}
                            onChange={(e) =>
                                form.setData('company_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="الشركة · العربية"
                        error={form.errors.company_ar}
                    >
                        <TextInput
                            dir="rtl"
                            value={form.data.company_ar}
                            onChange={(e) =>
                                form.setData('company_ar', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Contribution · English"
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
                        label="المساهمة · العربية"
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
                    title="Timeline"
                    description="Dates, location, order, and visibility."
                >
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
                    <Field label="Start date" error={form.errors.started_at}>
                        <TextInput
                            type="date"
                            value={form.data.started_at}
                            onChange={(e) =>
                                form.setData('started_at', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="End date" error={form.errors.ended_at}>
                        <TextInput
                            type="date"
                            disabled={form.data.is_current}
                            value={form.data.ended_at}
                            onChange={(e) =>
                                form.setData('ended_at', e.target.value)
                            }
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
                    <div className="grid gap-2">
                        <Toggle
                            label="Current role"
                            checked={form.data.is_current}
                            onChange={(value) =>
                                form.setData('is_current', value)
                            }
                        />
                        <Toggle
                            label="Publicly visible"
                            checked={form.data.is_visible}
                            onChange={(value) =>
                                form.setData('is_visible', value)
                            }
                        />
                    </div>
                </FormSection>
                <div className="flex justify-end pt-8">
                    <Button size="lg" disabled={form.processing}>
                        Save experience
                    </Button>
                </div>
            </form>
        </>
    );
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
    return (
        <label className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm font-medium">
            <Checkbox
                checked={checked}
                onCheckedChange={(value) => onChange(Boolean(value))}
            />
            {label}
        </label>
    );
}

ExperienceForm.layout = {
    breadcrumbs: [
        { title: 'Experience', href: index() },
        { title: 'Role editor', href: create() },
    ],
};
