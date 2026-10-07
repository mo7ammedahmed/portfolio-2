import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, LockKeyhole } from 'lucide-react';
import AppLogoImage from '@/components/app-logo-image';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const page = usePage();
    const ar = page.props.locale === 'ar';
    const identity = page.props.siteIdentity as
        { name_en?: string; name_ar?: string } | undefined;
    const name =
        (ar ? identity?.name_ar : identity?.name_en) ||
        String(page.props.name || 'Portfolio');
    const login = page.component === 'auth/login';

    return (
        <main
            className="studio-auth"
            dir={ar ? 'rtl' : 'ltr'}
            lang={ar ? 'ar' : 'en'}
        >
            <aside
                className="studio-auth-art"
                aria-label={ar ? 'هوية الموقع' : 'Portfolio identity'}
            >
                <Link href={home()} className="studio-auth-brand">
                    <AppLogoImage
                        className="size-11 rounded-xl object-cover"
                        alt={name}
                    />
                    <span>
                        {name}
                        <small>PORTFOLIO / STUDIO</small>
                    </span>
                </Link>
                <div className="studio-auth-sculpture" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <span>✳</span>
                </div>
                <div className="studio-auth-statement">
                    <p className="studio-auth-eyebrow">
                        {ar
                            ? 'خلف كل تجربة، تفاصيل.'
                            : 'Behind every experience.'}
                    </p>
                    <h2>
                        {ar ? (
                            <>
                                مساحة لأعمالك.
                                <br />
                                ولما يأتي بعدها.
                            </>
                        ) : (
                            <>
                                Your work.
                                <br />
                                Your next chapter.
                            </>
                        )}
                    </h2>
                    <p>
                        {ar
                            ? 'مكان واحد لإدارة المحتوى والمشاريع وكل ما يعبّر عنك.'
                            : 'One place to shape your projects, your stories, and everything that represents you.'}
                    </p>
                </div>
                <div className="studio-auth-art-footer">
                    <span>{ar ? 'صُمّم ليعبّر عنك' : 'MADE TO BE YOURS'}</span>
                    <span>01 / STUDIO</span>
                </div>
            </aside>
            <section className="studio-auth-panel">
                <header className="studio-auth-top">
                    <Link href={home()} className="studio-auth-mobile-brand">
                        <AppLogoImage
                            className="size-9 rounded-lg object-cover"
                            alt={name}
                        />
                        <span>{name}</span>
                    </Link>
                    <Link href={home()} className="studio-auth-back">
                        {ar ? 'العودة إلى الموقع' : 'Back to portfolio'}
                        <ArrowUpRight size={16} />
                    </Link>
                </header>
                <div className="studio-auth-content">
                    <div className="studio-auth-heading">
                        <p className="studio-auth-eyebrow">
                            <LockKeyhole size={14} />
                            {ar ? 'مساحة الإدارة' : 'THE PRIVATE STUDIO'}
                        </p>
                        <h1>
                            {login
                                ? ar
                                    ? 'أهلًا بعودتك.'
                                    : 'Welcome back.'
                                : title}
                        </h1>
                        <p>
                            {login
                                ? ar
                                    ? 'سجّل دخولك لمتابعة أعمالك وإدارة موقعك.'
                                    : 'Sign in to keep your work moving.'
                                : description}
                        </p>
                    </div>
                    {children}
                </div>
                <footer className="studio-auth-footer">
                    <span>
                        © {new Date().getFullYear()} {name}
                    </span>
                    <span>
                        {ar ? 'مساحتك، بتفاصيلك.' : 'Your space. Your details.'}
                    </span>
                </footer>
            </section>
        </main>
    );
}
