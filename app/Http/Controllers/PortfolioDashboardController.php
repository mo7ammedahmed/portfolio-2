<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\PageView;
use App\Models\Profile;
use App\Models\VisitorSession;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioDashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $portfolioAccount = $user->portfolioAccount();
        $profile = Profile::query()
            ->where('user_id', $portfolioAccount->id)
            ->first();
        $profileId = $profile?->id;
        $periodStart = now()->subDays(13)->startOfDay();

        $periodSessions = $profileId
            ? VisitorSession::query()
                ->where('profile_id', $profileId)
                ->where('started_at', '>=', $periodStart)
                ->get()
            : collect();

        $periodPageViews = $profileId
            ? PageView::query()
                ->whereHas(
                    'visitorSession',
                    fn ($query) => $query->where('profile_id', $profileId),
                )
                ->where('entered_at', '>=', $periodStart)
                ->get()
            : collect();

        $daily = collect(range(0, 13))->map(function (int $offset) use ($periodStart, $periodSessions, $periodPageViews): array {
            $date = $periodStart->copy()->addDays($offset);
            $dateKey = $date->toDateString();

            $sessionsForDay = $periodSessions->filter(
                fn (VisitorSession $session): bool => $session->started_at->toDateString() === $dateKey,
            );

            return [
                'date' => $dateKey,
                'label' => $date->format('M j'),
                'visitors' => $sessionsForDay->pluck('visitor_hash')->unique()->count(),
                'sessions' => $sessionsForDay->count(),
                'pageViews' => $periodPageViews->filter(
                    fn (PageView $pageView): bool => $pageView->entered_at->toDateString() === $dateKey,
                )->count(),
            ];
        });

        $analyticsBase = VisitorSession::query()->when(
            $profileId,
            fn ($query) => $query->where('profile_id', $profileId),
            fn ($query) => $query->whereRaw('1 = 0'),
        );

        $topPages = $profileId
            ? PageView::query()
                ->whereHas(
                    'visitorSession',
                    fn ($query) => $query->where('profile_id', $profileId),
                )
                ->selectRaw('path, COUNT(*) as views, COALESCE(AVG(duration_seconds), 0) as average_duration')
                ->groupBy('path')
                ->orderByDesc('views')
                ->limit(6)
                ->get()
                ->map(fn (PageView $pageView): array => [
                    'path' => $pageView->path,
                    'views' => (int) $pageView->getAttribute('views'),
                    'averageDuration' => (int) round((float) $pageView->getAttribute('average_duration')),
                ])
            : collect();

        $recentVisitors = (clone $analyticsBase)
            ->latest('last_seen_at')
            ->limit(8)
            ->get()
            ->map(fn (VisitorSession $session): array => [
                'id' => $session->id,
                'visitor' => strtoupper(substr($session->visitor_hash, 0, 8)),
                'startedAt' => $session->started_at->toIso8601String(),
                'lastSeenAt' => $session->last_seen_at->toIso8601String(),
                'durationSeconds' => $session->duration_seconds,
                'pageViews' => $session->page_views_count,
                'landingPage' => $session->landing_page,
                'lastPage' => $session->last_page,
                'browser' => $session->browser ?? 'Other',
                'platform' => $session->platform ?? 'Other',
                'deviceType' => $session->device_type ?? 'Desktop',
                'source' => $session->utm_source ?: (
                    $session->referrer
                        ? (parse_url($session->referrer, PHP_URL_HOST) ?: 'Referral')
                        : 'Direct'
                ),
            ]);

        $cv = $portfolioAccount->cv()->first();

        return Inertia::render('dashboard', [
            'metrics' => [
                'projects' => $portfolioAccount->projects()->count(),
                'featuredProjects' => $portfolioAccount->projects()->where('is_featured', true)->count(),
                'experiences' => $portfolioAccount->experiences()->count(),
                'skills' => $portfolioAccount->skills()->count(),
                'cvId' => $cv ? $cv->id : null,
                'cvComplete' => $cv !== null,
                'profileComplete' => $portfolioAccount->profile()->exists(),
            ],
            'recentProjects' => $portfolioAccount->projects()
                ->latest()
                ->limit(5)
                ->get(['id', 'name_en', 'is_visible', 'updated_at']),
            'analytics' => [
                'summary' => [
                    'visitors' => (clone $analyticsBase)->distinct('visitor_hash')->count('visitor_hash'),
                    'sessions' => (clone $analyticsBase)->count(),
                    'pageViews' => (clone $analyticsBase)->sum('page_views_count'),
                    'averageDuration' => (int) round((float) ((clone $analyticsBase)->avg('duration_seconds') ?? 0)),
                    'visitorsToday' => (clone $analyticsBase)
                        ->where('started_at', '>=', Carbon::today())
                        ->distinct('visitor_hash')
                        ->count('visitor_hash'),
                ],
                'daily' => $daily,
                'topPages' => $topPages,
                'recentVisitors' => $recentVisitors,
            ],
        ]);
    }
}
