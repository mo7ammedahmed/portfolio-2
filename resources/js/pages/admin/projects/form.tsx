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
import { Label } from '@/components/ui/label';
import { create, index, store, update } from '@/routes/portfolio/projects';

type ProjectData = {
    id: number;
    category_id: number | null;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    url: string | null;
    repository_url: string | null;
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
    skill_ids: number[];
    image_url: string | null;
};

export default function ProjectForm({
    project,
    categories,
    skills,
}: {
    project: ProjectData | null;
    categories: { id: number; name_en: string }[];
    skills: { id: number; name_en: string; group_en: string }[];
}) {
    const editing = Boolean(project);
    const form = useForm({
        name_ar: project?.name_ar ?? '',
        name_en: project?.name_en ?? '',
        description_ar: project?.description_ar ?? '',
        description_en: project?.description_en ?? '',
        category_id: project?.category_id ? String(project.category_id) : '',
        skill_ids: project?.skill_ids ?? ([] as number[]),
        url: project?.url ?? '',
        repository_url: project?.repository_url ?? '',
        is_featured: project?.is_featured ?? false,
        is_visible: project?.is_visible ?? true,
        sort_order: project?.sort_order ?? 0,
        image: null as File | null,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            category_id: data.category_id || null,
            ...(editing ? { _method: 'put' } : {}),
        }));
        form.post(editing ? update.url(project!.id) : store.url(), {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const toggleSkill = (id: number, checked: boolean) => {
        form.setData(
            'skill_ids',
            checked
                ? [...form.data.skill_ids, id]
                : form.data.skill_ids.filter((skillId) => skillId !== id),
        );
    };

    return (
        <>
            <Head title={editing ? 'Edit project' : 'New project'} />
            <form
                onSubmit={submit}
                className="mx-auto w-full max-w-6xl p-5 sm:p-8"
            >
                <PageHeading
                    eyebrow="Case study"
                    title={editing ? 'Edit project' : 'New project'}
                    description="Lead with the outcome, explain the work clearly, and connect the tools that made it possible."
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
                                Save project
                            </Button>
                        </div>
                    }
                />
                <FormSection
                    title="Story"
                    description="Bilingual title and project narrative."
                >
                    <Field
                        label="Project name · English"
                        error={form.errors.name_en}
                    >
                        <TextInput
                            value={form.data.name_en}
                            onChange={(e) =>
                                form.setData('name_en', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="اسم المشروع · العربية"
                        error={form.errors.name_ar}
                    >
                        <TextInput
                            dir="rtl"
                            value={form.data.name_ar}
                            onChange={(e) =>
                                form.setData('name_ar', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Description · English"
                        error={form.errors.description_en}
                    >
                        <Textarea
                            className="min-h-44"
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
                            className="min-h-44"
                            value={form.data.description_ar}
                            onChange={(e) =>
                                form.setData('description_ar', e.target.value)
                            }
                        />
                    </Field>
                </FormSection>
                <FormSection
                    title="Classification"
                    description="Use categories and skills to make the work easier to scan."
                >
                    <Field label="Category" error={form.errors.category_id}>
                        <select
                            value={form.data.category_id}
                            onChange={(e) =>
                                form.setData('category_id', e.target.value)
                            }
                            className="h-10 rounded-md border bg-card px-3 text-sm"
                        >
                            <option value="">No category</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name_en}
                                </option>
                            ))}
                        </select>
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
                    <div className="sm:col-span-2">
                        <Label>Skills</Label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-3">
                            {skills.map((skill) => (
                                <label
                                    key={skill.id}
                                    className="flex items-center gap-3 rounded-lg border bg-card p-3 text-sm"
                                >
                                    <Checkbox
                                        checked={form.data.skill_ids.includes(
                                            skill.id,
                                        )}
                                        onCheckedChange={(value) =>
                                            toggleSkill(
                                                skill.id,
                                                Boolean(value),
                                            )
                                        }
                                    />
                                    <span>
                                        <strong className="block">
                                            {skill.name_en}
                                        </strong>
                                        <small className="text-muted-foreground">
                                            {skill.group_en}
                                        </small>
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </FormSection>
                <FormSection
                    title="Links & media"
                    description="Add a cover image and optional destinations."
                >
                    <Field label="Live URL" error={form.errors.url}>
                        <TextInput
                            type="url"
                            value={form.data.url}
                            onChange={(e) =>
                                form.setData('url', e.target.value)
                            }
                        />
                    </Field>
                    <Field
                        label="Repository URL"
                        error={form.errors.repository_url}
                    >
                        <TextInput
                            type="url"
                            value={form.data.repository_url}
                            onChange={(e) =>
                                form.setData('repository_url', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Cover image" error={form.errors.image}>
                        <TextInput
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                form.setData(
                                    'image',
                                    e.target.files?.[0] ?? null,
                                )
                            }
                        />
                    </Field>
                    {project?.image_url && (
                        <img
                            src={project.image_url}
                            alt="Current project cover"
                            className="h-28 w-44 rounded-xl border object-cover"
                        />
                    )}
                    <Toggle
                        label="Featured project"
                        checked={form.data.is_featured}
                        onChange={(value) => form.setData('is_featured', value)}
                    />
                    <Toggle
                        label="Publicly visible"
                        checked={form.data.is_visible}
                        onChange={(value) => form.setData('is_visible', value)}
                    />
                </FormSection>
                <div className="flex justify-end pt-8">
                    <Button size="lg" disabled={form.processing}>
                        Save project
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
        <label className="flex items-center gap-3 rounded-lg border bg-card p-4 text-sm font-medium">
            <Checkbox
                checked={checked}
                onCheckedChange={(value) => onChange(Boolean(value))}
            />
            {label}
        </label>
    );
}

ProjectForm.layout = {
    breadcrumbs: [
        { title: 'Projects', href: index() },
        { title: 'Project editor', href: create() },
    ],
};
