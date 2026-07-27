<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Override;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    #[Override]
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    #[Override]
    public function share(Request $request): array
    {
        $user = $request->user();
        $themeAttributes = [
            'theme_accent',
            'theme_dark_background',
            'theme_dark_surface',
            'theme_dark_foreground',
            'theme_dark_muted',
            'theme_light_background',
            'theme_light_surface',
            'theme_light_foreground',
            'theme_light_muted',
        ];
        $portfolioTheme = $user
            ? $user->portfolioAccount()
                ->profile()
                ->first($themeAttributes)
                ?->only($themeAttributes)
            : null;

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'auth' => [
                'user' => $user ? [
                    ...$user->only([
                        'id',
                        'name',
                        'email',
                        'email_verified_at',
                        'created_at',
                        'updated_at',
                    ]),
                    'is_owner' => $user->isPortfolioOwner(),
                    'permissions' => $user->portfolioPermissions(),
                    'role' => $user->role?->only(['id', 'name']),
                ] : null,
            ],
            'portfolioTheme' => $portfolioTheme,
            'flash' => [
                'success' => fn (): ?string => $request->session()->get('success'),
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
