<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

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

        $backgroundColor = $profile?->theme_dark_background ?: '#070707';

        $icons = [];

        if ($profile?->image) {
            $disk = Storage::disk(config('filesystems.default'));
            $iconUrl = url($disk->url($profile->image));

            $sizes = '512x512';

            try {
                $contents = $disk->get($profile->image);
                $info = @getimagesizefromstring($contents);

                if ($info && $info[0] >= 192 && $info[1] >= 192) {
                    $sizes = "{$info[0]}x{$info[1]}";
                }
            } catch (\Throwable $e) {
                // Keep default fallback size if the file can't be read
            }

            $icons[] = [
                'src' => $iconUrl,
                'sizes' => $sizes,
                'type' => 'image/png',
                'purpose' => 'any',
            ];
        }

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
            'theme_color' => $profile?->theme_dark_accent ?: '#d9ff43',
            'icons' => $icons,
        ])->header('Content-Type', 'application/manifest+json');
    }
}
