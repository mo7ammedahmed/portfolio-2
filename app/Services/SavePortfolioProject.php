<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class SavePortfolioProject
{
    /** @param array<string, mixed> $data */
    public function save(User $owner, array $data, ?Project $project = null): Project
    {
        $disk = Storage::disk(config('filesystems.default'));
        $created = [];
        $obsolete = [];
        $store = function (UploadedFile $file) use ($disk, &$created): string {
            $path = $disk->putFile('portfolio/projects', $file);
            if (! $path) {
                throw new RuntimeException('Could not save project image.');
            }
            $created[] = $path;

            return $path;
        };
        try {
            $saved = DB::transaction(function () use ($owner, $data, $project, $store, &$obsolete): Project {
                $attributes = array_diff_key($data, array_flip(['image', 'skill_ids', 'gallery']));
                if (($data['image'] ?? null) instanceof UploadedFile) {
                    $attributes['image'] = $store($data['image']);
                    if ($project?->image) {
                        $obsolete[] = $project->image;
                    }
                }
                if ($project) {
                    $project->update($attributes);
                } else {
                    $project = $owner->projects()->create($attributes);
                }
                if (array_key_exists('skill_ids', $data)) {
                    $project->skills()->sync($data['skill_ids']);
                }
                if (array_key_exists('gallery', $data)) {
                    $keep = [];
                    foreach ($data['gallery'] as $entry) {
                        $image = ! empty($entry['id']) ? $project->images()->whereKey($entry['id'])->firstOrFail() : null;
                        $imageData = ['alt_ar' => $entry['alt_ar'], 'alt_en' => $entry['alt_en'], 'sort_order' => $entry['sort_order']];
                        if (($entry['file'] ?? null) instanceof UploadedFile) {
                            $imageData['path'] = $store($entry['file']);
                            if ($image) {
                                $obsolete[] = $image->path;
                            }
                        }
                        if ($image) {
                            $image->update($imageData);
                        } else {
                            $image = $project->images()->create($imageData);
                        }
                        $keep[] = $image->id;
                    }
                    foreach ($project->images()->whereNotIn('id', $keep)->get() as $removed) {
                        $obsolete[] = $removed->path;
                        $removed->delete();
                    }
                }

                return $project;
            });
        } catch (\Throwable $error) {
            $disk->delete($created);
            throw $error;
        }
        // Only remove files after the replacement and database transaction succeeded.
        $disk->delete($obsolete);

        return $saved;
    }
}
