<?php

declare(strict_types=1);

namespace App\Enums;

enum PortfolioPermission: string
{
    case ViewAnalytics = 'portfolio.analytics';
    case ManageMessages = 'portfolio.messages';
    case ManageProfile = 'portfolio.profile';
    case ManageProjects = 'portfolio.projects';
    case ManageExperiences = 'portfolio.experiences';
    case ManageSkills = 'portfolio.skills';
    case ManageCategories = 'portfolio.categories';

    public function label(): string
    {
        return match ($this) {
            self::ViewAnalytics => 'View analytics',
            self::ManageMessages => 'Manage messages',
            self::ManageProfile => 'Manage profile',
            self::ManageProjects => 'Manage projects',
            self::ManageExperiences => 'Manage experience',
            self::ManageSkills => 'Manage skills',
            self::ManageCategories => 'Manage categories',
        };
    }

    public function description(): string
    {
        return match ($this) {
            self::ViewAnalytics => 'See visitor, traffic, and engagement analytics.',
            self::ManageMessages => 'Read and delete portfolio contact messages.',
            self::ManageProfile => 'Edit public profile content and theme settings.',
            self::ManageProjects => 'Create, edit, and delete portfolio projects.',
            self::ManageExperiences => 'Create, edit, and delete career experience.',
            self::ManageSkills => 'Create, edit, and delete skills and their icons.',
            self::ManageCategories => 'Create, edit, and delete project categories.',
        };
    }
}
