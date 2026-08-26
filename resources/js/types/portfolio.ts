export type Localized = {
    name_ar: string;
    name_en: string;
};

export type Gradient = {
    type: 'linear' | 'radial';
    angle: number; // degrees 0-360
    stops: GradientStop[];
};

export type GradientStop = {
    color: string; // hex
    position: number; // 0-100
};

export type PortfolioTheme = {
    theme_dark_accent: string | Gradient;
    theme_light_accent: string | Gradient;
    theme_dark_background: string | Gradient;
    theme_dark_surface: string | Gradient;
    theme_dark_foreground: string;
    theme_dark_muted: string;
    theme_light_background: string | Gradient;
    theme_light_surface: string | Gradient;
    theme_light_foreground: string;
    theme_light_muted: string;
    glass_effect_enabled: boolean;
    glass_blur: number;
    glass_surface_opacity: number;
    glass_border_opacity: number;
    glass_saturation: number;
};

export type PortfolioProfile = Localized &
    PortfolioTheme & {
        role_ar: string;
        role_en: string;
        short_description_ar: string;
        short_description_en: string;
        description_ar: string;
        description_en: string;
        location_ar: string;
        location_en: string;
        image_url: string | null;
        linkedin: string | null;
        github: string | null;
        whatsapp: string | null;
        mobile: string | null;
        email: string;
        website: string | null;
        resume_url: string | null;
        is_available: boolean;
    };

export type TrackingIntegration = {
    platform: string;
    tracking_id: string;
    installation_method: 'managed' | 'custom';
    head_code: string | null;
    body_code: string | null;
};

export type PortfolioProject = Localized & {
    id: number;
    description_ar: string;
    description_en: string;
    image_url: string | null;
    url: string | null;
    repository_url: string | null;
    is_featured: boolean;
    category: (Localized & { id: number; color: string }) | null;
    skills: Localized[];
};

export type PortfolioExperience = Localized & {
    id: number;
    company_ar: string;
    company_en: string;
    description_ar: string;
    description_en: string;
    location_ar: string;
    location_en: string;
    started_at: string;
    ended_at: string | null;
    is_current: boolean;
};

export type PortfolioSkill = Localized & {
    id: number;
    group_ar: string;
    group_en: string;
    icon_key: string | null;
    image_url: string | null;
    proficiency: number;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type Paginated<T> = {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};