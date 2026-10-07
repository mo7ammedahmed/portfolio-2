<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\CollectAnalyticsRequest;
use App\Models\PageView;
use App\Models\Profile;
use App\Models\VisitorSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AnalyticsCollectorController extends Controller
{
    public function __invoke(CollectAnalyticsRequest $request): JsonResponse
    {
        $profile = Profile::query()
            ->where('is_visible', true)
            ->oldest()
            ->first();

        if (! $profile) {
            return response()->json(status: 204);
        }

        $data = $request->validated();
        $now = now();
        $duration = (int) ($data['duration_seconds'] ?? 0);
        $pageDuration = (int) ($data['page_duration_seconds'] ?? 0);
        $path = Str::limit($data['path'], 500, '');
        $client = $this->clientDetails($request->userAgent());

        DB::transaction(function () use ($profile, $request, $data, $now, $duration, $pageDuration, $path, $client): void {
            $session = VisitorSession::query()->firstOrCreate(
                ['session_uuid' => $data['session_id']],
                [
                    'profile_id' => $profile->id,
                    'visitor_hash' => hash_hmac(
                        'sha256',
                        ($request->ip() ?? 'unknown').'|'.($request->userAgent() ?? 'unknown'),
                        (string) config('app.key'),
                    ),
                    'started_at' => $now,
                    'last_seen_at' => $now,
                    'duration_seconds' => 0,
                    'page_views_count' => 0,
                    'landing_page' => $path,
                    'last_page' => $path,
                    'referrer' => $data['referrer'] ?? null,
                    'utm_source' => $data['utm_source'] ?? null,
                    'utm_medium' => $data['utm_medium'] ?? null,
                    'utm_campaign' => $data['utm_campaign'] ?? null,
                    'browser' => $client['browser'],
                    'platform' => $client['platform'],
                    'device_type' => $client['device_type'],
                    'language' => $data['language'] ?? null,
                    'timezone' => $data['timezone'] ?? null,
                    'screen_width' => $data['screen_width'] ?? null,
                    'screen_height' => $data['screen_height'] ?? null,
                ],
            );

            if ($session->profile_id !== $profile->id) {
                return;
            }

            $session->forceFill([
                'last_seen_at' => $now,
                'last_page' => $path,
                'duration_seconds' => max($session->duration_seconds, $duration),
            ])->save();

            $pageView = PageView::query()->firstOrCreate(
                [
                    'visitor_session_id' => $session->id,
                    'page_uuid' => $data['page_id'],
                ],
                [
                    'path' => $path,
                    'title' => $data['title'] ?? null,
                    'entered_at' => $now,
                    'duration_seconds' => 0,
                ],
            );

            $pageView->forceFill([
                'path' => $path,
                'title' => $data['title'] ?? $pageView->title,
                'duration_seconds' => max($pageView->duration_seconds, $pageDuration),
                'left_at' => $data['event'] === 'end' ? $now : $pageView->left_at,
            ])->save();

            $session->forceFill([
                'page_views_count' => $session->pageViews()->count(),
            ])->save();
        });

        return response()->json(['accepted' => true], 202);
    }

    /**
     * @return array{browser: string, platform: string, device_type: string}
     */
    private function clientDetails(?string $userAgent): array
    {
        $agent = strtolower($userAgent ?? '');

        $browser = match (true) {
            str_contains($agent, 'edg/') => 'Edge',
            str_contains($agent, 'firefox/') => 'Firefox',
            str_contains($agent, 'chrome/') => 'Chrome',
            str_contains($agent, 'safari/') => 'Safari',
            default => 'Other',
        };

        $platform = match (true) {
            str_contains($agent, 'android') => 'Android',
            str_contains($agent, 'iphone'), str_contains($agent, 'ipad') => 'iOS',
            str_contains($agent, 'windows') => 'Windows',
            str_contains($agent, 'mac os') => 'macOS',
            str_contains($agent, 'linux') => 'Linux',
            default => 'Other',
        };

        $deviceType = match (true) {
            str_contains($agent, 'ipad'), str_contains($agent, 'tablet') => 'Tablet',
            str_contains($agent, 'mobile'), str_contains($agent, 'android') => 'Mobile',
            default => 'Desktop',
        };

        return [
            'browser' => $browser,
            'platform' => $platform,
            'device_type' => $deviceType,
        ];
    }
}
