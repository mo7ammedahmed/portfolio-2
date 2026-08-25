<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\PageViewAnalyticsService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Enums\PortfolioPermission;

class AnalyticsController extends Controller
{
    /**
     * Return daily page view counts for a date range as JSON.
     *
     * @param  Request  $request
     * @param  PageViewAnalyticsService  $service
     * @return JsonResponse
     */
    public function pageViews(Request $request, PageViewAnalyticsService $service): JsonResponse
    {
        // Authorize: dashboard/admin users only
        Gate::authorize(PortfolioPermission::ViewAnalytics->value);

        // Get date range from query params, default to last 30 days
        $from = $request->query('from', Carbon::now()->subDays(29)->startOfDay()->toDateString());
        $to = $request->query('to', Carbon::now()->toDateString());

        // Validate dates (basic validation)
        $fromDate = Carbon::parse($from);
        $toDate = Carbon::parse($to);

        // Ensure from is not after to
        if ($fromDate->gt($toDate)) {
            return response()->json(['error' => 'Invalid date range'], 400);
        }

        // Get daily counts (optionally filter by path if provided)
        $path = $request->query('path');
        $data = $service->dailyCounts($fromDate, $toDate, $path);

        return response()->json($data);
    }
}