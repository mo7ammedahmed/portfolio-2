import type { PortfolioProject } from '@/types';

export function projectRepositories(
    project: Pick<PortfolioProject, 'repository_url' | 'repositories'>,
) {
    const links = [...(project.repositories ?? [])];

    if (
        project.repository_url &&
        !links.some((link) => link.url === project.repository_url)
    ) {
        links.unshift({
            label: 'Source / المصدر',
            url: project.repository_url,
        });
    }

    return links.filter(
        (link, index) =>
            links.findIndex((candidate) => candidate.url === link.url) ===
            index,
    );
}
