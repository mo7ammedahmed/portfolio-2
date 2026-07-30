<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\TrackingPlatform;
use App\Http\Requests\UpdateTrackingIntegrationRequest;
use App\Models\Profile;
use App\Models\TrackingIntegration;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class TrackingIntegrationController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Profile::class);

        $profile = $request->user()->portfolioAccount()->profile()->first();
        $configuredIntegrations = [];

        if ($profile) {
            foreach ($profile->trackingIntegrations()->get() as $integration) {
                $configuredIntegrations[$integration->platform->value] = $integration;
            }
        }

        return Inertia::render('admin/integrations/index', [
            'hasProfile' => $profile !== null,
            'platforms' => collect(TrackingPlatform::cases())
                ->map(function (TrackingPlatform $platform) use ($configuredIntegrations): array {
                    $integration = $configuredIntegrations[$platform->value] ?? null;

                    $configuration = $integration instanceof TrackingIntegration
                        ? [
                            'tracking_id' => $integration->tracking_id,
                            'is_enabled' => $integration->is_enabled,
                            'is_configured' => true,
                            'updated_at' => $integration->updated_at?->toIso8601String(),
                        ]
                        : [
                            'tracking_id' => '',
                            'is_enabled' => false,
                            'is_configured' => false,
                            'updated_at' => null,
                        ];

                    return [
                        'key' => $platform->value,
                        'label' => $platform->label(),
                        'category' => $platform->category(),
                        'description' => $platform->description(),
                        'placeholder' => $platform->placeholder(),
                        ...$configuration,
                    ];
                })
                ->values(),
            'detected' => [
                'googleVerificationFiles' => collect([
                    ...(File::glob(base_path('google*.html')) ?: []),
                    ...(File::glob(public_path('google*.html')) ?: []),
                ])->map(fn (string $path): string => basename($path))->unique()->values(),
            ],
        ]);
    }

    public function update(
        UpdateTrackingIntegrationRequest $request,
        TrackingPlatform $platform,
    ): RedirectResponse {
        $profile = $request->user()->portfolioAccount()->profile()->firstOrFail();

        Gate::authorize('update', $profile);

        $profile->trackingIntegrations()->updateOrCreate(
            ['platform' => $platform->value],
            $request->validated(),
        );

        return to_route('portfolio.integrations.index')
            ->with('success', "{$platform->label()} settings updated.");
    }

    public function destroy(
        Request $request,
        TrackingPlatform $platform,
    ): RedirectResponse {
        $profile = $request->user()->portfolioAccount()->profile()->firstOrFail();

        Gate::authorize('update', $profile);

        $profile->trackingIntegrations()
            ->where('platform', $platform->value)
            ->delete();

        return to_route('portfolio.integrations.index')
            ->with('success', "{$platform->label()} disconnected.");
    }
}
