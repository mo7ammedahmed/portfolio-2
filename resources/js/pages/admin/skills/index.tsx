import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PageHeading } from '@/components/admin/page-heading';
import {
    EmptyState,
    Pagination,
    ResourceActions,
} from '@/components/admin/resource-ui';
import { Button } from '@/components/ui/button';
import { resolveSkillIconUrl } from '@/lib/skill-icons';
import { create, destroy, edit, index } from '@/routes/portfolio/skills';
import type { Paginated } from '@/types';

type SkillRow = {
    id: number;
    name_ar: string;
    name_en: string;
    group_en: string;
    proficiency: number;
    is_visible: boolean;
    sort_order: number;
    icon_key: string | null;
    image_url: string | null;
};

export default function SkillsIndex({
    skills,
}: {
    skills: Paginated<SkillRow>;
}) {
    return (
        <>
            <Head title="Skills" />
            <div className="mx-auto w-full max-w-6xl p-5 sm:p-8">
                <PageHeading
                    eyebrow="Capabilities"
                    title="Skills"
                    description="Organize your technical range, upload its visual identity, and control exactly what appears in Tech Stack."
                    action={
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                New skill
                            </Link>
                        </Button>
                    }
                />
                {skills.data.length ? (
                    <>
                        <div className="mt-8 overflow-hidden rounded-xl border bg-card">
                            <div className="divide-y">
                                {skills.data.map((skill) => {
                                    const iconUrl =
                                        skill.image_url ??
                                        resolveSkillIconUrl(
                                            skill.icon_key,
                                            skill.name_en,
                                        );

                                    return (
                                        <div
                                            key={skill.id}
                                            className="grid gap-4 p-5 md:grid-cols-[1fr_10rem_1fr_6rem] md:items-center"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="grid size-11 place-items-center overflow-hidden rounded-xl border bg-white font-mono text-xs text-neutral-900 shadow-[0_8px_18px_-10px_rgb(0_0_0/.35)]">
                                                    {iconUrl ? (
                                                        <img
                                                            src={iconUrl}
                                                            alt=""
                                                            className="size-full bg-white object-contain p-1.5"
                                                        />
                                                    ) : (
                                                        skill.name_en
                                                            .slice(0, 2)
                                                            .toUpperCase()
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">
                                                        {skill.name_en}
                                                    </p>
                                                    <p
                                                        dir="rtl"
                                                        className="text-sm text-muted-foreground"
                                                    >
                                                        {skill.name_ar}
                                                    </p>
                                                </div>
                                            </div>
                                            <span>
                                                <span className="studio-pill is-accent">
                                                    {skill.group_en}
                                                </span>
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <div className="studio-meter flex-1">
                                                    <i
                                                        style={{
                                                            width: `${skill.proficiency}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="w-9 text-xs font-semibold text-muted-foreground tabular-nums">
                                                    {skill.proficiency}%
                                                </span>
                                            </div>
                                            <ResourceActions
                                                editHref={edit.url(skill.id)}
                                                deleteHref={destroy.url(
                                                    skill.id,
                                                )}
                                                label={skill.name_en}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <Pagination pagination={skills} />
                    </>
                ) : (
                    <div className="mt-8">
                        <EmptyState
                            title="No skills yet"
                            description="Add your strongest capabilities and group them by frontend, backend, data, or infrastructure."
                            action={
                                <Button asChild>
                                    <Link href={create()}>Add a skill</Link>
                                </Button>
                            }
                        />
                    </div>
                )}
            </div>
        </>
    );
}

SkillsIndex.layout = { breadcrumbs: [{ title: 'Skills', href: index() }] };
