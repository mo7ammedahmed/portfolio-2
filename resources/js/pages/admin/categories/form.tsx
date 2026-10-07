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
import { create, index, store, update } from '@/routes/portfolio/categories';

type CategoryData = {
    id: number;
    name_ar: string;
    name_en: string;
    description_ar: string;
    description_en: string;
    color: string;
    is_visible: boolean;
    sort_order: number;
};

export default function CategoryForm({
    category,
}: {
    category: CategoryData | null;
}) {
    const editing = Boolean(category);
    const form = useForm({
        name_ar: category?.name_ar ?? '',
        name_en: category?.name_en ?? '',
        description_ar: category?.description_ar ?? '',
        description_en: category?.description_en ?? '',
        color: category?.color ?? '#ff5b35',
        is_visible: category?.is_visible ?? true,
        sort_order: category?.sort_order ?? 0,
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (editing) {
            form.put(update.url(category!.id));
        } else {
            form.post(store.url());
        }
    };

    return (
        <>
            <Head title={editing ? 'Edit category' : 'New category'} />
            <form
                onSubmit={submit}
                className="mx-auto w-full max-w-5xl p-5 sm:p-8"
            >
                <PageHeading
                    eyebrow="Taxonomy entry"
                    title={editing ? 'Edit category' : 'New category'}
                    description="Keep labels broad, distinct, and easy for visitors to understand."
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
                                Save
                            </Button>
                        </div>
                    }
                />
                <FormSection
                    title="Category"
                    description="Label and describe this body of work in both languages."
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
                    description="Color, publishing status, and display order."
                >
                    <Field label="Color" error={form.errors.color}>
                        <div className="flex gap-3">
                            <input
                                aria-label="Category color"
                                type="color"
                                value={form.data.color}
                                onChange={(e) =>
                                    form.setData('color', e.target.value)
                                }
                                className="h-10 w-14 rounded-md border bg-card p-1"
                            />
                            <TextInput
                                value={form.data.color}
                                onChange={(e) =>
                                    form.setData('color', e.target.value)
                                }
                            />
                        </div>
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
                </FormSection>
                <div className="flex justify-end pt-8">
                    <Button size="lg" disabled={form.processing}>
                        Save category
                    </Button>
                </div>
            </form>
        </>
    );
}

CategoryForm.layout = {
    breadcrumbs: [
        { title: 'Categories', href: index() },
        { title: 'Category editor', href: create() },
    ],
};
