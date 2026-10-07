<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Override;

/**
 * @property int $id
 * @property int $profile_id
 * @property string $session_uuid
 * @property string $visitor_hash
 * @property Carbon $started_at
 * @property Carbon $last_seen_at
 * @property int $duration_seconds
 * @property int $page_views_count
 * @property string $landing_page
 * @property string|null $last_page
 * @property string|null $referrer
 * @property string|null $utm_source
 * @property string|null $browser
 * @property string|null $platform
 * @property string|null $device_type
 * @property string|null $language
 * @property string|null $timezone
 * @property int|null $screen_width
 * @property int|null $screen_height
 */
#[Fillable([
    'profile_id',
    'session_uuid',
    'visitor_hash',
    'started_at',
    'last_seen_at',
    'duration_seconds',
    'page_views_count',
    'landing_page',
    'last_page',
    'referrer',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'browser',
    'platform',
    'device_type',
    'language',
    'timezone',
    'screen_width',
    'screen_height',
])]
class VisitorSession extends Model
{
    /** @return BelongsTo<Profile, $this> */
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    /** @return HasMany<PageView, $this> */
    public function pageViews(): HasMany
    {
        return $this->hasMany(PageView::class);
    }

    #[Override]
    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'duration_seconds' => 'integer',
            'page_views_count' => 'integer',
            'screen_width' => 'integer',
            'screen_height' => 'integer',
        ];
    }
}
