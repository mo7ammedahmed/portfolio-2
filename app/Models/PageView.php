<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Override;

/**
 * @property int $id
 * @property int $visitor_session_id
 * @property string $page_uuid
 * @property string $path
 * @property string|null $title
 * @property Carbon $entered_at
 * @property Carbon|null $left_at
 * @property int $duration_seconds
 */
#[Fillable([
    'visitor_session_id',
    'page_uuid',
    'path',
    'title',
    'entered_at',
    'left_at',
    'duration_seconds',
])]
class PageView extends Model
{
    /** @return BelongsTo<VisitorSession, $this> */
    public function visitorSession(): BelongsTo
    {
        return $this->belongsTo(VisitorSession::class);
    }

    #[Override]
    protected function casts(): array
    {
        return [
            'entered_at' => 'datetime',
            'left_at' => 'datetime',
            'duration_seconds' => 'integer',
        ];
    }
}
