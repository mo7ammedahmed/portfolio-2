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
 * @property string $theme_dark_accent
 * @property string $theme_light_accent
 * @property string $theme_dark_background
 * @property string $theme_dark_surface
 * @property string $theme_dark_foreground
 * @property string $theme_dark_muted
 * @property string $theme_light_background
 * @property string $theme_light_surface
 * @property string $theme_light_foreground
 * @property string $theme_light_muted
 * @property bool $glass_effect_enabled
 * @property bool $contact_auto_reply_enabled
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
    'contact_notification_email',
    'contact_notification_subject_template',
    'contact_notification_body_template',
    'contact_auto_reply_enabled',
    'contact_auto_reply_subject_template',
    'contact_auto_reply_body_template',
    'website',
    'resume_url',
    'is_available',
    'is_visible',
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
    'glass_effect_enabled',
])]
class Profile extends Model
{
    /** @use HasFactory<ProfileFactory> */
    use HasFactory;

    public const DEFAULT_NOTIFICATION_SUBJECT = 'New portfolio enquiry: {subject}';

    public const DEFAULT_NOTIFICATION_BODY = "You received a new portfolio message.\n\nName: {name}\nEmail: {email}\nSubject: {subject}\n\n{message}";

    public const DEFAULT_AUTO_REPLY_SUBJECT = 'Thanks for your message about {subject}';

    public const DEFAULT_AUTO_REPLY_BODY = "Hi {name},\n\nThanks for reaching out. I received your message and will get back to you soon.\n\nBest,\n{portfolio_name}";

    protected $attributes = [
        'contact_notification_subject_template' => self::DEFAULT_NOTIFICATION_SUBJECT,
        'contact_notification_body_template' => self::DEFAULT_NOTIFICATION_BODY,
        'contact_auto_reply_enabled' => true,
        'contact_auto_reply_subject_template' => self::DEFAULT_AUTO_REPLY_SUBJECT,
        'contact_auto_reply_body_template' => self::DEFAULT_AUTO_REPLY_BODY,
        'theme_dark_accent' => '#d9ff43',
        'theme_light_accent' => '#006c55',
        'glass_effect_enabled' => false,
    ];

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

    /** @return HasMany<TrackingIntegration, $this> */
    public function trackingIntegrations(): HasMany
    {
        return $this->hasMany(TrackingIntegration::class);
    }

    #[Override]
    protected function casts(): array
    {
        return [
            'is_available' => 'boolean',
            'is_visible' => 'boolean',
            'contact_auto_reply_enabled' => 'boolean',
            'glass_effect_enabled' => 'boolean',
        ];
    }
}
