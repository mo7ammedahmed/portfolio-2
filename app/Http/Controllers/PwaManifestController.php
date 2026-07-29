<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Storage;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;

class PwaManifestController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $profile = Profile::query()
            ->where('is_visible', true)
            ->oldest()
            ->first();

        $name = $profile?->name_en
            ? "{$profile->name_en} — Portfolio"
            : config('app.name', 'Portfolio');

        $iconUrl = $profile?->image
            ? url(Storage::disk(config('filesystems.default'))->url($profile->image))
            : '';

        $backgroundColor = $profile?->theme_dark_background ?: '#070707';

        return response()->json([
            'id' => '/',
            'name' => $name,
            'short_name' => $profile?->name_en ?: 'Portfolio',
            'description' => $profile?->short_description_en ?: 'Professional portfolio',
            'lang' => 'en',
            'dir' => 'ltr',
            'start_url' => '/?source=pwa',
            'scope' => '/',
            'display' => 'standalone',
            'orientation' => 'any',
            'background_color' => $backgroundColor,
            'theme_color' => $profile?->theme_accent ?: '#d9ff43',
            'icons' => [
                [
                    'src' => $iconUrl,
                    'sizes' => 'any',
                    'type' => 'image/png',
                    'purpose' => 'any',
                ],
            ],
        ])->header('Content-Type', 'application/manifest+json');
    }
}
