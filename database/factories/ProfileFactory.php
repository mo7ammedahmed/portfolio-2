<?php

namespace Database\Factories;

use App\Models\Profile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name_ar' => 'محمد أحمد',
            'name_en' => fake()->name(),
            'role_ar' => 'مطور برمجيات متكامل',
            'role_en' => 'Full Stack Developer',
            'short_description_ar' => 'أبني منتجات رقمية سريعة وموثوقة.',
            'short_description_en' => 'I build fast, dependable digital products.',
            'description_ar' => 'مطور متخصص في Laravel وReact وتجارب المنتجات الرقمية.',
            'description_en' => fake()->paragraphs(2, true),
            'location_ar' => 'أبها، السعودية',
            'location_en' => 'Abha, Saudi Arabia',
            'email' => fake()->safeEmail(),
            'contact_notification_email' => null,
            'contact_notification_subject_template' => Profile::DEFAULT_NOTIFICATION_SUBJECT,
            'contact_notification_body_template' => Profile::DEFAULT_NOTIFICATION_BODY,
            'contact_auto_reply_enabled' => true,
            'contact_auto_reply_subject_template' => Profile::DEFAULT_AUTO_REPLY_SUBJECT,
            'contact_auto_reply_body_template' => Profile::DEFAULT_AUTO_REPLY_BODY,
            'is_available' => true,
            'is_visible' => true,
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
    }
}
