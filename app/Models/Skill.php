<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SkillFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Override;

#[Fillable([
    'name_ar',
    'name_en',
    'description_ar',
    'description_en',
    'group_ar',
    'group_en',
    'image',
    'icon_key',
    'proficiency',
    'is_visible',
    'sort_order',
])]
class Skill extends Model
{
    /**
     * @var list<string>
     */
    public const ICON_KEYS = [
        'aws',
        'bootstrap',
        'css3',
        'docker',
        'figma',
        'git',
        'github',
        'html5',
        'javascript',
        'laravel',
        'mongodb',
        'mysql',
        'nextjs',
        'nodejs',
        'php',
        'postgresql',
        'postman',
        'python',
        'react',
        'redis',
        'tailwindcss',
        'typescript',
        'vuejs',
        'wordpress',
    ];

    /** @use HasFactory<SkillFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return BelongsToMany<Project, $this> */
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class);
    }

    #[Override]
    protected function casts(): array
    {
        return [
            'proficiency' => 'integer',
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
