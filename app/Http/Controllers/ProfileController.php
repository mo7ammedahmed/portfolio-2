<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileRequest;
use App\Models\Profile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        Gate::authorize('viewAny', Profile::class);

        $profile = request()->user()->portfolioAccount()->profile()->first();

        return Inertia::render('admin/profile/edit', [
            'profile' => $profile ? [
                ...$profile->only([
                    'id',
                    'name_ar',
                    'name_en',
                    'role_ar',
                    'role_en',
                    'short_description_ar',
                    'short_description_en',
                    'description_ar',
                    'description_en',
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
                ]),
                'contact_notification_subject_template' => $profile->contact_notification_subject_template
                    ?: Profile::DEFAULT_NOTIFICATION_SUBJECT,
                'contact_notification_body_template' => $profile->contact_notification_body_template
                    ?: Profile::DEFAULT_NOTIFICATION_BODY,
                'contact_auto_reply_subject_template' => $profile->contact_auto_reply_subject_template
                    ?: Profile::DEFAULT_AUTO_REPLY_SUBJECT,
                'contact_auto_reply_body_template' => $profile->contact_auto_reply_body_template
                    ?: Profile::DEFAULT_AUTO_REPLY_BODY,
                'image_url' => $profile->image
                    ? Storage::disk(config('filesystems.default'))->url($profile->image)
                    : null,
            ] : null,
        ]);
    }

    public function update(UpdateProfileRequest $request): RedirectResponse
    {
        $portfolioAccount = $request->user()->portfolioAccount();
        $profile = $portfolioAccount->profile()->first();
        $newImagePath = null;

        $profile
            ? Gate::authorize('update', $profile)
            : Gate::authorize('create', Profile::class);

        $data = $request->safe()->except('image');

        if ($request->hasFile('image')) {
            $newImagePath = $request->file('image')->store('portfolio/profile', config('filesystems.default'));

            if (! is_string($newImagePath)) {
                return back()->withErrors([
                    'image' => 'The portrait could not be saved. Please try again.',
                ]);
            }

            $data['image'] = $newImagePath;
        }

        $portfolioAccount->profile()->updateOrCreate([], $data);

        if ($newImagePath && $profile?->image && $profile->image !== $newImagePath) {
            Storage::disk(config('filesystems.default'))->delete($profile->image);
        }

        return to_route('portfolio.profile.edit')
            ->with('success', 'Profile content updated.');
    }
}
