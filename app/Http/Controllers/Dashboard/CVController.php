<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCVRequest;
use App\Http\Requests\UpdateCVRequest;
use App\Models\CV;
use App\Services\CvCompleteness;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CVController extends Controller
{
    /**
     * Display a listing of the user's CV(s).
     */
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', CV::class);

        $cv = $request->user()->portfolioAccount()->cv;
        $scores = $cv ? app(CvCompleteness::class)->scores($cv) : [];

        return Inertia::render('admin/cv/index', [
            'cv' => $cv ? [
                'id' => $cv->id,
                'title' => $cv->title,
                'ats_total' => array_sum($scores),
                'ats_scores' => $scores,
                'updated_at' => $cv->updated_at,
            ] : null,
        ]);
    }

    /**
     * Show the form for creating a new CV.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        Gate::authorize('create', CV::class);

        if ($cv = $request->user()->portfolioAccount()->cv) {
            return to_route('portfolio.cv.edit', $cv);
        }

        return Inertia::render('admin/cv/form', [
            'cv' => null,
        ]);
    }

    /**
     * Store a newly created CV in storage.
     */
    public function store(StoreCVRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($request, $data): void {
            $owner = $request->user()->portfolioAccount();
            $owner->newQuery()->whereKey($owner->id)->lockForUpdate()->firstOrFail();
            $cv = $owner->cv()->firstOrCreate([], $data);
            if ($cv->wasRecentlyCreated) {
                $this->calculateATSScores($cv);
            }
        });

        return to_route('portfolio.cv.index')
            ->with('success', 'CV created.');
    }

    /**
     * Show the form for editing the specified CV.
     */
    public function edit(Request $request, CV $cv): Response
    {
        Gate::authorize('update', $cv);

        return Inertia::render('admin/cv/form', [
            'cv' => [
                'id' => $cv->id,
                'title' => $cv->title,
                'summary' => $cv->summary,
                'contact_info' => $cv->contact_info,
                'experience' => $cv->experience,
                'education' => $cv->education,
                'skills' => $cv->skills,
                'certifications' => $cv->certifications,
                'languages' => $cv->languages,
                'additional_sections' => $cv->additional_sections,
                'ats_scores' => $cv->ats_scores,
                'ats_total' => $cv->ats_total,
            ],
        ]);
    }

    /**
     * Update the specified CV in storage.
     */
    public function update(UpdateCVRequest $request, CV $cv): RedirectResponse
    {
        Gate::authorize('update', $cv);

        $data = $request->validated();

        $cv->update($data);

        // Recalculate ATS scores
        $this->calculateATSScores($cv);

        return to_route('portfolio.cv.index')
            ->with('success', 'CV updated.');
    }

    /**
     * Remove the specified CV from storage.
     */
    public function destroy(Request $request, CV $cv): RedirectResponse
    {
        Gate::authorize('delete', $cv);

        $cv->delete();

        return to_route('portfolio.cv.index')
            ->with('success', 'CV deleted.');
    }

    public function preview(CV $cv): View
    {
        Gate::authorize('view', $cv);

        return view('cv-preview', ['cv' => $cv]);
    }

    /**
     * Calculate ATS scores for a CV.
     */
    protected function calculateATSScores(CV $cv): void
    {
        $scores = app(CvCompleteness::class)->scores($cv);
        $cv->update(['ats_scores' => $scores, 'ats_total' => array_sum($scores)]);
    }
}
