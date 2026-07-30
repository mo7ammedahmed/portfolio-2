import { Form, Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ArrowUpRight,
    Code2,
    Github,
    Globe2,
    Languages,
    Linkedin,
    Mail,
    MapPin,
    MessageCircle,
    Moon,
    Phone,
    Send,
    Sun,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ComponentType, CSSProperties, ReactNode } from 'react';
import { MarketingIntegrations } from '@/components/portfolio/marketing-integrations';
import { ShaderFlow } from '@/components/portfolio/shader-flow';
import { useAppearance } from '@/hooks/use-appearance';
import { resolveSkillIconUrl } from '@/lib/skill-icons';
import { dashboard, login } from '@/routes';
import { store as storeContactMessage } from '@/routes/contact';
import type {
    Localized,
    PortfolioExperience,
    PortfolioProfile,
    PortfolioProject,
    PortfolioSkill,
    TrackingIntegration,
} from '@/types';

type Props = {
    profile: PortfolioProfile | null;
    projects: PortfolioProject[];
    experiences: PortfolioExperience[];
    skills: PortfolioSkill[];
    categories: (Localized & { id: number; color: string })[];
    trackingIntegrations: TrackingIntegration[];
    stats?: {
        projects: number;
        years: number;
        skills: number;
        categories: number;
    };
};

type ThreeSceneProps = {
    accent: string;
    className?: string;
    isDark: boolean;
};

function ClientOnlyThreeScene(props: ThreeSceneProps) {
    const [Scene, setScene] = useState<ComponentType<ThreeSceneProps> | null>(
        null,
    );

    useEffect(() => {
        let mounted = true;

        void import('@/components/portfolio/three-deconstruction').then(
            (module) => {
                if (mounted) {
                    setScene(() => module.ThreeDeconstruction);
                }
            },
        );

        return () => {
            mounted = false;
        };
    }, []);

    return Scene ? <Scene {...props} /> : null;
}

const hexToRgb = (hex: string): [number, number, number] => {
    const normalized = hex.replace('#', '');
    const value = Number.parseInt(normalized, 16);

    return [
        ((value >> 16) & 255) / 255,
        ((value >> 8) & 255) / 255,
        (value & 255) / 255,
    ];
};

const createSkillRows = (skillItems: PortfolioSkill[]): PortfolioSkill[][] => {
    if (skillItems.length === 0) {
        return [];
    }

    const rows: PortfolioSkill[][] = [];
    let rowSize = Math.ceil((Math.sqrt(8 * skillItems.length + 1) - 1) / 2);
    let offset = 0;

    while (offset < skillItems.length) {
        const remaining = skillItems.length - offset;
        const currentSize = Math.min(rowSize, remaining);

        rows.push(skillItems.slice(offset, offset + currentSize));
        offset += currentSize;
        rowSize = Math.max(1, rowSize - 1);
    }

    return rows;
};

const displayExperienceYear = (
    experience: PortfolioExperience,
    presentLabel: string,
): string => {
    if (experience.is_current) {
        return presentLabel.toUpperCase();
    }

    return experience.started_at.slice(0, 4);
};

const copy = {
    en: {
        nav: ['Home', 'Work', 'Skills', 'About', 'Contact'],
        greeting: 'Hello, I’m',
        available: 'Available for selected projects',
        contact: 'Contact',
        viewWork: 'View my work',
        systemLabel: 'Independent product engineering',
        systemState: 'System online',
        scrollCue: 'Scroll to deconstruct',
        workAct: 'Act 03 / Output systems',
        skillsAct: 'Act 02 / Technical constellation',
        aboutAct: 'Act 01 / Internal architecture',
        contactAct: 'Act 04 / Reassembly',
        workEyebrow: 'Selected work',
        workTitle: 'Products made to be used.',
        workBody:
            'A selection of web platforms, product systems, and focused digital experiences.',
        workHeadingLead: 'My',
        workHeadingAccent: 'Work',
        workSwipe: 'Swipe through projects',
        workProgress: 'Go to project',
        workCtaTitle: 'Want to see your product here?',
        workCtaBody:
            'Let’s turn the next idea into a focused, dependable release.',
        skillsEyebrow: 'Technical stack',
        skillsTitle: 'Tools arranged as a working system.',
        skillsBody:
            'The languages, frameworks, and platforms I use to move from product idea to dependable release.',
        stackHeading: 'Tech Stack',
        careerHeading: 'My career',
        careerAccent: 'experience',
        live: 'Live project',
        source: 'Source',
        aboutEyebrow: 'About',
        aboutTitle: 'Built across the stack.',
        capabilities: 'Capabilities',
        experience: 'Experience',
        projects: 'Projects',
        years: 'Years',
        skills: 'Skills',
        disciplines: 'Disciplines',
        present: 'Present',
        now: 'NOW',
        contactEyebrow: 'Start a conversation',
        contactTitle: 'Let’s build something useful.',
        contactBody:
            'I’m open to product builds, platform redesigns, and long-term engineering partnerships.',
        email: 'Email me',
        emailAddress: 'Email',
        phone: 'Phone',
        whatsapp: 'WhatsApp',
        whatsappAction: 'Start a conversation',
        website: 'Website',
        location: 'Location',
        contactDetails: 'Direct channels',
        formName: 'Your name',
        formEmail: 'Your email',
        formSubject: 'Subject',
        formMessage: 'Your message',
        formSend: 'Send message',
        formSending: 'Sending…',
        formSuccess: 'Message sent. I’ll get back to you soon.',
        studio: 'Studio',
        language: 'العربية',
        themeLight: 'Use light theme',
        themeDark: 'Use dark theme',
        footer: 'Designed with intent. Engineered for real use.',
    },
    ar: {
        nav: ['الرئيسية', 'الأعمال', 'المهارات', 'نبذة', 'تواصل'],
        greeting: 'مرحباً، أنا',
        available: 'متاح لمشاريع مختارة',
        contact: 'تواصل',
        viewWork: 'شاهد أعمالي',
        systemLabel: 'هندسة منتجات رقمية مستقلة',
        systemState: 'النظام يعمل',
        scrollCue: 'مرّر لتفكيك المنظومة',
        workAct: 'الفصل 03 / أنظمة الإنتاج',
        skillsAct: 'الفصل 02 / المنظومة التقنية',
        aboutAct: 'الفصل 01 / البنية الداخلية',
        contactAct: 'الفصل 04 / إعادة التجميع',
        workEyebrow: 'أعمال مختارة',
        workTitle: 'منتجات صُممت لتُستخدم.',
        workBody:
            'مجموعة من منصات الويب، وأنظمة المنتجات، والتجارب الرقمية المركزة.',
        workHeadingLead: 'من',
        workHeadingAccent: 'أعمالي',
        workSwipe: 'اسحب لاستعراض المشاريع',
        workProgress: 'انتقل إلى المشروع',
        workCtaTitle: 'هل تريد أن يكون منتجك هنا؟',
        workCtaBody: 'لنحوّل الفكرة القادمة إلى منتج واضح وموثوق.',
        skillsEyebrow: 'التقنيات',
        skillsTitle: 'أدوات مترابطة ضمن منظومة عمل.',
        skillsBody:
            'اللغات والأطر والمنصات التي أستخدمها لتحويل فكرة المنتج إلى إصدار موثوق.',
        stackHeading: 'المنظومة التقنية',
        careerHeading: 'مسيرتي',
        careerAccent: 'وخبراتي',
        live: 'المشروع المباشر',
        source: 'المصدر',
        aboutEyebrow: 'نبذة',
        aboutTitle: 'خبرة تغطي كامل المنتج.',
        capabilities: 'القدرات',
        experience: 'الخبرة',
        projects: 'المشاريع',
        years: 'السنوات',
        skills: 'المهارات',
        disciplines: 'المجالات',
        present: 'حتى الآن',
        now: 'الآن',
        contactEyebrow: 'ابدأ محادثة',
        contactTitle: 'لنبنِ شيئاً يستحق الاستخدام.',
        contactBody:
            'متاح لبناء المنتجات، وإعادة تصميم المنصات، وشراكات التطوير طويلة المدى.',
        email: 'راسلني',
        emailAddress: 'البريد الإلكتروني',
        phone: 'الهاتف',
        whatsapp: 'واتساب',
        whatsappAction: 'ابدأ محادثة',
        website: 'الموقع الإلكتروني',
        location: 'الموقع',
        contactDetails: 'قنوات التواصل',
        formName: 'الاسم',
        formEmail: 'البريد الإلكتروني',
        formSubject: 'الموضوع',
        formMessage: 'الرسالة',
        formSend: 'إرسال الرسالة',
        formSending: 'جارٍ الإرسال…',
        formSuccess: 'تم إرسال رسالتك بنجاح.',
        studio: 'الاستوديو',
        language: 'English',
        themeLight: 'استخدم المظهر الفاتح',
        themeDark: 'استخدم المظهر الداكن',
        footer: 'صُمم بقصد. وهُندس للاستخدام الحقيقي.',
    },
} as const;

export default function Welcome({
    profile,
    projects,
    experiences,
    skills,
    categories,
    trackingIntegrations,
    stats,
}: Props) {
    const [locale, setLocale] = useState<'en' | 'ar'>('en');
    const [activeSection, setActiveSection] = useState<
        'home' | 'work' | 'skills' | 'about' | 'contact'
    >('home');
    const [activeWorkCard, setActiveWorkCard] = useState(0);
    const portfolioRef = useRef<HTMLDivElement | null>(null);
    const workStripRef = useRef<HTMLDivElement | null>(null);
    const { resolvedAppearance, updateAppearance } = useAppearance();
    const { auth } = usePage().props;
    const rtl = locale === 'ar';
    const text = copy[locale];
    const isDark = resolvedAppearance === 'dark';

    useEffect(() => {
        document.documentElement.lang = locale;
        document.documentElement.dir = rtl ? 'rtl' : 'ltr';

        return () => {
            document.documentElement.lang = 'en';
            document.documentElement.dir = 'ltr';
        };
    }, [locale, rtl]);

    useEffect(() => {
        const sections = ['home', 'about', 'skills', 'work', 'contact']
            .map((id) => document.getElementById(id))
            .filter((section): section is HTMLElement => section !== null);
        const observer = new IntersectionObserver(
            (entries) => {
                const visibleSection = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (first, second) =>
                            second.intersectionRatio - first.intersectionRatio,
                    )[0];

                if (
                    visibleSection &&
                    ['home', 'about', 'skills', 'work', 'contact'].includes(
                        visibleSection.target.id,
                    )
                ) {
                    setActiveSection(
                        visibleSection.target.id as
                            'home' | 'about' | 'skills' | 'work' | 'contact',
                    );
                }
            },
            {
                rootMargin: '-20% 0px -55%',
                threshold: [0, 0.2, 0.5],
            },
        );

        sections.forEach((section) => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const root = portfolioRef.current;
        const hero = document.getElementById('home');

        if (!root || !hero) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        let frame = 0;

        const updateHeroProgress = () => {
            frame = 0;

            if (reducedMotion.matches) {
                root.style.setProperty('--hero-progress', '0');

                return;
            }

            const rect = hero.getBoundingClientRect();
            const scrollRange = Math.max(
                hero.offsetHeight - window.innerHeight,
                1,
            );
            const progress = Math.min(1, Math.max(0, -rect.top / scrollRange));

            root.style.setProperty('--hero-progress', progress.toFixed(4));
        };

        const requestProgressUpdate = () => {
            if (!frame) {
                frame = requestAnimationFrame(updateHeroProgress);
            }
        };

        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute('data-visible', 'true');
                    }
                });
            },
            { rootMargin: '0px 0px -4%', threshold: 0.02 },
        );

        root.querySelectorAll('[data-kinetic]').forEach((element) => {
            revealObserver.observe(element);
        });
        updateHeroProgress();
        window.addEventListener('scroll', requestProgressUpdate, {
            passive: true,
        });
        window.addEventListener('resize', requestProgressUpdate);
        reducedMotion.addEventListener('change', requestProgressUpdate);

        return () => {
            cancelAnimationFrame(frame);
            revealObserver.disconnect();
            window.removeEventListener('scroll', requestProgressUpdate);
            window.removeEventListener('resize', requestProgressUpdate);
            reducedMotion.removeEventListener('change', requestProgressUpdate);
        };
    }, []);

    useEffect(() => {
        let cancelled = false;
        let revertAnimations: (() => void) | null = null;

        void Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
            ([gsapModule, scrollTriggerModule]) => {
                if (cancelled || !portfolioRef.current) {
                    return;
                }

                const gsapClient = gsapModule.gsap;
                const ScrollTriggerClient = scrollTriggerModule.ScrollTrigger;
                const reducedMotion = window.matchMedia(
                    '(prefers-reduced-motion: reduce)',
                ).matches;

                gsapClient.registerPlugin(ScrollTriggerClient);

                if (reducedMotion) {
                    return;
                }

                const context = gsapClient.context(() => {
                    const workSection = document.querySelector<HTMLElement>(
                        '.portfolio-work-pin',
                    );
                    const workTrack = document.querySelector<HTMLElement>(
                        '.portfolio-work-track',
                    );

                    if (workSection && workTrack) {
                        const responsiveMotion = gsapClient.matchMedia();

                        responsiveMotion.add('(min-width: 769px)', () => {
                            const distance = () =>
                                Math.max(
                                    workTrack.scrollWidth - window.innerWidth,
                                    0,
                                );
                            const scrollDuration = () =>
                                Math.max(
                                    distance() * 2.4,
                                    window.innerHeight * 2.6,
                                );

                            gsapClient.to(workTrack, {
                                x: () => (rtl ? distance() : -distance()),
                                ease: 'none',
                                scrollTrigger: {
                                    id: 'portfolio-work',
                                    trigger: workSection,
                                    start: 'top top',
                                    end: () => `+=${scrollDuration()}`,
                                    scrub: 1.25,
                                    pin: true,
                                    pinSpacing: true,
                                    anticipatePin: 1,
                                    invalidateOnRefresh: true,
                                },
                            });
                        });
                    }

                    const careerTimeline = gsapClient.timeline({
                        scrollTrigger: {
                            id: 'portfolio-career',
                            trigger: '.portfolio-career',
                            start: 'top 68%',
                            end: 'bottom 35%',
                            scrub: 1.2,
                            invalidateOnRefresh: true,
                        },
                    });

                    careerTimeline
                        .fromTo(
                            '.portfolio-career-line',
                            { scaleY: 0, opacity: 0 },
                            {
                                scaleY: 1,
                                opacity: 1,
                                duration: 1,
                                ease: 'none',
                            },
                            0,
                        )
                        .fromTo(
                            '.portfolio-career-row',
                            { opacity: 0.18, y: 24 },
                            {
                                opacity: 1,
                                y: 0,
                                stagger: 0.12,
                                duration: 0.55,
                            },
                            0,
                        );
                }, portfolioRef.current);

                revertAnimations = () => context.revert();

                void document.fonts.ready.then(() => {
                    if (!cancelled) {
                        ScrollTriggerClient.refresh();
                    }
                });
            },
        );

        return () => {
            cancelled = true;
            revertAnimations?.();
        };
    }, [experiences.length, projects.length, rtl]);

    if (!profile) {
        return <PortfolioSetup authenticated={Boolean(auth.user)} />;
    }

    const pick = (item: unknown, field: string): string => {
        const values = item as Record<string, unknown>;

        return String(values[`${field}_${locale}`] ?? '');
    };

    const name = pick(profile, 'name');
    const role = pick(profile, 'role');
    const location = pick(profile, 'location');
    const whatsappHref = profile.whatsapp
        ? profile.whatsapp.startsWith('http')
            ? profile.whatsapp
            : `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`
        : null;
    const roleWords = role.split(/\s+/).filter(Boolean);
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('');
    const systemItems = skills
        .slice(0, 7)
        .map((skill) => pick(skill, 'name'))
        .filter(Boolean);
    const skillRows = createSkillRows(skills);
    const workCardCount = projects.length + 1;
    const updateMobileWorkProgress = () => {
        const strip = workStripRef.current;

        if (!strip || window.innerWidth > 768) {
            return;
        }

        const stripRect = strip.getBoundingClientRect();
        const stripCenter = stripRect.left + stripRect.width / 2;
        const cards = Array.from(
            strip.querySelectorAll<HTMLElement>('[data-work-card]'),
        );
        let nearestIndex = 0;
        let nearestDistance = Number.POSITIVE_INFINITY;

        cards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(cardCenter - stripCenter);

            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestIndex = index;
            }
        });

        setActiveWorkCard(nearestIndex);
    };
    const scrollToWorkCard = (index: number) => {
        const strip = workStripRef.current;
        const card =
            strip?.querySelectorAll<HTMLElement>('[data-work-card]')[index];

        if (!strip || !card) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;
        const stripRect = strip.getBoundingClientRect();
        const cardRect = card.getBoundingClientRect();
        const horizontalDelta =
            cardRect.left +
            cardRect.width / 2 -
            (stripRect.left + stripRect.width / 2);

        strip.scrollTo({
            left: strip.scrollLeft + horizontalDelta,
            behavior: reducedMotion ? 'auto' : 'smooth',
        });
    };
    const palette = isDark
        ? {
              background: profile.theme_dark_background || '#070707',
              foreground: profile.theme_dark_foreground || '#f4f4f1',
              surface: profile.theme_dark_surface || '#0d0d0d',
              muted: profile.theme_dark_muted || '#a4a4a0',
              border: `${profile.theme_dark_foreground || '#f4f4f1'}1a`,
          }
        : {
              background: profile.theme_light_background || '#f4f3ee',
              foreground: profile.theme_light_foreground || '#0a0a0a',
              surface: profile.theme_light_surface || '#ffffff',
              muted: profile.theme_light_muted || '#686864',
              border: `${profile.theme_light_foreground || '#0a0a0a'}1f`,
          };
    const accent = isDark
        ? profile.theme_dark_accent || '#d9ff43'
        : profile.theme_light_accent || '#006c55';
    const accentForeground =
        hexToRgb(accent).reduce(
            (luminance, channel, index) =>
                luminance + channel * [0.2126, 0.7152, 0.0722][index],
            0,
        ) > 0.55
            ? '#090a09'
            : '#ffffff';
    const shaderPalette = isDark
        ? {
              background: hexToRgb(palette.background),
              low: hexToRgb(palette.surface),
              high: hexToRgb(palette.muted),
          }
        : {
              background: hexToRgb(palette.background),
              low: hexToRgb(palette.muted),
              high: hexToRgb(palette.surface),
          };

    return (
        <div
            ref={portfolioRef}
            dir={rtl ? 'rtl' : 'ltr'}
            data-glass={profile.glass_effect_enabled ? 'enabled' : 'disabled'}
            className="min-h-screen bg-[var(--portfolio-background)] p-0 font-sans antialiased transition-colors duration-500 md:p-2"
            style={
                {
                    '--portfolio-background': palette.background,
                    '--portfolio-foreground': palette.foreground,
                    '--portfolio-surface': palette.surface,
                    '--portfolio-muted': palette.muted,
                    '--portfolio-border': palette.border,
                    '--portfolio-accent': accent,
                } as CSSProperties
            }
        >
            <MarketingIntegrations integrations={trackingIntegrations} />
            <Head title={`${name} — ${role}`}>
                <meta
                    name="description"
                    content={pick(profile, 'short_description')}
                />
                <meta name="theme-color" content={palette.background} />
            </Head>

            <a
                href="#main-content"
                className="fixed top-3 left-3 z-[100] -translate-y-24 rounded-lg bg-[var(--portfolio-foreground)] px-4 py-2 text-sm font-semibold text-[var(--portfolio-background)] transition-transform focus:translate-y-0"
            >
                Skip to content
            </a>

            <div className="relative min-h-screen overflow-x-clip bg-[var(--portfolio-background)] text-[var(--portfolio-foreground)] transition-colors duration-500 md:rounded-[2rem]">
                <ClientOnlyThreeScene
                    className="pointer-events-none fixed inset-0 size-full md:inset-2 md:h-[calc(100%-1rem)] md:w-[calc(100%-1rem)] md:rounded-[2rem]"
                    accent={accent}
                    isDark={isDark}
                />

                <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-3 md:top-7">
                    <nav
                        aria-label="Primary navigation"
                        className={`portfolio-primary-nav flex items-center rounded-full border border-white/10 p-1.5 text-[#f5f5f2] shadow-2xl shadow-black/25 ${
                            profile.glass_effect_enabled
                                ? 'bg-[#0a0a0a]/72'
                                : 'bg-[#0a0a0a]/95'
                        }`}
                    >
                        {[
                            ['home', text.nav[0]],
                            ['about', text.nav[3]],
                            ['skills', text.nav[2]],
                            ['work', text.nav[1]],
                            ['contact', text.nav[4]],
                        ].map(([target, label]) => (
                            <a
                                key={target}
                                href={`#${target}`}
                                className={`rounded-full px-2.5 py-2 text-[11px] font-medium transition-colors sm:px-5 sm:text-sm ${
                                    activeSection === target
                                        ? ''
                                        : 'text-white/58 hover:text-white'
                                }`}
                                style={
                                    activeSection === target
                                        ? {
                                              background: accent,
                                              color: accentForeground,
                                          }
                                        : undefined
                                }
                                aria-current={
                                    activeSection === target
                                        ? 'location'
                                        : undefined
                                }
                            >
                                {label}
                            </a>
                        ))}
                        <span className="mx-1 h-5 w-px bg-white/12" />
                        <button
                            type="button"
                            onClick={() => setLocale(rtl ? 'en' : 'ar')}
                            className="grid size-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            aria-label={`Switch language to ${text.language}`}
                            title={text.language}
                        >
                            <Languages className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() =>
                                updateAppearance(isDark ? 'light' : 'dark')
                            }
                            className="grid size-9 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/8 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                            aria-label={
                                isDark ? text.themeLight : text.themeDark
                            }
                            title={isDark ? text.themeLight : text.themeDark}
                        >
                            {isDark ? (
                                <Sun className="size-4" />
                            ) : (
                                <Moon className="size-4" />
                            )}
                        </button>
                    </nav>
                </header>

                <Link
                    href={auth.user ? dashboard() : login()}
                    className="fixed top-6 right-6 z-50 hidden items-center gap-2 rounded-full border border-[var(--portfolio-border)] bg-[var(--portfolio-background)]/85 px-4 py-2 text-xs font-semibold shadow-sm backdrop-blur-md transition-colors hover:bg-[var(--portfolio-surface)] lg:flex"
                >
                    <Code2 className="size-3.5" />
                    {text.studio}
                </Link>

                <main id="main-content" className="relative z-10">
                    <section
                        id="home"
                        className="relative min-h-svh lg:min-h-[165svh]"
                    >
                        <div className="relative min-h-svh lg:sticky lg:top-0">
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_65%_42%,color-mix(in_srgb,var(--portfolio-accent)_10%,transparent),transparent_30%),linear-gradient(180deg,transparent_65%,var(--portfolio-background))]"
                            />
                            <div
                                aria-hidden="true"
                                className="portfolio-calibration pointer-events-none absolute inset-4 hidden sm:block"
                            >
                                <span className="portfolio-corner portfolio-corner-tl" />
                                <span className="portfolio-corner portfolio-corner-tr" />
                                <span className="portfolio-corner portfolio-corner-bl" />
                                <span className="portfolio-corner portfolio-corner-br" />
                                <span className="absolute top-1/2 left-0 h-px w-10 bg-[var(--portfolio-border)]" />
                                <span className="absolute top-1/2 right-0 h-px w-10 bg-[var(--portfolio-border)]" />
                            </div>

                            <div className="relative mx-auto grid min-h-svh w-full max-w-[1240px] items-center gap-16 px-5 pt-32 pb-28 sm:px-10 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:pt-28">
                                <div className="portfolio-reveal flex flex-col items-start">
                                    <div className="mb-8 flex w-full items-center justify-between gap-5 border-b border-[var(--portfolio-border)] pb-3 font-mono text-[10px] tracking-[0.18em] text-[var(--portfolio-muted)] uppercase">
                                        <span>00 / Origin</span>
                                        <span>{text.systemLabel}</span>
                                    </div>
                                    <p className="text-sm font-semibold tracking-[-0.02em] sm:text-lg">
                                        {text.greeting}{' '}
                                        <span className="text-[var(--portfolio-muted)]">
                                            {name}
                                        </span>
                                    </p>
                                    <h1 className="portfolio-role mt-5 max-w-[12ch] text-[clamp(3.35rem,7.2vw,6.4rem)] leading-[0.82] font-medium tracking-[-0.075em]">
                                        {roleWords.map((word, index) => (
                                            <span
                                                key={`${word}-${index}`}
                                                className="portfolio-role-word"
                                                style={
                                                    {
                                                        '--word-index': index,
                                                    } as CSSProperties
                                                }
                                            >
                                                {word}{' '}
                                            </span>
                                        ))}
                                    </h1>
                                    <p className="mt-7 max-w-[35rem] text-base leading-7 tracking-[-0.02em] text-[var(--portfolio-muted)] sm:text-xl sm:leading-8">
                                        {pick(profile, 'short_description')}
                                    </p>
                                    <div className="mt-8 flex flex-wrap gap-3">
                                        <a
                                            href={`mailto:${profile.email}`}
                                            className="portfolio-impact-button inline-flex items-center gap-2 bg-[var(--portfolio-foreground)] px-5 py-3 text-sm font-semibold text-[var(--portfolio-background)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--portfolio-accent)]"
                                        >
                                            <Mail className="size-4" />
                                            {text.contact}
                                        </a>
                                        <a
                                            href="#work"
                                            className="group inline-flex items-center gap-2 border border-[var(--portfolio-border)] bg-[var(--portfolio-surface)]/65 px-5 py-3 text-sm font-semibold backdrop-blur-sm transition-colors hover:border-[var(--portfolio-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--portfolio-accent)]"
                                        >
                                            {text.viewWork}
                                            <ArrowRight
                                                className={`size-4 transition-transform ${
                                                    rtl
                                                        ? 'group-hover:-translate-x-1'
                                                        : 'group-hover:translate-x-1'
                                                }`}
                                            />
                                        </a>
                                    </div>
                                    <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[10px] tracking-[0.08em] text-[var(--portfolio-muted)] uppercase">
                                        {profile.is_available && (
                                            <span className="flex items-center gap-2">
                                                <span className="relative flex size-2">
                                                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-[var(--portfolio-accent)] opacity-50 motion-reduce:animate-none" />
                                                    <span className="relative inline-flex size-2 rounded-full bg-[var(--portfolio-accent)]" />
                                                </span>
                                                {text.systemState}
                                            </span>
                                        )}
                                        <span>{pick(profile, 'location')}</span>
                                    </div>
                                </div>

                                <div className="portfolio-reveal portfolio-reveal-delay flex justify-center lg:justify-end">
                                    {profile.image_url ? (
                                        <DeconstructedPortrait
                                            src={profile.image_url}
                                            alt={name}
                                            accent={accent}
                                        />
                                    ) : (
                                        <div className="relative aspect-[4/5] w-full max-w-[430px] border border-[var(--portfolio-border)] bg-[var(--portfolio-surface)] p-2">
                                            <MonogramPortrait
                                                initials={initials}
                                                accent={accent}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="absolute inset-x-0 bottom-0 border-y border-[var(--portfolio-border)] bg-[var(--portfolio-background)]/80 backdrop-blur-md">
                                <SystemsRail
                                    items={systemItems}
                                    fallback={role}
                                />
                            </div>
                            <p className="portfolio-scroll-cue pointer-events-none absolute right-8 bottom-16 hidden origin-bottom-right -rotate-90 font-mono text-[9px] tracking-[0.2em] text-[var(--portfolio-muted)] uppercase lg:block">
                                {text.scrollCue} ↓
                            </p>
                        </div>
                    </section>

                    <section id="about" className="scroll-mt-24 py-24 sm:py-32">
                        <div
                            data-kinetic
                            className="portfolio-kinetic-section mx-auto w-full max-w-[1240px] px-5 sm:px-10"
                        >
                            <p className="mb-12 border-b border-[var(--portfolio-border)] pb-3 font-mono text-[10px] tracking-[0.18em] text-[var(--portfolio-muted)] uppercase">
                                {text.aboutAct}
                            </p>
                            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:gap-20">
                                <div>
                                    <p className="text-xs font-semibold tracking-[0.16em] text-[var(--portfolio-muted)] uppercase">
                                        {text.aboutEyebrow}
                                    </p>
                                    <h2 className="mt-5 text-[clamp(2.75rem,5vw,4.75rem)] leading-[0.98] font-medium tracking-[-0.06em]">
                                        {text.aboutTitle}
                                    </h2>
                                </div>
                                <div className="flex flex-col gap-9">
                                    <p className="text-xl leading-9 tracking-[-0.025em] text-[var(--portfolio-muted)] sm:text-2xl sm:leading-10">
                                        {pick(profile, 'description')}
                                    </p>
                                    <div className="grid grid-cols-2 border-t border-l border-[var(--portfolio-border)]">
                                        {[
                                            [
                                                stats?.projects ??
                                                    projects.length,
                                                text.projects,
                                            ],
                                            [
                                                `${stats?.years ?? 0}+`,
                                                text.years,
                                            ],
                                            [
                                                stats?.skills ?? skills.length,
                                                text.skills,
                                            ],
                                            [
                                                stats?.categories ??
                                                    categories.length,
                                                text.disciplines,
                                            ],
                                        ].map(([value, label]) => (
                                            <div
                                                key={String(label)}
                                                className="border-r border-b border-[var(--portfolio-border)] p-5 sm:p-7"
                                            >
                                                <strong className="block text-4xl font-medium tracking-[-0.06em] sm:text-5xl">
                                                    {value}
                                                </strong>
                                                <span className="mt-3 block text-xs font-medium text-[var(--portfolio-muted)]">
                                                    {label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="portfolio-career mt-24 border-t border-[var(--portfolio-border)] pt-20">
                                <h3 className="portfolio-career-heading">
                                    {text.careerHeading} <span>&</span>
                                    <br />
                                    <em>{text.careerAccent}</em>
                                </h3>
                                <div className="portfolio-career-list">
                                    <span
                                        aria-hidden="true"
                                        className="portfolio-career-line"
                                    >
                                        <span className="portfolio-career-dot" />
                                    </span>
                                    {experiences.map((experience) => (
                                        <article
                                            key={experience.id}
                                            className="portfolio-career-row"
                                        >
                                            <div className="portfolio-career-role">
                                                <h4>
                                                    {pick(experience, 'name')}
                                                </h4>
                                                <p>
                                                    {pick(
                                                        experience,
                                                        'company',
                                                    )}
                                                </p>
                                            </div>
                                            <strong>
                                                {displayExperienceYear(
                                                    experience,
                                                    text.now,
                                                )}
                                            </strong>
                                            <p className="portfolio-career-description">
                                                {pick(
                                                    experience,
                                                    'description',
                                                )}
                                            </p>
                                        </article>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section
                        id="skills"
                        className="portfolio-stack-section relative grid min-h-svh scroll-mt-24 place-items-center overflow-hidden border-b border-[var(--portfolio-border)] py-24 sm:py-32"
                    >
                        <div
                            data-kinetic
                            className="portfolio-kinetic-section mx-auto w-full max-w-[1240px] px-5 sm:px-10"
                        >
                            <p className="text-center font-mono text-[10px] tracking-[0.18em] text-[var(--portfolio-muted)] uppercase">
                                {text.skillsAct}
                            </p>
                            <h2 className="portfolio-stack-heading mt-7 text-center uppercase">
                                {text.stackHeading}
                            </h2>

                            <div
                                className="portfolio-stack-pyramid mt-12"
                                role="list"
                                aria-label={text.skillsEyebrow}
                            >
                                {skillRows.map((row, rowIndex) => (
                                    <div
                                        key={`skill-row-${rowIndex}`}
                                        className="portfolio-stack-row"
                                    >
                                        {row.map((skill) => {
                                            const skillName = pick(
                                                skill,
                                                'name',
                                            );
                                            const icon =
                                                skill.image_url ||
                                                resolveSkillIconUrl(
                                                    skill.icon_key,
                                                    skill.name_en,
                                                );

                                            return (
                                                <div
                                                    key={skill.id}
                                                    role="listitem"
                                                    className="portfolio-stack-item"
                                                    title={`${skillName} — ${skill.proficiency}%`}
                                                >
                                                    {icon ? (
                                                        <img
                                                            src={icon}
                                                            alt=""
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <span
                                                            aria-hidden="true"
                                                            className="portfolio-stack-fallback"
                                                        >
                                                            {skillName
                                                                .slice(0, 2)
                                                                .toUpperCase()}
                                                        </span>
                                                    )}
                                                    <strong>{skillName}</strong>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="work"
                        className="portfolio-work-pin relative flex min-h-svh scroll-mt-24 flex-col overflow-hidden border-b border-[var(--portfolio-border)] pt-24 sm:pt-28"
                    >
                        <div
                            data-kinetic
                            className="portfolio-kinetic-section mx-auto w-full max-w-[1240px] px-5 pb-8 sm:px-10"
                        >
                            <p className="font-mono text-[10px] tracking-[0.18em] text-[var(--portfolio-muted)] uppercase">
                                {text.workAct}
                            </p>
                            <h2 className="portfolio-reference-heading mt-7">
                                {text.workHeadingLead}{' '}
                                <span>{text.workHeadingAccent}</span>
                            </h2>
                        </div>

                        <div className="portfolio-work-mobile-controls">
                            <p>{text.workSwipe}</p>
                            <div
                                className="portfolio-work-dots"
                                role="group"
                                aria-label={text.workSwipe}
                            >
                                {Array.from(
                                    { length: workCardCount },
                                    (_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            aria-label={`${text.workProgress} ${index + 1}`}
                                            aria-current={
                                                activeWorkCard === index
                                                    ? 'true'
                                                    : undefined
                                            }
                                            onClick={() =>
                                                scrollToWorkCard(index)
                                            }
                                        />
                                    ),
                                )}
                            </div>
                            <span dir="ltr">
                                {String(activeWorkCard + 1).padStart(2, '0')} /{' '}
                                {String(workCardCount).padStart(2, '0')}
                            </span>
                        </div>
                        <div
                            ref={workStripRef}
                            className="portfolio-work-strip flex min-h-0 flex-1 overflow-hidden border-y border-[var(--portfolio-border)]"
                            aria-label={text.workEyebrow}
                            onScroll={updateMobileWorkProgress}
                        >
                            <div className="portfolio-work-track flex h-full">
                                {projects.map((project, index) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        index={index}
                                        locale={locale}
                                        labels={{
                                            live: text.live,
                                            source: text.source,
                                        }}
                                        accent={accent}
                                    />
                                ))}
                                <article
                                    data-work-card
                                    className="portfolio-work-card portfolio-work-cta flex shrink-0 flex-col items-center justify-center border-r border-[var(--portfolio-border)] px-8 text-center"
                                >
                                    <span className="font-mono text-[10px] tracking-[0.18em] text-[var(--portfolio-muted)] uppercase">
                                        {String(projects.length + 1).padStart(
                                            2,
                                            '0',
                                        )}{' '}
                                        / Next
                                    </span>
                                    <h3 className="mt-6 max-w-[11ch] text-4xl leading-[0.95] font-medium tracking-[-0.055em] sm:text-5xl">
                                        {text.workCtaTitle}
                                    </h3>
                                    <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--portfolio-muted)]">
                                        {text.workCtaBody}
                                    </p>
                                    <a
                                        href={`mailto:${profile.email}`}
                                        className="portfolio-impact-button mt-8 bg-[var(--portfolio-foreground)] px-6 py-3 text-sm font-semibold text-[var(--portfolio-background)]"
                                    >
                                        {text.contact}
                                    </a>
                                </article>
                            </div>
                        </div>
                    </section>

                    <section
                        id="contact"
                        className="scroll-mt-24 py-16 sm:py-24"
                    >
                        <div
                            data-kinetic
                            className="portfolio-kinetic-section mx-auto w-full max-w-[1240px] px-5 sm:px-10"
                        >
                            <div className="portfolio-reassembly relative overflow-hidden border border-[var(--portfolio-border)] bg-[var(--portfolio-surface)]">
                                <span
                                    aria-hidden="true"
                                    className="absolute top-0 left-[28%] h-full w-px -skew-x-12 bg-[var(--portfolio-border)]"
                                />
                                <span
                                    aria-hidden="true"
                                    className="absolute top-0 right-[18%] h-full w-px skew-x-12 bg-[var(--portfolio-border)]"
                                />
                                <div className="relative overflow-hidden p-7 sm:p-10 lg:p-14">
                                    <ShaderFlow
                                        className="pointer-events-none absolute inset-0 size-full opacity-35"
                                        backgroundColor={
                                            shaderPalette.background
                                        }
                                        colorLow={shaderPalette.low}
                                        colorHigh={shaderPalette.high}
                                        scale={3}
                                        brightness={isDark ? 1.65 : 1.1}
                                        fadeCenterY={0.55}
                                        fadeRadiusX={1.1}
                                        fadeRadiusY={1}
                                    />
                                    <p className="relative mb-16 border-b border-[var(--portfolio-border)] pb-3 font-mono text-[10px] tracking-[0.18em] text-[var(--portfolio-muted)] uppercase">
                                        {text.contactAct}
                                    </p>
                                    <div className="relative grid gap-12 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.16em] text-[var(--portfolio-muted)] uppercase">
                                                {text.contactEyebrow}
                                            </p>
                                            <h2 className="mt-5 max-w-[12ch] text-[clamp(3rem,6vw,5.75rem)] leading-[0.94] font-medium tracking-[-0.065em]">
                                                {text.contactTitle}
                                            </h2>
                                            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--portfolio-muted)]">
                                                {text.contactBody}
                                            </p>
                                            <Form
                                                {...storeContactMessage.form()}
                                                options={{
                                                    preserveScroll: true,
                                                }}
                                                resetOnSuccess
                                                className="mt-10 grid gap-5"
                                            >
                                                {({
                                                    errors,
                                                    processing,
                                                    recentlySuccessful,
                                                }) => (
                                                    <>
                                                        <div className="grid gap-5 sm:grid-cols-2">
                                                            <div className="grid gap-2">
                                                                <label
                                                                    htmlFor="contact-name"
                                                                    className="font-mono text-[10px] tracking-[0.14em] text-[var(--portfolio-muted)] uppercase"
                                                                >
                                                                    {
                                                                        text.formName
                                                                    }
                                                                </label>
                                                                <input
                                                                    id="contact-name"
                                                                    name="name"
                                                                    required
                                                                    maxLength={
                                                                        120
                                                                    }
                                                                    autoComplete="name"
                                                                    className="min-h-12 border border-[var(--portfolio-border)] bg-[var(--portfolio-background)]/75 px-4 text-sm transition-colors outline-none placeholder:text-[var(--portfolio-muted)] focus:border-[var(--portfolio-accent)]"
                                                                />
                                                                {errors.name && (
                                                                    <p className="text-sm text-red-500">
                                                                        {
                                                                            errors.name
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="grid gap-2">
                                                                <label
                                                                    htmlFor="contact-email"
                                                                    className="font-mono text-[10px] tracking-[0.14em] text-[var(--portfolio-muted)] uppercase"
                                                                >
                                                                    {
                                                                        text.formEmail
                                                                    }
                                                                </label>
                                                                <input
                                                                    id="contact-email"
                                                                    name="email"
                                                                    type="email"
                                                                    required
                                                                    maxLength={
                                                                        254
                                                                    }
                                                                    autoComplete="email"
                                                                    className="min-h-12 border border-[var(--portfolio-border)] bg-[var(--portfolio-background)]/75 px-4 text-sm transition-colors outline-none placeholder:text-[var(--portfolio-muted)] focus:border-[var(--portfolio-accent)]"
                                                                />
                                                                {errors.email && (
                                                                    <p className="text-sm text-red-500">
                                                                        {
                                                                            errors.email
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <label
                                                                htmlFor="contact-subject"
                                                                className="font-mono text-[10px] tracking-[0.14em] text-[var(--portfolio-muted)] uppercase"
                                                            >
                                                                {
                                                                    text.formSubject
                                                                }
                                                            </label>
                                                            <input
                                                                id="contact-subject"
                                                                name="subject"
                                                                required
                                                                maxLength={160}
                                                                className="min-h-12 border border-[var(--portfolio-border)] bg-[var(--portfolio-background)]/75 px-4 text-sm transition-colors outline-none placeholder:text-[var(--portfolio-muted)] focus:border-[var(--portfolio-accent)]"
                                                            />
                                                            {errors.subject && (
                                                                <p className="text-sm text-red-500">
                                                                    {
                                                                        errors.subject
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <label
                                                                htmlFor="contact-message"
                                                                className="font-mono text-[10px] tracking-[0.14em] text-[var(--portfolio-muted)] uppercase"
                                                            >
                                                                {
                                                                    text.formMessage
                                                                }
                                                            </label>
                                                            <textarea
                                                                id="contact-message"
                                                                name="message"
                                                                required
                                                                maxLength={5000}
                                                                rows={5}
                                                                className="resize-y border border-[var(--portfolio-border)] bg-[var(--portfolio-background)]/75 px-4 py-3 text-sm leading-6 transition-colors outline-none placeholder:text-[var(--portfolio-muted)] focus:border-[var(--portfolio-accent)]"
                                                            />
                                                            {errors.message && (
                                                                <p className="text-sm text-red-500">
                                                                    {
                                                                        errors.message
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-4">
                                                            <button
                                                                type="submit"
                                                                disabled={
                                                                    processing
                                                                }
                                                                className="portfolio-impact-button inline-flex min-h-12 items-center gap-3 bg-[var(--portfolio-foreground)] px-5 text-sm font-semibold text-[var(--portfolio-background)] disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <Send className="size-4" />
                                                                {processing
                                                                    ? text.formSending
                                                                    : text.formSend}
                                                            </button>
                                                            {recentlySuccessful && (
                                                                <p
                                                                    role="status"
                                                                    className="text-sm text-[var(--portfolio-muted)]"
                                                                >
                                                                    {
                                                                        text.formSuccess
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </Form>
                                        </div>
                                        <div className="flex min-w-0 flex-col gap-5">
                                            <p className="font-mono text-[10px] tracking-[0.16em] text-[var(--portfolio-muted)] uppercase">
                                                {text.contactDetails}
                                            </p>
                                            <a
                                                href={`mailto:${profile.email}`}
                                                className="portfolio-impact-button group flex min-w-0 items-center justify-between gap-4 bg-[var(--portfolio-foreground)] px-5 py-4 text-[var(--portfolio-background)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--portfolio-accent)]"
                                            >
                                                <span className="min-w-0">
                                                    <span className="block text-[10px] font-semibold tracking-[0.14em] uppercase opacity-55">
                                                        {text.email}
                                                    </span>
                                                    <span className="mt-1 block text-sm font-semibold break-all sm:text-base">
                                                        {profile.email}
                                                    </span>
                                                </span>
                                                <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </a>
                                            <div className="grid gap-2">
                                                {profile.mobile && (
                                                    <ContactChannel
                                                        href={`tel:${profile.mobile.replace(/[^\d+]/g, '')}`}
                                                        label={text.phone}
                                                        value={profile.mobile}
                                                    >
                                                        <Phone className="size-4" />
                                                    </ContactChannel>
                                                )}
                                                {whatsappHref && (
                                                    <ContactChannel
                                                        href={whatsappHref}
                                                        label={text.whatsapp}
                                                        value={
                                                            text.whatsappAction
                                                        }
                                                    >
                                                        <MessageCircle className="size-4" />
                                                    </ContactChannel>
                                                )}
                                                {profile.website && (
                                                    <ContactChannel
                                                        href={profile.website}
                                                        label={text.website}
                                                        value={formatWebsite(
                                                            profile.website,
                                                        )}
                                                    >
                                                        <Globe2 className="size-4" />
                                                    </ContactChannel>
                                                )}
                                                {location && (
                                                    <ContactChannel
                                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`}
                                                        label={text.location}
                                                        value={location}
                                                    >
                                                        <MapPin className="size-4" />
                                                    </ContactChannel>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {profile.github && (
                                                    <SocialLink
                                                        href={profile.github}
                                                        label="GitHub"
                                                    >
                                                        <Github className="size-4" />
                                                    </SocialLink>
                                                )}
                                                {profile.linkedin && (
                                                    <SocialLink
                                                        href={profile.linkedin}
                                                        label="LinkedIn"
                                                    >
                                                        <Linkedin className="size-4" />
                                                    </SocialLink>
                                                )}
                                                <SocialLink
                                                    href={`mailto:${profile.email}`}
                                                    label="Email"
                                                >
                                                    <Mail className="size-4" />
                                                </SocialLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="relative z-10 mx-auto flex w-full max-w-[1120px] flex-col gap-5 px-5 py-10 text-xs text-[var(--portfolio-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-10">
                    <p>
                        © {new Date().getFullYear()} {name}. {text.footer}
                    </p>
                    <Link
                        href={auth.user ? dashboard() : login()}
                        className="inline-flex items-center gap-2 font-semibold text-[var(--portfolio-foreground)] transition-opacity hover:opacity-60"
                    >
                        <Code2 className="size-3.5" />
                        {text.studio}
                    </Link>
                </footer>
            </div>
        </div>
    );
}

function ProjectCard({
    project,
    index,
    locale,
    labels,
    accent,
}: {
    project: PortfolioProject;
    index: number;
    locale: 'en' | 'ar';
    labels: { live: string; source: string };
    accent: string;
}) {
    const pick = (field: string): string => {
        const values = project as unknown as Record<string, unknown>;

        return String(values[`${field}_${locale}`] ?? '');
    };
    const title = pick('name');
    const category = project.category
        ? String(project.category[`name_${locale}`] ?? '')
        : '';
    const mediaLast = index % 2 === 1;

    return (
        <article
            data-kinetic
            data-work-card
            className="portfolio-work-card portfolio-project-plate group relative flex shrink-0 snap-center flex-col border-r border-[var(--portfolio-border)] bg-[var(--portfolio-background)]/82 p-5 backdrop-blur-sm sm:p-7"
            style={
                {
                    '--card-index': index,
                } as CSSProperties
            }
        >
            <div className="flex items-start justify-between gap-6 border-b border-[var(--portfolio-border)] pb-6">
                <span className="text-[clamp(3.25rem,6vw,5.75rem)] leading-none font-medium tracking-[-0.08em]">
                    {String(index + 1).padStart(2, '0')}
                </span>
                <div className="max-w-[16rem] text-right rtl:text-left">
                    <h3 className="text-xl leading-tight font-medium tracking-[-0.04em] sm:text-2xl">
                        {title}
                    </h3>
                    {category && (
                        <p className="mt-2 font-mono text-[10px] tracking-[0.14em] text-[var(--portfolio-muted)] uppercase">
                            {category}
                        </p>
                    )}
                </div>
            </div>

            <div
                className={`portfolio-work-media relative my-7 aspect-[4/3] overflow-hidden border border-[var(--portfolio-border)] bg-[var(--portfolio-surface)] ${
                    mediaLast ? 'order-last mt-auto mb-0' : ''
                }`}
            >
                {project.image_url ? (
                    <img
                        src={project.image_url}
                        alt={title}
                        loading={index < 2 ? 'eager' : 'lazy'}
                        className="size-full object-cover"
                    />
                ) : (
                    <ProjectArtwork
                        index={index}
                        title={title}
                        accent={accent}
                    />
                )}
            </div>

            <div className="portfolio-work-copy flex flex-1 flex-col">
                <div>
                    <p className="text-sm leading-7 text-[var(--portfolio-muted)]">
                        {pick('description')}
                    </p>
                </div>
                <div className="mt-7 border-t border-[var(--portfolio-border)] pt-5">
                    <p className="font-mono text-[9px] tracking-[0.16em] text-[var(--portfolio-muted)] uppercase">
                        Stack / tools
                    </p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                        {project.skills.map((skill) => (
                            <span
                                key={`${project.id}-${skill.name_en}`}
                                className="text-xs font-medium"
                            >
                                {String(skill[`name_${locale}`] ?? '')}
                            </span>
                        ))}
                    </div>
                </div>
                {(project.url || project.repository_url) && (
                    <div className="mt-auto flex flex-wrap gap-4 pt-7">
                        {project.url && (
                            <ExternalLink
                                href={project.url}
                                label={labels.live}
                            />
                        )}
                        {project.repository_url && (
                            <ExternalLink
                                href={project.repository_url}
                                label={labels.source}
                            />
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}

function ProjectArtwork({
    index,
    title,
    accent,
}: {
    index: number;
    title: string;
    accent: string;
}) {
    return (
        <div className="portfolio-dot-grid relative size-full">
            <div className="absolute inset-[12%] rounded-[1.25rem] border border-[var(--portfolio-border)]" />
            <div
                className="absolute top-[18%] right-[12%] bottom-[22%] left-[24%] rotate-[-8deg] rounded-[1.25rem] border transition-transform duration-700 group-hover:rotate-0"
                style={{ borderColor: accent }}
            />
            <div className="absolute inset-[30%] rotate-12 rounded-xl border border-[var(--portfolio-border)]" />
            <span className="absolute bottom-5 left-6 text-6xl leading-none font-medium tracking-[-0.08em]">
                {String(index + 1).padStart(2, '0')}
            </span>
            <span className="absolute top-5 right-6 max-w-[12rem] text-right text-[10px] leading-4 tracking-[0.14em] text-[var(--portfolio-muted)] uppercase">
                {title}
            </span>
        </div>
    );
}

function DeconstructedPortrait({
    src,
    alt,
    accent,
}: {
    src: string;
    alt: string;
    accent: string;
}) {
    return (
        <figure
            className="portfolio-deconstructed-portrait relative aspect-[4/5] w-full max-w-[440px]"
            style={{ '--portrait-accent': accent } as CSSProperties}
        >
            <div className="absolute inset-x-0 -top-7 flex items-center justify-between font-mono text-[9px] tracking-[0.16em] text-[var(--portfolio-muted)] uppercase">
                <span>Identity / 01</span>
                <span>880 × 1206</span>
            </div>
            <div className="portfolio-portrait-frame border-[var(--portfolio-border) absolute inset-0 overflow-hidden border">
                <img
                    src={src}
                    alt={alt}
                    className="portfolio-portrait-base absolute inset-0 size-full object-cover grayscale"
                />
                {['upper', 'middle', 'lower'].map((slice) => (
                    <img
                        key={slice}
                        src={src}
                        alt=""
                        aria-hidden="true"
                        className={`portfolio-portrait-slice portfolio-portrait-${slice} absolute inset-0 size-full object-cover grayscale`}
                    />
                ))}
                <span
                    aria-hidden="true"
                    className="portfolio-scan-line absolute inset-x-0 top-1/2 h-px bg-[var(--portrait-accent)]"
                />
                <span
                    aria-hidden="true"
                    className="absolute top-0 bottom-0 left-[38%] w-px bg-white/10"
                />
                <span
                    aria-hidden="true"
                    className="absolute top-0 right-[22%] bottom-0 w-px bg-white/10"
                />
            </div>
            <span
                aria-hidden="true"
                className="portfolio-portrait-index absolute -right-7 bottom-12 font-mono text-[9px] tracking-[0.18em] text-[var(--portfolio-muted)] uppercase [writing-mode:vertical-rl]"
            >
                Surface / Signal / Structure
            </span>
        </figure>
    );
}

function SystemsRail({
    items,
    fallback,
}: {
    items: string[];
    fallback: string;
}) {
    const railItems = items.length > 0 ? items : [fallback];

    const track = railItems.map((item, index) => (
        <span
            key={`${item}-${index}`}
            className="flex shrink-0 items-center gap-4 px-5 font-mono text-[10px] tracking-[0.16em] text-[var(--portfolio-muted)] uppercase"
        >
            <span className="size-1.5 bg-[var(--portfolio-accent)]" />
            {item}
        </span>
    ));

    return (
        <div className="portfolio-systems-rail flex h-11 overflow-hidden">
            <div className="portfolio-systems-track flex min-w-max items-center">
                {track}
            </div>
            <div
                aria-hidden="true"
                className="portfolio-systems-track flex min-w-max items-center"
            >
                {track}
            </div>
        </div>
    );
}

function MonogramPortrait({
    initials,
    accent,
}: {
    initials: string;
    accent: string;
}) {
    return (
        <div className="portfolio-dot-grid relative grid size-full place-items-center">
            <div className="absolute inset-[8%] rounded-full border border-[var(--portfolio-border)]" />
            <div className="absolute inset-[20%] rotate-45 rounded-[2rem] border border-[var(--portfolio-border)]" />
            <div
                className="absolute inset-[28%] -rotate-12 rounded-[1.5rem] border"
                style={{ borderColor: accent }}
            />
            <span className="relative text-[clamp(5rem,12vw,9rem)] leading-none font-medium tracking-[-0.09em]">
                {initials || 'MA'}
            </span>
            <Code2 className="absolute right-7 bottom-7 size-5 text-[var(--portfolio-muted)]" />
        </div>
    );
}

function ExternalLink({ href, label }: { href: string; label: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold"
        >
            {label}
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
    );
}

function ContactChannel({
    href,
    label,
    value,
    children,
}: {
    href: string;
    label: string;
    value: string;
    children: ReactNode;
}) {
    const isExternal = href.startsWith('http');

    return (
        <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
            className="group flex min-w-0 items-center gap-3 border border-[var(--portfolio-border)] bg-[var(--portfolio-background)]/75 p-4 transition-colors hover:border-[var(--portfolio-accent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--portfolio-accent)]"
        >
            <span className="grid size-9 shrink-0 place-items-center border border-[var(--portfolio-border)] text-[var(--portfolio-muted)] transition-colors group-hover:text-[var(--portfolio-foreground)]">
                {children}
            </span>
            <span className="min-w-0 flex-1">
                <span className="block font-mono text-[9px] tracking-[0.12em] text-[var(--portfolio-muted)] uppercase">
                    {label}
                </span>
                <strong className="mt-1 block text-xs leading-5 font-semibold break-words">
                    {value}
                </strong>
            </span>
            <ArrowUpRight className="size-3.5 shrink-0 text-[var(--portfolio-muted)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
    );
}

function formatWebsite(website: string): string {
    return website
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/$/, '');
}

function SocialLink({
    href,
    label,
    children,
}: {
    href: string;
    label: string;
    children: ReactNode;
}) {
    const isExternal = href.startsWith('http');

    return (
        <a
            href={href}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noreferrer' : undefined}
            aria-label={label}
            className="grid size-11 place-items-center rounded-xl border border-[var(--portfolio-border)] bg-[var(--portfolio-background)] text-[var(--portfolio-muted)] transition-colors hover:text-[var(--portfolio-foreground)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--portfolio-accent)]"
        >
            {children}
        </a>
    );
}

function PortfolioSetup({ authenticated }: { authenticated: boolean }) {
    return (
        <main className="portfolio-dot-grid grid min-h-screen place-items-center bg-[#070707] p-6 text-[#f4f4f1]">
            <Head title="Portfolio setup" />
            <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-7 shadow-2xl sm:p-10">
                <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-xl border border-white/10">
                        <Code2 className="size-4" />
                    </span>
                    <span className="font-mono text-[10px] text-white/40">
                        EMPTY PORTFOLIO
                    </span>
                </div>
                <h1 className="mt-16 text-5xl leading-[0.95] font-medium tracking-[-0.06em] sm:text-7xl">
                    Your portfolio starts here.
                </h1>
                <p className="mt-6 max-w-md text-base leading-7 text-white/55">
                    Add your profile, work, experience, and capabilities from
                    the portfolio studio.
                </p>
                <Link
                    href={authenticated ? dashboard() : login()}
                    className="mt-10 flex items-center justify-between rounded-xl bg-white px-5 py-4 text-sm font-semibold text-black"
                >
                    Open portfolio studio
                    <ArrowUpRight className="size-4" />
                </Link>
            </div>
        </main>
    );
}
