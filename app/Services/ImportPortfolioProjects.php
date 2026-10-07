<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class ImportPortfolioProjects
{
    /** @param array<int, array<string, mixed>> $items
     * @return array<int, array{key: string, action: string}>
     */
    public function run(User $owner, array $items, bool $dryRun = false, bool $overwrite = false): array
    {
        if (! $owner->isPortfolioOwner()) {
            throw new RuntimeException('The selected user is not a portfolio owner.');
        }
        Validator::make(['items' => $items], [
            'items' => ['required', 'array'],
            'items.*.seed_key' => ['required', 'string', 'max:100', 'distinct', 'regex:/^[a-z0-9-]+$/'],
            'items.*.slug' => ['required', 'string', 'max:160', 'distinct', 'regex:/^[a-z0-9-]+$/'],
            'items.*.name_ar' => ['required', 'string', 'max:160'],
            'items.*.name_en' => ['required', 'string', 'max:160'],
            'items.*.description_ar' => ['required', 'string', 'max:5000'],
            'items.*.description_en' => ['required', 'string', 'max:5000'],
            'items.*.url' => ['nullable', 'url:http,https', 'max:500'],
            'items.*.repository_url' => ['nullable', 'url:http,https', 'max:500'],
            'items.*.category.en' => ['required', 'string', 'max:160'],
            'items.*.category.ar' => ['required', 'string', 'max:160'],
            'items.*.skills' => ['present', 'array', 'max:20'],
            'items.*.skills.*' => ['string', 'max:100'],
            'items.*.status' => ['required', 'in:in_progress,completed'],
            'items.*.is_visible' => ['required', 'boolean'],
            'items.*.is_featured' => ['required', 'boolean'],
            'items.*.sort_order' => ['required', 'integer', 'min:0'],
            'items.*.cover' => ['nullable', 'string'],
        ])->validate();
        $matches = [];
        foreach ($items as $item) {
            $project = $owner->projects()->where('seed_key', $item['seed_key'])->first();
            if (! $project && $item['seed_key'] === 'speed-rocket') {
                $legacy = $owner->projects()->whereNull('seed_key')->where(function ($query): void {
                    $query->whereRaw('LOWER(name_en) = ?', ['speed rocket'])
                        ->orWhereIn('url', ['https://speed-rocket.netlify.app', 'https://speed-rocket.netlify.app/', 'https://speed-rocket.laravel.cloud', 'https://speed-rocket.laravel.cloud/']);
                })->get();
                if ($legacy->count() > 1) {
                    throw new RuntimeException('Multiple legacy Speed Rocket projects found. Resolve the duplicates before importing.');
                }
                $project = $legacy->first();
            }
            $matches[$item['seed_key']] = $project;
            if (! $project && Project::query()->where('slug', $item['slug'])->exists()) {
                throw new RuntimeException('Public slug already belongs to another project: '.$item['slug']);
            }
            if (! empty($item['cover'])) {
                $root = realpath(base_path('database/content/images'));
                $path = realpath(base_path($item['cover']));
                if (! $root || ! $path || ! str_starts_with($path, $root.DIRECTORY_SEPARATOR) || ! is_file($path) || ! @getimagesize($path)) {
                    throw new RuntimeException('Missing or invalid project image: '.$item['cover']);
                }
            }
        }
        $report = [];
        if ($dryRun) {
            foreach ($items as $item) {
                $report[] = ['key' => $item['seed_key'], 'action' => $matches[$item['seed_key']] ? ($overwrite ? 'update' : 'skip') : 'create'];
            }

            return $report;
        }
        $newPaths = [];
        $disk = Storage::disk(config('filesystems.default'));
        try {
            return DB::transaction(function () use ($owner, $items, $overwrite, $matches, $disk, &$newPaths): array {
                $report = [];
                foreach ($items as $item) {
                    $project = $matches[$item['seed_key']];
                    if ($project && ! $overwrite) {
                        // Adopt the legacy identity without overwriting dashboard content.
                        if (! $project->seed_key) {
                            $project->update(['seed_key' => $item['seed_key']]);
                        }
                        $report[] = ['key' => $item['seed_key'], 'action' => 'skipped'];

                        continue;
                    }
                    $category = $owner->categories()->firstOrCreate(['name_en' => $item['category']['en']], [
                        'name_ar' => $item['category']['ar'], 'color' => '#006c55', 'is_visible' => true, 'sort_order' => 0,
                    ]);
                    $data = array_intersect_key($item, array_flip([
                        'seed_key', 'slug', 'name_ar', 'name_en', 'description_ar', 'description_en', 'url', 'repository_url',
                        'role_ar', 'role_en', 'challenge_ar', 'challenge_en', 'solution_ar', 'solution_en', 'outcomes_ar', 'outcomes_en',
                        'status', 'is_visible', 'is_featured', 'sort_order',
                    ]));
                    $data['category_id'] = $category->id;
                    if ($project) {
                        unset($data['slug']); // Published URLs remain stable, including legacy URLs.
                    }
                    if (! empty($item['cover'])) {
                        $source = base_path($item['cover']);
                        $hash = hash_file('sha256', $source);
                        $contents = file_get_contents($source);
                        if ($hash === false || $contents === false) {
                            throw new RuntimeException('Unable to read project image: '.$source);
                        }
                        $target = 'portfolio/projects/'.$owner->id.'/'.$item['seed_key'].'-'.substr($hash, 0, 16).'.jpg';
                        if (! $disk->exists($target)) {
                            if (! $disk->put($target, $contents)) {
                                throw new RuntimeException('Unable to store image: '.$item['seed_key']);
                            }
                            $newPaths[] = $target;
                        }
                        $data['image'] = $target;
                    }
                    $action = $project ? 'updated' : 'created';
                    if ($project) {
                        $project->update($data);
                    } else {
                        $project = $owner->projects()->create($data);
                    }
                    $skillIds = [];
                    foreach ($item['skills'] as $name) {
                        $skillIds[] = $owner->skills()->firstOrCreate(['name_en' => $name], [
                            'name_ar' => $name, 'group_en' => 'Development', 'group_ar' => 'التطوير',
                            'proficiency' => 0, 'is_visible' => true, 'sort_order' => 0,
                        ])->id;
                    }
                    $project->skills()->sync($skillIds);
                    $report[] = ['key' => $item['seed_key'], 'action' => $action];
                }

                return $report;
            });
        } catch (\Throwable $error) {
            foreach ($newPaths as $path) {
                $disk->delete($path);
            }
            throw $error;
        }
    }
}
