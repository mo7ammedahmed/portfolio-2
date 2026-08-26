<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\GradientCast;
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
 * @property string|array $theme_dark_accent
 * @property string|array $theme_light_accent
 * @property string|array $theme_dark_background
 * @property string|array $theme_dark_surface
 * @property string $theme_dark_foreground
 * @property string $theme_dark_muted
 * @property string|array $theme_light_background
 * @property string|array $theme_light_surface
 * @property string $theme_light_foreground
 * @property string $theme_light_muted
 * @property bool $glass_effect_enabled
 * @property float $glass_blur
 * @property float $glass_surface_opacity
 * @property float $glass_border_opacity
 * @property float $glass_saturation
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
    'glass_blur',
    'glass_surface_opacity',
    'glass_border_opacity',
    'glass_saturation',
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
        'theme_dark_background' => '#070707',
        'theme_dark_surface' => '#0d0d0d',
        'theme_dark_foreground' => '#f4f4f1',
        'theme_dark_muted' => '#a4a4a0',
        'theme_light_background' => '#f4f3ee',
        'theme_light_surface' => '#ffffff',
        'theme_light_foreground' => '#0a0a0a',
        'theme_light_muted' => '#686864',
        'glass_effect_enabled' => false,
        'glass_blur' => 1.25,
        'glass_surface_opacity' => 0.64,
        'glass_border_opacity' => 0.22,
        'glass_saturation' => 1.35,
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
            // Custom casts for gradient fields
            'theme_dark_accent' => GradientCast::class,
            'theme_light_accent' => GradientCast::class,
            'theme_dark_background' => GradientCast::class,
            'theme_dark_surface' => GradientCast::class,
            'theme_light_background' => GradientCast::class,
            'theme_light_surface' => GradientCast::class,
            // Glass fields are numeric, no cast needed
        ];
    }

    /**
     * Validate gradient array structure.
     */
    protected static function validateGradient($value): bool
    {
        if (is_string($value)) {
            // Assume it's a hex color string; validate hex format
            return preg_match('/^#[0-9A-Fa-f]{6}$/', $value) === 1;
        }

        if (! is_array($value)) {
            return false;
        }

        if (! isset($value['type']) || ! in_array($value['type'], ['linear', 'radial'], true)) {
            return false;
        }

        if (! isset($value['angle']) || ! is_numeric($value['angle']) || $value['angle'] < 0 || $value['angle'] > 360) {
            return false;
        }

        if (! isset($value['stops']) || ! is_array($value['stops']) || count($value['stops']) < 2) {
            return false;
        }

        foreach ($value['stops'] as $stop) {
            if (! is_array($stop)
                || ! isset($stop['color']) || preg_match('/^#[0-9A-Fa-f]{6}$/', $stop['color']) !== 1
                || ! isset($stop['position']) || ! is_numeric($stop['position']) || $stop['position'] < 0 || $stop['position'] > 100
            ) {
                return false;
            }
        }

        $positions = collect($value['stops'])->pluck('position')->sort()->values();

        return $positions->every(function ($pos, $key) use ($positions) {
            return $key === 0 || $pos > $positions->get($key - 1);
        });
    }
}
