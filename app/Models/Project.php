<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ProjectFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;
use Override;

#[Fillable([
    'slug', 'seed_key', 'status', 'role_ar', 'role_en', 'challenge_ar', 'challenge_en',
    'solution_ar', 'solution_en', 'outcomes_ar', 'outcomes_en',
    'category_id',
    'name_ar',
    'name_en',
    'description_ar',
    'description_en',
    'image',
    'url',
    'repository_url',
    'is_featured',
    'is_visible',
    'sort_order',
])]
class Project extends Model
{
    protected static function booted(): void
    {
        static::creating(function (Project $project): void {
            if (! $project->slug) {
                $base = Str::slug($project->name_en) ?: 'project';
                $slug = $base;
                $suffix = 2;
                while (static::query()->where('slug', $slug)->exists()) {
                    $slug = $base.'-'.$suffix++;
                }
                $project->slug = $slug;
            }
        });
    }

    /** @return HasMany<ProjectImage, $this> */
    public function images(): HasMany
    {
        return $this->hasMany(ProjectImage::class)->orderBy('sort_order')->orderBy('id');
    }

    /** @use HasFactory<ProjectFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsTo<Category, $this> */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /** @return BelongsToMany<Skill, $this> */
    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class);
    }

    #[Override]
    protected function casts(): array
    {
        return [
            'is_featured' => 'boolean',
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
