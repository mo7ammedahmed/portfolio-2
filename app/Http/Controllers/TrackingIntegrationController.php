<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\TrackingInstallationMethod;
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
        $configuredIntegrations = $profile?->trackingIntegrations()
            ->get()
            ->keyBy(fn (TrackingIntegration $integration): string => $integration->platform->value)
            ?? collect();
        $canManageCustomCode = $request->user()->isPortfolioOwner();

        return Inertia::render('admin/integrations/index', [
            'hasProfile' => $profile !== null,
            'canManageCustomCode' => $canManageCustomCode,
            'siteUrl' => route('home'),
            'platforms' => collect(TrackingPlatform::cases())
                ->map(function (TrackingPlatform $platform) use (
                    $canManageCustomCode,
                    $configuredIntegrations,
                ): array {
                    $integration = $configuredIntegrations->get($platform->value);

                    $configuration = $integration instanceof TrackingIntegration
                        ? [
                            'tracking_id' => $integration->tracking_id,
                            'installation_method' => $integration->installation_method->value,
                            'head_code' => $canManageCustomCode
                                ? ($integration->head_code ?? '')
                                : '',
                            'body_code' => $canManageCustomCode
                                ? ($integration->body_code ?? '')
                                : '',
                            'is_enabled' => $integration->is_enabled,
                            'is_configured' => true,
                            'updated_at' => $integration->updated_at?->toIso8601String(),
                        ]
                        : [
                            'tracking_id' => '',
                            'installation_method' => TrackingInstallationMethod::Managed->value,
                            'head_code' => '',
                            'body_code' => '',
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
                        'id_label' => $platform->idLabel(),
                        'placement' => $platform->placement(),
                        'documentation_url' => $platform->documentationUrl(),
                        'diagnostics_url' => $platform->diagnosticsUrl(),
                        'diagnostics_label' => $platform->diagnosticsLabel(),
                        'brand_color' => $platform->brandColor(),
                        'monogram' => $platform->monogram(),
                        'has_body_fallback' => $platform->hasBodyFallback(),
                        'head_code_marker' => $platform->headCodeMarker(),
                        'body_code_marker' => $platform->bodyCodeMarker(),
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

        $data = $request->validated();
        $installationMethod = TrackingInstallationMethod::from(
            $data['installation_method'],
        );
        $data['tracking_id'] = $installationMethod === TrackingInstallationMethod::Managed
            ? $data['tracking_id']
            : '';
        $data['head_code'] = $installationMethod === TrackingInstallationMethod::Custom
            ? $data['head_code']
            : null;
        $data['body_code'] = $installationMethod === TrackingInstallationMethod::Custom
            ? ($data['body_code'] ?? null)
            : null;

        $profile->trackingIntegrations()->updateOrCreate(
            ['platform' => $platform->value],
            $data,
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
