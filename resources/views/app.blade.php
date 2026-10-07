<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ app()->getLocale() === 'ar' ? 'rtl' : 'ltr' }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>

@php
    $trackingIntegrations = collect(data_get($page, 'props.trackingIntegrations', []))
        ->filter(fn (mixed $integration): bool => is_array($integration)
            && is_string(data_get($integration, 'platform'))
            && is_string(data_get($integration, 'tracking_id')))
        ->keyBy('platform');
@endphp

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @php
        $seo = data_get($page, 'props.seo');
    @endphp
    @if ($seo)
        <meta data-inertia="description" name="description" content="{{ $seo['description'] }}">
        <link data-inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
        <meta data-inertia="og:title" property="og:title" content="{{ $seo['title'] }}">
        <meta data-inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
        <meta data-inertia="og:url" property="og:url" content="{{ $seo['canonical'] }}">
        <meta data-inertia="og:type" property="og:type" content="website">
        <meta data-inertia="og:image" property="og:image" content="{{ $seo['image'] }}">
        <meta data-inertia="twitter:card" name="twitter:card" content="summary_large_image">
    @else
        <meta data-inertia="robots" name="robots" content="noindex, nofollow">
    @endif
    <meta name="theme-color" content="#070707">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <x-tracking.head :integrations="$trackingIntegrations" />
    {{-- Inline script to detect system dark mode preference and apply it immediately --}}
    <script>
        (function() {
            const appearance = '{{ $appearance ?? 'system' }}';

            if (appearance === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                if (prefersDark) {
                    document.documentElement.classList.add('dark');
                }
            }
        })();
    </script>

    {{-- Inline style to set the HTML background color based on our theme in app.css --}}
    <style>
        html {
            background-color: oklch(1 0 0);
        }

        html.dark {
            background-color: oklch(0.145 0 0);
        }
    </style>

    @php
        $portfolioProfile = \App\Models\Profile::query()->where('is_visible', true)->oldest()->first();

        $brandInitials = collect(preg_split('/\s+/', trim($portfolioProfile?->name_en ?? config('app.name'))))
            ->filter()->take(2)->map(fn ($part) => mb_strtoupper(mb_substr($part, 0, 1)))->implode('');
        $fallbackIcon = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#17392f"/><text x="32" y="41" text-anchor="middle" font-family="Arial,sans-serif" font-size="25" font-weight="700" fill="#d9edbd">'.e($brandInitials).'</text></svg>';
        $faviconUrl = $portfolioProfile?->image
            ? \Illuminate\Support\Facades\Storage::disk(config('filesystems.default'))->url($portfolioProfile->image)
            : 'data:image/svg+xml;base64,'.base64_encode($fallbackIcon);
    @endphp
    <link rel="icon" href="{{ $faviconUrl }}">
    <link rel="apple-touch-icon" href="{{ $faviconUrl }}">
    <link rel="manifest" href="{{ route('pwa.manifest') }}">


    @fonts

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
    <x-inertia::head>
        <title>{{ $seo['title'] ?? config('app.name') }}</title>
    </x-inertia::head>
</head>

<body
    class="font-sans antialiased"
    data-tracking-server-rendered="{{ $trackingIntegrations->isNotEmpty() ? 'true' : 'false' }}"
>
    <x-tracking.body :integrations="$trackingIntegrations" />
    <x-inertia::app />
</body>

</html>
