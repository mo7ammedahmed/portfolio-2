import type { Auth } from '@/types/auth';
import type { PortfolioTheme } from '@/types/portfolio';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            portfolioTheme: PortfolioTheme | null;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
