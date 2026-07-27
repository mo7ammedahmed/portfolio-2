<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\ProfileFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Override;

/**
 * @property int $id
 * @property int $user_id
 * @property string|null $image
 * @property string $theme_accent
 * @property string $theme_dark_background
 * @property string $theme_dark_surface
 * @property string $theme_dark_foreground
 * @property string $theme_dark_muted
 * @property string $theme_light_background
 * @property string $theme_light_surface
 * @property string $theme_light_foreground
 * @property string $theme_light_muted
 */
#[Fillable([
    'name_ar',
    'name_en',
    'role_ar',
    'role_en',
    'short_description_ar',
    'short_description_en',
    'description_ar',
    'description_en',
    'image',
    'logo',
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
    'is_visible',
    'theme_accent',
    'theme_dark_background',
    'theme_dark_surface',
    'theme_dark_foreground',
    'theme_dark_muted',
    'theme_light_background',
    'theme_light_surface',
    'theme_light_foreground',
    'theme_light_muted',
])]
class Profile extends Model
{
    /** @use HasFactory<ProfileFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<VisitorSession, $this> */
    public function visitorSessions(): HasMany
    {
        return $this->hasMany(VisitorSession::class);
    }

    /** @return HasMany<ContactMessage, $this> */
    public function contactMessages(): HasMany
    {
        return $this->hasMany(ContactMessage::class);
    }

    #[Override]
    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'is_visible' => 'boolean',
        ];
    }
}
