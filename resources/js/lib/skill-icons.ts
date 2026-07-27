const deviconBase = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

export const skillIconOptions = [
    {
        key: 'aws',
        label: 'AWS',
        url: `${deviconBase}/amazonwebservices/amazonwebservices-plain-wordmark.svg`,
    },
    {
        key: 'bootstrap',
        label: 'Bootstrap',
        url: `${deviconBase}/bootstrap/bootstrap-original.svg`,
    },
    {
        key: 'css3',
        label: 'CSS',
        url: `${deviconBase}/css3/css3-original.svg`,
    },
    {
        key: 'docker',
        label: 'Docker',
        url: `${deviconBase}/docker/docker-original.svg`,
    },
    {
        key: 'figma',
        label: 'Figma',
        url: `${deviconBase}/figma/figma-original.svg`,
    },
    {
        key: 'git',
        label: 'Git',
        url: `${deviconBase}/git/git-original.svg`,
    },
    {
        key: 'github',
        label: 'GitHub',
        url: `${deviconBase}/github/github-original.svg`,
    },
    {
        key: 'html5',
        label: 'HTML',
        url: `${deviconBase}/html5/html5-original.svg`,
    },
    {
        key: 'javascript',
        label: 'JavaScript',
        url: `${deviconBase}/javascript/javascript-original.svg`,
    },
    {
        key: 'laravel',
        label: 'Laravel',
        url: `${deviconBase}/laravel/laravel-original.svg`,
    },
    {
        key: 'mongodb',
        label: 'MongoDB',
        url: `${deviconBase}/mongodb/mongodb-original.svg`,
    },
    {
        key: 'mysql',
        label: 'MySQL',
        url: `${deviconBase}/mysql/mysql-original.svg`,
    },
    {
        key: 'nextjs',
        label: 'Next.js',
        url: `${deviconBase}/nextjs/nextjs-original.svg`,
    },
    {
        key: 'nodejs',
        label: 'Node.js',
        url: `${deviconBase}/nodejs/nodejs-original.svg`,
    },
    {
        key: 'php',
        label: 'PHP',
        url: `${deviconBase}/php/php-original.svg`,
    },
    {
        key: 'postgresql',
        label: 'PostgreSQL',
        url: `${deviconBase}/postgresql/postgresql-original.svg`,
    },
    {
        key: 'postman',
        label: 'Postman',
        url: `${deviconBase}/postman/postman-original.svg`,
    },
    {
        key: 'python',
        label: 'Python',
        url: `${deviconBase}/python/python-original.svg`,
    },
    {
        key: 'react',
        label: 'React',
        url: `${deviconBase}/react/react-original.svg`,
    },
    {
        key: 'redis',
        label: 'Redis',
        url: `${deviconBase}/redis/redis-original.svg`,
    },
    {
        key: 'tailwindcss',
        label: 'Tailwind CSS',
        url: `${deviconBase}/tailwindcss/tailwindcss-original.svg`,
    },
    {
        key: 'typescript',
        label: 'TypeScript',
        url: `${deviconBase}/typescript/typescript-original.svg`,
    },
    {
        key: 'vuejs',
        label: 'Vue.js',
        url: `${deviconBase}/vuejs/vuejs-original.svg`,
    },
    {
        key: 'wordpress',
        label: 'WordPress',
        url: `${deviconBase}/wordpress/wordpress-plain.svg`,
    },
] as const;

export type SkillIconKey = (typeof skillIconOptions)[number]['key'];

const skillIconUrls = Object.fromEntries(
    skillIconOptions.map(({ key, url }) => [key, url]),
) as Record<SkillIconKey, string>;

const automaticIconKeys: Record<string, SkillIconKey> = {
    'amazon web services': 'aws',
    aws: 'aws',
    bootstrap: 'bootstrap',
    css: 'css3',
    css3: 'css3',
    docker: 'docker',
    figma: 'figma',
    git: 'git',
    github: 'github',
    html: 'html5',
    html5: 'html5',
    javascript: 'javascript',
    js: 'javascript',
    laravel: 'laravel',
    mongodb: 'mongodb',
    mysql: 'mysql',
    nextjs: 'nextjs',
    'next js': 'nextjs',
    node: 'nodejs',
    nodejs: 'nodejs',
    'node js': 'nodejs',
    php: 'php',
    postgresql: 'postgresql',
    postgres: 'postgresql',
    postman: 'postman',
    python: 'python',
    react: 'react',
    'rest api': 'postman',
    'rest apis': 'postman',
    redis: 'redis',
    tailwind: 'tailwindcss',
    'tailwind css': 'tailwindcss',
    typescript: 'typescript',
    ts: 'typescript',
    vue: 'vuejs',
    vuejs: 'vuejs',
    'vue js': 'vuejs',
    wordpress: 'wordpress',
};

const normalizeSkillName = (name: string): string =>
    name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

export function getSkillIconUrl(
    iconKey: string | null | undefined,
): string | null {
    if (!iconKey || !(iconKey in skillIconUrls)) {
        return null;
    }

    return skillIconUrls[iconKey as SkillIconKey];
}

export function getAutomaticSkillIconUrl(name: string): string | null {
    const iconKey = automaticIconKeys[normalizeSkillName(name)];

    return iconKey ? skillIconUrls[iconKey] : null;
}

export function resolveSkillIconUrl(
    iconKey: string | null | undefined,
    name: string,
): string | null {
    return getSkillIconUrl(iconKey) ?? getAutomaticSkillIconUrl(name);
}
