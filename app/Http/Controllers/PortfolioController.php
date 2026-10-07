<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\ProjectImage;
use App\Models\TrackingIntegration;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function __invoke(): Response
    {
        $data = $this->portfolioData();

        return Inertia::render('welcome', [...$data, 'seo' => $this->metadata($data['profile'] ?? [], url('/'))]);
    }

    public function show(string $slug): Response
    {
        $data = $this->portfolioData();
        $project = null;
        foreach ($data['projects'] as $candidate) {
            if ($candidate['slug'] === $slug) {
                $project = $candidate;
                break;
            }
        }
        abort_unless($project, 404);

        return Inertia::render('work/show', [...$data, 'project' => $project, 'seo' => $this->metadata($project, route('work.show', $slug))]);
    }

    /** @param array<string, mixed> $content
     * @return array<string, string|null>
     */
    private function metadata(array $content, string $canonical): array
    {
        $locale = app()->getLocale();

        return [
            'title' => $content['name_'.$locale] ?? config('app.name'),
            'description' => $content['short_description_'.$locale] ?? $content['description_'.$locale] ?? '',
            'canonical' => $canonical,
            'image' => $content['image_url'] ?? asset('portfolio-preview.png'),
        ];
    }

    /** @return array<string, mixed> */
    private function portfolioData(): array
    {
        $profile = Profile::query()
            ->where('is_visible', true)
            ->oldest()
            ->first();

        if (! $profile) {
            return [
                'profile' => null,
                'projects' => [],
                'experiences' => [],
                'skills' => [],
                'categories' => [],
                'trackingIntegrations' => [],
            ];
        }

        $user = $profile->user;

        $projects = $user->projects()
            ->where('is_visible', true)
            ->with([
                'images',
                'category:id,name_ar,name_en,color',
                'skills:id,name_ar,name_en',
            ])
            ->orderByDesc('is_featured')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (Project $project): array => [
                ...$project->only([
                    'id', 'slug', 'status', 'role_ar', 'role_en', 'challenge_ar', 'challenge_en',
                    'solution_ar', 'solution_en', 'outcomes_ar', 'outcomes_en',
                    'name_ar',
                    'name_en',
                    'description_ar',
                    'description_en',
                    'url',
                    'repository_url',
                    'is_featured',
                ]),
                'images' => $project->images->map(fn (ProjectImage $image): array => [
                    'id' => $image->id, 'alt_ar' => $image->alt_ar, 'alt_en' => $image->alt_en,
                    'url' => Storage::disk(config('filesystems.default'))->url($image->path),
                ])->all(),
                'image_url' => $project->image
                    ? Storage::disk(config('filesystems.default'))->url($project->image)
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
                    ? Storage::disk(config('filesystems.default'))->url($skill->image)
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

        $trackingIntegrations = $profile->trackingIntegrations()
            ->where('is_enabled', true)
            ->get([
                'platform',
                'tracking_id',
                'installation_method',
                'head_code',
                'body_code',
            ])
            ->map(fn (TrackingIntegration $integration): array => [
                'platform' => $integration->platform->value,
                'tracking_id' => $integration->tracking_id,
                'installation_method' => $integration->installation_method->value,
                'head_code' => $integration->head_code,
                'body_code' => $integration->body_code,
            ]);

        return [
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
                    'theme_dark_accent',
                    'theme_light_accent',
                    'theme_dark_background',
                    'theme_dark_surface',
                    'theme_dark_foreground',
                    'theme_dark_muted',
                    'theme_light_background',
                    'theme_light_surface',
                    'theme_light_foreground',
                    'theme_light_muted',
                    'nav_background',
                    'nav_text',
                    'nav_muted',
                    'nav_active_background',
                    'nav_active_text',
                    'nav_border',
                    'nav_glass_enabled',
                    'nav_opacity',
                    'nav_blur',
                    'glass_effect_enabled',
                ]),
                'image_url' => $profile->image
                    ? Storage::disk(config('filesystems.default'))->url($profile->image)
                    : null,
            ],
            'projects' => $projects,
            'experiences' => $experiences,
            'skills' => $skills,
            'categories' => $categories,
            'trackingIntegrations' => $trackingIntegrations,
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
        ];
    }
}
