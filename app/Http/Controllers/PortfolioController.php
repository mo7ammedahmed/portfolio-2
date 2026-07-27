<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\Profile;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function __invoke(): Response
    {
        $profile = Profile::query()
            ->where('is_visible', true)
            ->oldest()
            ->first();

        if (! $profile) {
            return Inertia::render('welcome', [
                'profile' => null,
                'projects' => [],
                'experiences' => [],
                'skills' => [],
                'categories' => [],
            ]);
        }

        $user = $profile->user;

        $projects = $user->projects()
            ->where('is_visible', true)
            ->with([
                'category:id,name_ar,name_en,color',
                'skills:id,name_ar,name_en',
            ])
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($project): array => [
                ...$project->only([
                    'id',
                    'name_ar',
                    'name_en',
                    'description_ar',
                    'description_en',
                    'url',
                    'repository_url',
                    'is_featured',
                ]),
                'image_url' => $project->image
                    ? Storage::disk('public')->url($project->image)
                    : null,
                'category' => $project->category?->only([
                    'id',
                    'name_ar',
                    'name_en',
                    'color',
                ]),
                'skills' => $project->skills->map->only([
                    'id',
                    'name_ar',
                    'name_en',
                ]),
            ]);

        $experiences = $user->experiences()
            ->where('is_visible', true)
            ->orderBy('sort_order')
            ->orderByDesc('started_at')
            ->get()
            ->map(fn (Experience $experience): array => [
                ...$experience->only([
                    'id',
                    'name_ar',
                    'name_en',
                    'company_ar',
                    'company_en',
                    'description_ar',
                    'description_en',
                    'location_ar',
                    'location_en',
                    'is_current',
                ]),
                'started_at' => $experience->started_at->format('Y-m'),
                'ended_at' => $experience->ended_at?->format('Y-m'),
            ]);

        $skills = $user->skills()
            ->where('is_visible', true)
            ->orderBy('sort_order')
            ->get([
                'id',
                'name_ar',
                'name_en',
                'group_ar',
                'group_en',
                'image',
                'icon_key',
                'proficiency',
            ])
            ->map(fn ($skill): array => [
                ...$skill->only([
                    'id',
                    'name_ar',
                    'name_en',
                    'group_ar',
                    'group_en',
                    'icon_key',
                    'proficiency',
                ]),
                'image_url' => $skill->image
                    ? Storage::disk('public')->url($skill->image)
                    : null,
            ]);

        $categories = $user->categories()
            ->where('is_visible', true)
            ->whereHas('projects', fn ($query) => $query->where('is_visible', true))
            ->orderBy('sort_order')
            ->get(['id', 'name_ar', 'name_en', 'color']);

        $earliestExperience = $user->experiences()
            ->where('is_visible', true)
            ->oldest('started_at')
            ->first(['started_at']);

        return Inertia::render('welcome', [
            'profile' => [
                ...$profile->only([
                    'name_ar',
                    'name_en',
                    'role_ar',
                    'role_en',
                    'short_description_ar',
                    'short_description_en',
                    'description_ar',
                    'description_en',
                    'location_ar',
                    'location_en',
                    'linkedin',
                    'github',
                    'whatsapp',
                    'mobile',
                    'email',
                    'website',
                    'resume_url',
                    'is_available',
                    'theme_accent',
                    'theme_dark_background',
                    'theme_dark_surface',
                    'theme_dark_foreground',
                    'theme_dark_muted',
                    'theme_light_background',
                    'theme_light_surface',
                    'theme_light_foreground',
                    'theme_light_muted',
                ]),
                'image_url' => $profile->image
                    ? Storage::disk('public')->url($profile->image)
                    : null,
            ],
            'projects' => $projects,
            'experiences' => $experiences,
            'skills' => $skills,
            'categories' => $categories,
            'stats' => [
                'projects' => $projects->count(),
                'years' => $earliestExperience
                    ? max(
                        1,
                        (int) $earliestExperience->started_at->diffInYears(now()),
                    )
                    : 0,
                'skills' => $skills->count(),
                'categories' => $categories->count(),
            ],
        ]);
    }
}
