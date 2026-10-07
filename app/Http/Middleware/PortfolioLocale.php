<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PortfolioLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        app()->setLocale($request->cookie('portfolio_locale') === 'ar' ? 'ar' : 'en');

        return $next($request);
    }
}
