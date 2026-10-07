<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\PortfolioPermission;
use App\Models\PageView;
use App\Models\Profile;
use App\Models\VisitorSession;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioAnalyticsController extends Controller
{
    private const array ALLOWED_PERIODS = [7, 30, 90];

    public function __invoke(Request $request): Response
    {
        Gate::authorize(PortfolioPermission::ViewAnalytics->value);

        $period = $request->integer('period', 30);

        if (! in_array($period, self::ALLOWED_PERIODS, true)) {
            $period = 30;
        }

        $profileId = Profile::query()
            ->where('user_id', $request->user()->portfolioOwnerId())
            ->value('id');
        $periodEnd = now();
        $periodStart = $periodEnd->copy()
            ->subDays($period - 1)
            ->startOfDay();
        $previousEnd = $periodStart->copy()->subSecond();
        $previousStart = $previousEnd->copy()
            ->subDays($period - 1)
            ->startOfDay();

        if (! $profileId) {
            return Inertia::render('admin/analytics/index', [
                'filters' => [
                    'period' => $period,
                    'availablePeriods' => self::ALLOWED_PERIODS,
                    'startsAt' => $periodStart->toDateString(),
                    'endsAt' => $periodEnd->toDateString(),
                ],
                'hasProfile' => false,
                'analytics' => $this->emptyAnalytics($periodStart, $period),
            ]);
        }

        $profileId = (int) $profileId;

        $currentSessions = $this->sessionQuery(
            $profileId,
            $periodStart,
            $periodEnd,
        );
        $previousSessions = $this->sessionQuery(
            $profileId,
            $previousStart,
            $previousEnd,
        );
        $currentPageViews = $this->pageViewQuery(
            $profileId,
            $periodStart,
            $periodEnd,
        );
        $previousPageViews = $this->pageViewQuery(
            $profileId,
            $previousStart,
            $previousEnd,
        );

        $currentSummary = $this->summary(
            $currentSessions,
            $currentPageViews,
        );
        $previousSummary = $this->summary(
            $previousSessions,
            $previousPageViews,
        );
        $sessionTotal = $currentSummary['sessions'];

        $profileColor = null;
        if ($profileId !== 0) {
            $profile = Profile::find($profileId);
            if ($profile) {
                $profileColor = $profile->theme_light_accent;
            }
        }

        return Inertia::render('admin/analytics/index', [
            'filters' => [
                'period' => $period,
                'availablePeriods' => self::ALLOWED_PERIODS,
                'startsAt' => $periodStart->toDateString(),
                'endsAt' => $periodEnd->toDateString(),
            ],
            'hasProfile' => true,
            'analytics' => [
                'summary' => [
                    'visitors' => $this->metric(
                        $currentSummary['visitors'],
                        $previousSummary['visitors'],
                    ),
                    'sessions' => $this->metric(
                        $currentSummary['sessions'],
                        $previousSummary['sessions'],
                    ),
                    'pageViews' => $this->metric(
                        $currentSummary['pageViews'],
                        $previousSummary['pageViews'],
                    ),
                    'averageDuration' => $this->metric(
                        $currentSummary['averageDuration'],
                        $previousSummary['averageDuration'],
                    ),
                    'bounceRate' => $this->metric(
                        $currentSummary['bounceRate'],
                        $previousSummary['bounceRate'],
                    ),
                    'returningVisitors' => $this->metric(
                        $currentSummary['returningVisitors'],
                        $previousSummary['returningVisitors'],
                    ),
                ],
                'daily' => $this->dailyTraffic(
                    $currentSessions,
                    $currentPageViews,
                    $periodStart,
                    $period,
                ),
                'topPages' => $this->topPages(
                    $profileId,
                    $periodStart,
                    $periodEnd,
                ),
                'landingPages' => $this->sessionPathBreakdown(
                    $currentSessions,
                    'landing_page',
                    $sessionTotal,
                ),
                'exitPages' => $this->sessionPathBreakdown(
                    $currentSessions,
                    'last_page',
                    $sessionTotal,
                ),
                'sources' => $this->sources(
                    $currentSessions,
                    $sessionTotal,
                ),
                'campaigns' => $this->breakdown(
                    $currentSessions,
                    'utm_campaign',
                    $sessionTotal,
                    excludeEmpty: true,
                ),
                'devices' => $this->breakdown(
                    $currentSessions,
                    'device_type',
                    $sessionTotal,
                ),
                'browsers' => $this->breakdown(
                    $currentSessions,
                    'browser',
                    $sessionTotal,
                ),
                'platforms' => $this->breakdown(
                    $currentSessions,
                    'platform',
                    $sessionTotal,
                ),
                'regions' => $this->breakdown(
                    $currentSessions,
                    'timezone',
                    $sessionTotal,
                ),
                'languages' => $this->breakdown(
                    $currentSessions,
                    'language',
                    $sessionTotal,
                ),
                'recentSessions' => $this->recentSessions($currentSessions),
                'profileColor' => $profileColor,
            ],
        ]);
    }

    /**
     * @return Builder<VisitorSession>
     */
    private function sessionQuery(
        int $profileId,
        CarbonInterface $start,
        CarbonInterface $end,
    ): Builder {
        return VisitorSession::query()
            ->where('profile_id', $profileId)
            ->whereBetween('started_at', [$start, $end]);
    }

    /**
     * @return Builder<PageView>
     */
    private function pageViewQuery(
        int $profileId,
        CarbonInterface $start,
        CarbonInterface $end,
    ): Builder {
        return PageView::query()
            ->whereHas(
                'visitorSession',
                fn (Builder $query) => $query->where(
                    'profile_id',
                    $profileId,
                ),
            )
            ->whereBetween('entered_at', [$start, $end]);
    }

    /**
     * @param  Builder<VisitorSession>  $sessions
     * @param  Builder<PageView>  $pageViews
     * @return array{
     *     visitors: int,
     *     sessions: int,
     *     pageViews: int,
     *     averageDuration: int,
     *     bounceRate: float,
     *     returningVisitors: int
     * }
     */
    private function summary(Builder $sessions, Builder $pageViews): array
    {
        $sessionCount = (clone $sessions)->count();
        $visitorCount = (clone $sessions)
            ->distinct('visitor_hash')
            ->count('visitor_hash');
        $singlePageSessions = (clone $sessions)
            ->where('page_views_count', '<=', 1)
            ->count();
        $returningVisitors = DB::query()
            ->fromSub(
                (clone $sessions)
                    ->select('visitor_hash')
                    ->groupBy('visitor_hash')
                    ->havingRaw('COUNT(*) > 1'),
                'returning_visitors',
            )
            ->count();

        return [
            'visitors' => $visitorCount,
            'sessions' => $sessionCount,
            'pageViews' => (clone $pageViews)->count(),
            'averageDuration' => (int) round(
                (float) ((clone $sessions)->avg('duration_seconds') ?? 0),
            ),
            'bounceRate' => $sessionCount > 0
                ? round(($singlePageSessions / $sessionCount) * 100, 1)
                : 0.0,
            'returningVisitors' => $returningVisitors,
        ];
    }

    /**
     * @return array{value: int|float, change: float|null}
     */
    private function metric(int|float $current, int|float $previous): array
    {
        $change = match (true) {
            $previous == 0 && $current == 0 => null,
            $previous == 0 => 100.0,
            default => round((($current - $previous) / $previous) * 100, 1),
        };

        return [
            'value' => $current,
            'change' => $change,
        ];
    }

    /**
     * @param  Builder<VisitorSession>  $sessions
     * @param  Builder<PageView>  $pageViews
     * @return Collection<int, array{
     *     date: string,
     *     label: string,
     *     visitors: int,
     *     sessions: int,
     *     pageViews: int
     * }>
     */
    private function dailyTraffic(
        Builder $sessions,
        Builder $pageViews,
        CarbonInterface $periodStart,
        int $period,
    ): Collection {
        $sessionRows = (clone $sessions)
            ->selectRaw(
                'DATE(started_at) as date_key, COUNT(*) as sessions, COUNT(DISTINCT visitor_hash) as visitors',
            )
            ->groupBy('date_key')
            ->get()
            ->keyBy(fn (VisitorSession $session): string => (string) $session->getAttribute('date_key'));
        $pageViewRows = (clone $pageViews)
            ->selectRaw('DATE(entered_at) as date_key, COUNT(*) as page_views')
            ->groupBy('date_key')
            ->get()
            ->keyBy(fn (PageView $pageView): string => (string) $pageView->getAttribute('date_key'));

        return collect(range(0, $period - 1))->map(
            function (int $offset) use ($periodStart, $sessionRows, $pageViewRows): array {
                $date = $periodStart->copy()->addDays($offset);
                $dateKey = $date->toDateString();
                $sessionRow = $sessionRows->get($dateKey);
                $pageViewRow = $pageViewRows->get($dateKey);

                return [
                    'date' => $dateKey,
                    'label' => $date->format('M j'),
                    'visitors' => (int) ($sessionRow?->getAttribute('visitors') ?? 0),
                    'sessions' => (int) ($sessionRow?->getAttribute('sessions') ?? 0),
                    'pageViews' => (int) ($pageViewRow?->getAttribute('page_views') ?? 0),
                ];
            },
        );
    }

    /**
     * @return Collection<int, array{
     *     path: string,
     *     views: int,
     *     sessions: int,
     *     averageDuration: int
     * }>
     */
    private function topPages(
        int $profileId,
        CarbonInterface $start,
        CarbonInterface $end,
    ): Collection {
        return PageView::query()
            ->join(
                'visitor_sessions',
                'visitor_sessions.id',
                '=',
                'page_views.visitor_session_id',
            )
            ->where('visitor_sessions.profile_id', $profileId)
            ->whereBetween('page_views.entered_at', [$start, $end])
            ->selectRaw(
                'page_views.path, COUNT(*) as views, COUNT(DISTINCT page_views.visitor_session_id) as sessions, COALESCE(AVG(page_views.duration_seconds), 0) as average_duration',
            )
            ->groupBy('page_views.path')
            ->orderByDesc('views')
            ->limit(10)
            ->get()
            ->map(fn (PageView $pageView): array => [
                'path' => $pageView->path,
                'views' => (int) $pageView->getAttribute('views'),
                'sessions' => (int) $pageView->getAttribute('sessions'),
                'averageDuration' => (int) round(
                    (float) $pageView->getAttribute('average_duration'),
                ),
            ]);
    }

    /**
     * @param  Builder<VisitorSession>  $sessions
     * @return Collection<int, array{label: string, value: int, percentage: float}>
     */
    private function sessionPathBreakdown(
        Builder $sessions,
        string $column,
        int $total,
    ): Collection {
        return $this->normalizeBreakdown(
            (clone $sessions)
                ->whereNotNull($column)
                ->where($column, '!=', '')
                ->select($column)
                ->selectRaw('COUNT(*) as aggregate')
                ->groupBy($column)
                ->orderByDesc('aggregate')
                ->limit(8)
                ->get(),
            $total,
            $column,
        );
    }

    /**
     * @param  Builder<VisitorSession>  $sessions
     * @return Collection<int, array{label: string, value: int, percentage: float}>
     */
    private function sources(Builder $sessions, int $total): Collection
    {
        return $this->normalizeBreakdown(
            (clone $sessions)
                ->selectRaw(
                    "COALESCE(NULLIF(utm_source, ''), CASE WHEN referrer IS NULL OR referrer = '' THEN 'Direct' ELSE 'Referral' END) as label, COUNT(*) as aggregate",
                )
                ->groupByRaw(
                    "COALESCE(NULLIF(utm_source, ''), CASE WHEN referrer IS NULL OR referrer = '' THEN 'Direct' ELSE 'Referral' END)",
                )
                ->orderByDesc('aggregate')
                ->limit(8)
                ->get(),
            $total,
        );
    }

    /**
     * @param  Builder<VisitorSession>  $sessions
     * @return Collection<int, array{label: string, value: int, percentage: float}>
     */
    private function breakdown(
        Builder $sessions,
        string $column,
        int $total,
        bool $excludeEmpty = false,
    ): Collection {
        $query = (clone $sessions);

        if ($excludeEmpty) {
            $query->whereNotNull($column)->where($column, '!=', '');
        }

        return $this->normalizeBreakdown(
            $query
                ->select($column)
                ->selectRaw('COUNT(*) as aggregate')
                ->groupBy($column)
                ->orderByDesc('aggregate')
                ->get(),
            $total,
            $column,
        );
    }

    /**
     * @param  Collection<int, VisitorSession>  $rows
     * @return Collection<int, array{label: string, value: int, percentage: float}>
     */
    private function normalizeBreakdown(
        Collection $rows,
        int $total,
        string $labelColumn = 'label',
    ): Collection {
        return $rows
            ->map(function (VisitorSession $row) use ($labelColumn): array {
                $label = $row->getAttribute($labelColumn);

                return [
                    'label' => $label === null || $label === ''
                        ? 'Other'
                        : (string) $label,
                    'value' => (int) $row->getAttribute('aggregate'),
                ];
            })
            ->groupBy('label')
            ->map(fn (Collection $items, string $label): array => [
                'label' => $label,
                'value' => (int) $items->sum('value'),
            ])
            ->sortByDesc('value')
            ->take(8)
            ->values()
            ->map(fn (array $item): array => [
                ...$item,
                'percentage' => $total > 0
                    ? round(($item['value'] / $total) * 100, 1)
                    : 0.0,
            ]);
    }

    /**
     * @param  Builder<VisitorSession>  $sessions
     * @return array<int, array{
     *     id: int,
     *     visitor: string,
     *     startedAt: string,
     *     lastSeenAt: string,
     *     durationSeconds: int,
     *     pageViews: int,
     *     landingPage: string,
     *     lastPage: string|null,
     *     browser: string,
     *     platform: string,
     *     deviceType: string,
     *     language: string|null,
     *     timezone: string|null,
     *     screen: string|null,
     *     source: string
     * }>
     */
    private function recentSessions(Builder $sessions): array
    {
        return (clone $sessions)
            ->latest('last_seen_at')
            ->limit(20)
            ->get([
                'id',
                'visitor_hash',
                'started_at',
                'last_seen_at',
                'duration_seconds',
                'page_views_count',
                'landing_page',
                'last_page',
                'referrer',
                'utm_source',
                'browser',
                'platform',
                'device_type',
                'language',
                'timezone',
                'screen_width',
                'screen_height',
            ])
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
                'deviceType' => $session->device_type ?? 'Other',
                'language' => $session->language,
                'timezone' => $session->timezone,
                'screen' => $session->screen_width && $session->screen_height
                    ? "{$session->screen_width} × {$session->screen_height}"
                    : null,
                'source' => $session->utm_source ?: (
                    $session->referrer
                        ? (parse_url($session->referrer, PHP_URL_HOST) ?: 'Referral')
                        : 'Direct'
                ),
            ])
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    private function emptyAnalytics(
        CarbonInterface $periodStart,
        int $period,
    ): array {
        $metric = ['value' => 0, 'change' => null];

        return [
            'summary' => [
                'visitors' => $metric,
                'sessions' => $metric,
                'pageViews' => $metric,
                'averageDuration' => $metric,
                'bounceRate' => $metric,
                'returningVisitors' => $metric,
            ],
            'daily' => collect(range(0, $period - 1))->map(
                function (int $offset) use ($periodStart): array {
                    $date = $periodStart->copy()->addDays($offset);

                    return [
                        'date' => $date->toDateString(),
                        'label' => $date->format('M j'),
                        'visitors' => 0,
                        'sessions' => 0,
                        'pageViews' => 0,
                    ];
                },
            ),
            'topPages' => [],
            'landingPages' => [],
            'exitPages' => [],
            'sources' => [],
            'campaigns' => [],
            'devices' => [],
            'browsers' => [],
            'platforms' => [],
            'regions' => [],
            'languages' => [],
            'recentSessions' => [],
        ];
    }
}
