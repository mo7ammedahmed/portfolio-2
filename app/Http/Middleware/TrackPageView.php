<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\PageView;
use App\Models\Profile;
use App\Models\VisitorSession;
use Carbon\Carbon;
use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TrackPageView
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response|RedirectResponse)  $next
     * @return Response|RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Skip if the request is for an API route, asset, admin route, or dashboard
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        // Skip known bots
        if ($this->isBot($request->userAgent())) {
            return $next($request);
        }

        // Compute visitor hash (IP + User Agent)
        $visitorHash = hash_hmac(
            'sha256',
            $request->ip().'|'.$request->userAgent(),
            (string) config('app.key')
        );

        // Debounce: skip if same visitor_hash + path within last 30 minutes
        $cacheKey = 'page_view:'.$visitorHash.':'.hash('sha256', $request->getPathInfo());
        if (Cache::has($cacheKey)) {
            return $next($request);
        }

        DB::transaction(function () use ($request, $visitorHash, $cacheKey) {
            $this->handlePageView($request, $visitorHash, $cacheKey);
        });

        // Set cache for debounce (30 minutes)
        Cache::put($cacheKey, true, 30);

        return $next($request);
    }

    /**
     * Handle the page view logging logic.
     */
    protected function handlePageView(Request $request, string $visitorHash, string $cacheKey): void
    {
        // Get the profile for the current user if authenticated, otherwise fallback to first visible profile
        $profile = $this->getProfile($request);

        if (! $profile) {
            // If no profile, we cannot associate the session, so we skip recording.
            // But we still need to set the cache to prevent repeated attempts?
            // We'll set the cache and return.
            Cache::put($cacheKey, true, 30);

            return;
        }

        $now = now();
        $path = $request->getPathInfo();

        // Try to find an existing session for this visitor that was active in the last 30 minutes
        $session = $this->getOrCreateVisitorSession($request, $visitorHash, $path, $profile, $now);

        // Create page view
        PageView::create([
            'visitor_session_id' => $session->id,
            'page_uuid' => Str::uuid(),
            'path' => $path,
            'title' => null,
            'entered_at' => $now,
            'duration_seconds' => 0,
        ]);
    }

    /**
     * Get the profile for the current user or fallback to first visible profile.
     */
    protected function getProfile(Request $request): ?Profile
    {
        if ($request->user()) {
            $user = $request->user();
            $portfolioAccount = $user->portfolioAccount();

            return Profile::query()
                ->where('user_id', $portfolioAccount->id)
                ->first();
        }

        // Get the profile (assuming single profile for now, similar to analytics collector)
        return Profile::query()
            ->where('is_visible', true)
            ->oldest()
            ->first();
    }

    /**
     * Get existing visitor session or create a new one.
     */
    protected function getOrCreateVisitorSession(Request $request, string $visitorHash, string $path, Profile $profile, $now): VisitorSession
    {
        // Try to find an existing session for this visitor that was active in the last 30 minutes
        $session = VisitorSession::query()
            ->where('visitor_hash', $visitorHash)
            ->where('last_seen_at', '>=', $now->copy()->subMinutes(30))
            ->orderBy('last_seen_at', 'desc')
            ->first();

        if ($session) {
            // Update the existing session
            $sessionStartedAt = Carbon::parse($session->started_at);
            $durationSeconds = max(0, (int) $now->diffInSeconds($sessionStartedAt));

            $session->forceFill([
                'last_seen_at' => $now,
                'last_page' => $path,
                'duration_seconds' => $durationSeconds,
                'page_views_count' => $session->page_views_count + 1,
            ])->save();

            return $session;
        }

        // Create a new session
        return VisitorSession::create([
            'session_uuid' => Str::uuid(),
            'profile_id' => $profile->id,
            'visitor_hash' => $visitorHash,
            'started_at' => $now,
            'last_seen_at' => $now,
            'landing_page' => Str::limit($path, 500),
            'last_page' => Str::limit($path, 500),
            'referrer' => $request->headers->get('referrer'),
            'utm_source' => $request->query('utm_source'),
            'utm_medium' => $request->query('utm_medium'),
            'utm_campaign' => $request->query('utm_campaign'),
            'browser' => Str::limit($this->getBrowser($request->userAgent()), 80),
            'platform' => Str::limit($this->getPlatform($request->userAgent()), 80),
            'device_type' => Str::limit($this->getDeviceType($request->userAgent()), 30),
            'language' => Str::limit($request->headers->get('accept-language'), 255),
            'timezone' => null,
            'screen_width' => null,
            'screen_height' => null,
            'duration_seconds' => 0,
            'page_views_count' => 1,
        ]);
    }

    /**
     * Determine if the request should be skipped (API, assets, admin, and dashboard).
     */
    protected function shouldSkip(Request $request): bool
    {
        $path = $request->path();

        // Skip API routes
        if (Str::startsWith($path, 'api/')) {
            return true;
        }

        // Skip asset routes (assuming assets are in public directory)
        if (preg_match('/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)(\?|$)/', $path)) {
            return true;
        }

        // Skip admin routes (if any, adjust as needed) and dashboard routes (to avoid tracking our own views)
        if (Str::startsWith($path, 'admin/') || Str::startsWith($path, 'dashboard')) {
            // Note: The prompt says exclude API/asset/admin routes
            // We'll exclude admin and dashboard routes to avoid tracking our own views in the analytics.
            return true;
        }

        // Skip analytics collector route
        if (Str::contains($path, 'analytics/collect')) {
            return true;
        }

        return false;
    }

    /**
     * Check if the user agent is a known bot.
     */
    protected function isBot(?string $userAgent): bool
    {
        if (! $userAgent) {
            return true;
        }

        $botPattern = '/bot|crawl|spider|slurp/i';

        return (bool) preg_match($botPattern, $userAgent);
    }

    /**
     * Get browser from user agent.
     */
    protected function getBrowser(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'Other';
        }

        $agent = strtolower($userAgent);

        if (str_contains($agent, 'edg/')) {
            return 'Edge';
        }

        if (str_contains($agent, 'firefox/')) {
            return 'Firefox';
        }

        if (str_contains($agent, 'chrome/')) {
            return 'Chrome';
        }

        if (str_contains($agent, 'safari/')) {
            return 'Safari';
        }

        return 'Other';
    }

    /**
     * Get platform from user agent.
     */
    protected function getPlatform(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'Other';
        }

        $agent = strtolower($userAgent);

        if (str_contains($agent, 'android')) {
            return 'Android';
        }

        if (str_contains($agent, 'iphone') || str_contains($agent, 'ipad')) {
            return 'iOS';
        }

        if (str_contains($agent, 'windows')) {
            return 'Windows';
        }

        if (str_contains($agent, 'mac os')) {
            return 'macOS';
        }

        if (str_contains($agent, 'linux')) {
            return 'Linux';
        }

        return 'Other';
    }

    /**
     * Get device type from user agent.
     */
    protected function getDeviceType(?string $userAgent): string
    {
        if (! $userAgent) {
            return 'Desktop';
        }

        $agent = strtolower($userAgent);

        if (str_contains($agent, 'ipad') || str_contains($agent, 'tablet')) {
            return 'Tablet';
        }

        if (str_contains($agent, 'mobile') || str_contains($agent, 'android')) {
            return 'Mobile';
        }

        return 'Desktop';
    }
}
