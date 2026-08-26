<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Profile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\File;
use Override;

class StoreProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Profile::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name_ar' => ['required', 'string', 'max:120'],
            'name_en' => ['required', 'string', 'max:120'],
            'role_ar' => ['required', 'string', 'max:160'],
            'role_en' => ['required', 'string', 'max:160'],
            'short_description_ar' => ['required', 'string', 'max:500'],
            'short_description_en' => ['required', 'string', 'max:500'],
            'description_ar' => ['required', 'string', 'max:5000'],
            'description_en' => ['required', 'string', 'max:5000'],
            'location_ar' => ['nullable', 'string', 'max:160'],
            'location_en' => ['nullable', 'string', 'max:160'],
            'image' => ['nullable', File::image()->max('2mb')],
            'linkedin' => ['nullable', 'url:http,https', 'max:500'],
            'github' => ['nullable', 'url:http,https', 'max:500'],
            'whatsapp' => ['nullable', 'string', 'max:40'],
            'mobile' => ['nullable', 'string', 'max:40'],
            'email' => ['required', 'email', 'max:254'],
            'contact_notification_email' => ['nullable', 'email', 'max:254'],
            'contact_notification_subject_template' => ['required', 'string', 'max:255'],
            'contact_notification_body_template' => ['required', 'string', 'max:10000'],
            'contact_auto_reply_enabled' => ['required', 'boolean'],
            'contact_auto_reply_subject_template' => ['required', 'string', 'max:255'],
            'contact_auto_reply_body_template' => ['required', 'string', 'max:10000'],
            'website' => ['nullable', 'url:http,https', 'max:500'],
            'resume_url' => ['nullable', 'url:http,https', 'max:500'],
            // Accent, Background, Surface can be gradient or hex
            'theme_dark_accent' => ['required', 'palette_color'],
            'theme_light_accent' => ['required', 'palette_color'],
            'theme_dark_background' => ['required', 'palette_color'],
            'theme_dark_surface' => ['required', 'palette_color'],
            'theme_light_background' => ['required', 'palette_color'],
            'theme_light_surface' => ['required', 'palette_color'],
            // Foreground and Muted remain hex only
            'theme_dark_foreground' => ['required', 'hex_color'],
            'theme_dark_muted' => ['required', 'hex_color'],
            'theme_light_foreground' => ['required', 'hex_color'],
            'theme_light_muted' => ['required', 'hex_color'],
            'glass_effect_enabled' => ['required', 'boolean'],
            // Glass configuration fields
            'glass_blur' => ['required', 'numeric', 'between:0,50'],
            'glass_surface_opacity' => ['required', 'numeric', 'between:0,1'],
            'glass_border_opacity' => ['required', 'numeric', 'between:0,1'],
            'glass_saturation' => ['required', 'numeric', 'between:0,3'],
            'is_available' => ['required', 'boolean'],
            'is_visible' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    #[Override]
    public function messages(): array
    {
        return [
            'image.uploaded' => 'The portrait could not be uploaded. Choose a JPG, PNG, or WebP image under 2 MB.',
            'image.max' => 'The portrait must be smaller than 2 MB.',
            'image.image' => 'The portrait must be a valid JPG, PNG, or WebP image.',
        ];
    }
}
