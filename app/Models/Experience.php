<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ExperienceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Override;

/**
 * @property Carbon $started_at
 * @property Carbon|null $ended_at
 */
#[Fillable([
    'name_ar',
    'name_en',
    'company_ar',
    'company_en',
    'description_ar',
    'description_en',
    'location_ar',
    'location_en',
    'started_at',
    'ended_at',
    'is_current',
    'is_visible',
    'sort_order',
])]
class Experience extends Model
{
    /** @use HasFactory<ExperienceFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    #[Override]
    protected function casts(): array
    {
        return [
            'started_at' => 'date',
            'ended_at' => 'date',
            'is_current' => 'boolean',
            'is_visible' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
