import { Link } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import type { PortfolioProject } from '@/types';
import { ProjectDetails } from './project-details';
import { localized } from './public-layout';

export function ProjectQuickView({
    project,
    locale,
}: {
    project: PortfolioProject;
    locale: 'ar' | 'en';
}) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm font-medium underline underline-offset-4"
                >
                    {locale === 'ar'
                        ? 'كل تفاصيل المشروع'
                        : 'Full project details'}{' '}
                    ↗
                </button>
            </DialogTrigger>
            <DialogContent
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                aria-describedby={undefined}
                className="max-h-[88dvh] overflow-y-auto overscroll-contain sm:max-w-4xl"
            >
                <DialogTitle className="pe-8 text-2xl leading-snug">
                    {localized(project, 'name', locale)}
                </DialogTitle>
                <ProjectDetails project={project} locale={locale} />
                <Link
                    className="mt-4 underline underline-offset-4"
                    href={`/work/${project.slug}`}
                >
                    {locale === 'ar'
                        ? 'فتح صفحة دراسة الحالة'
                        : 'Open case study page'}{' '}
                    ↗
                </Link>
            </DialogContent>
        </Dialog>
    );
}
