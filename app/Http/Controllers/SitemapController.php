<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Models\Profile;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $profile = Profile::query()->where('is_visible', true)->oldest()->first();
        $urls = [['loc' => url('/'), 'lastmod' => $profile?->updated_at?->toAtomString()]];
        if ($profile) {
            foreach ($profile->user->projects()->where('is_visible', true)->orderBy('id')->get() as $project) {
                $urls[] = ['loc' => route('work.show', $project->slug), 'lastmod' => $project->updated_at?->toAtomString()];
            }
        }

        return response()->view('sitemap', ['urls' => $urls])->header('Content-Type', 'application/xml');
    }
}
