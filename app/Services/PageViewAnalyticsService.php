<?php

declare(strict_types=1);

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use App\Models\PageView;
use App\Models\VisitorSession;

class PageViewAnalyticsService
{
    /**
     * Get daily page view counts for a date range, with zero-filled gaps.
     *
     * @param  Carbon  $from
     * @param  Carbon  $to
     * @param  string|null  $path  Optional path to filter by
     * @return Collection<int, array{date: string, count: int}>
     */
    public function dailyCounts(Carbon $from, Carbon $to, ?string $path = null): Collection
    {
        // Ensure we are working with date only (no time)
        $fromStart = $from->copy()->startOfDay();
        $toEnd = $to->copy()->endOfDay();

        // Base query: join with visitor sessions to get profile-specific views if needed?
        // The prompt doesn't specify filtering by profile, but the existing analytics are scoped to a profile.
        // We'll assume we want to get page views for a specific profile (the owner's profile).
        // However, the service method signature doesn't include a profile ID.
        // Looking at the prompt: it says "Groups page_views by DATE(created_at) between $from and $to"
        // and optionally filter by $path.
        // We'll leave it as global for now, but note that the dashboard analytics are scoped to a profile.
        // We can add a profile_id parameter later if needed, but for reusability we'll keep it without profile.

        // We'll build the query on PageView, but we need to ensure we only count views from valid sessions?
        // The existing PageView model has a visitor_session_id, and we can join to VisitorSession to get the profile_id.
        // However, the prompt doesn't specify. Let's assume we want all page views (or we can add a scope for profile later).

        // For now, we'll do without profile filter, but note that the controller will need to scope to the current user's profile.

        $query = PageView::query()
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->whereBetween('created_at', [$fromStart, $toEnd]);

        if ($path !== null) {
            $query->where('path', $path);
        }

        // Group by date
        $results = $query->groupBy('date')
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        // Generate an array with zero-filled gaps for each day in the range
        $dailyCounts = collect();
        $current = $fromStart->copy();

        while ($current->lte($toEnd)) {
            $dateString = $current->toDateString();
            $count = $results->get($dateString)?->count ?? 0;

            $dailyCounts->push([
                'date' => $dateString,
                'count' => (int) $count,
            ]);

            $current->addDay();
        }

        return $dailyCounts;
    }
}