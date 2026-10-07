<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreExperienceRequest;
use App\Http\Requests\UpdateExperienceRequest;
use App\Models\Experience;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Experience::class);

        return Inertia::render('admin/experiences/index', [
            'experiences' => $request->user()->portfolioAccount()->experiences()
                ->orderBy('sort_order')
                ->orderByDesc('started_at')
                ->paginate(10)
                ->through(fn (Experience $experience): array => [
                    ...$experience->only([
                        'id',
                        'name_ar',
                        'name_en',
                        'company_ar',
                        'company_en',
                        'location_en',
                        'is_current',
                        'is_visible',
                        'sort_order',
                    ]),
                    'started_at' => $experience->started_at->toDateString(),
                    'ended_at' => $experience->ended_at?->toDateString(),
                ]),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Experience::class);

        return Inertia::render('admin/experiences/form', ['experience' => null]);
    }

    public function store(StoreExperienceRequest $request): RedirectResponse
    {
        $request->user()->portfolioAccount()->experiences()->create(
            $request->validated(),
        );

        return to_route('portfolio.experiences.index')
            ->with('success', 'Experience created.');
    }

    public function edit(Experience $experience): Response
    {
        Gate::authorize('update', $experience);

        return Inertia::render('admin/experiences/form', [
            'experience' => [
                ...$experience->only([
                    'id',
                    'name_ar',
                    'name_en',
                    'company_ar',
                    'company_en',
                    'description_ar',
                    'description_en',
                    'location_ar',
                    'location_en',
                    'is_current',
                    'is_visible',
                    'sort_order',
                ]),
                'started_at' => $experience->started_at->toDateString(),
                'ended_at' => $experience->ended_at?->toDateString(),
            ],
        ]);
    }

    public function update(
        UpdateExperienceRequest $request,
        Experience $experience,
    ): RedirectResponse {
        $experience->update($request->validated());

        return to_route('portfolio.experiences.index')
            ->with('success', 'Experience updated.');
    }

    public function destroy(Experience $experience): RedirectResponse
    {
        Gate::authorize('delete', $experience);
        $experience->delete();

        return to_route('portfolio.experiences.index')
            ->with('success', 'Experience deleted.');
    }
}
