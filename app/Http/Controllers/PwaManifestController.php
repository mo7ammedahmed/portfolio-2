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

// Always start with the bundled static icons as a guaranteed fallback
$icons = [
['src' => '/android-chrome-192x192.png', 'sizes' => '192x192', 'type' => 'image/png', 'purpose' => 'any'],
['src' => '/android-chrome-512x512.png', 'sizes' => '512x512', 'type' => 'image/png', 'purpose' => 'maskable'],
];

// Optionally add the profile image as an extra icon (not a replacement)
if ($profile?->image) {
$disk = Storage::disk(config('filesystems.default'));
$iconUrl = url($disk->url($profile->image));

$icons[] = [
'src' => $iconUrl,
'sizes' => '512x512',
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