<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\TrackingInstallationMethod;
use App\Enums\TrackingPlatform;
use Database\Factories\TrackingIntegrationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Override;

/**
 * @property int $id
 * @property int $profile_id
 * @property TrackingPlatform $platform
 * @property string $tracking_id
 * @property TrackingInstallationMethod $installation_method
 * @property string|null $head_code
 * @property string|null $body_code
 * @property bool $is_enabled
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'profile_id',
    'platform',
    'tracking_id',
    'installation_method',
    'head_code',
    'body_code',
    'is_enabled',
])]
class TrackingIntegration extends Model
{
    /** @use HasFactory<TrackingIntegrationFactory> */
    use HasFactory;

    /** @var array<string, mixed> */
    protected $attributes = [
        'installation_method' => TrackingInstallationMethod::Managed->value,
    ];

    /** @return BelongsTo<Profile, $this> */
    public function profile(): BelongsTo
    {
        return $this->belongsTo(Profile::class);
    }

    #[Override]
    protected function casts(): array
    {
        return [
            'platform' => TrackingPlatform::class,
            'installation_method' => TrackingInstallationMethod::class,
            'is_enabled' => 'boolean',
        ];
    }
}
