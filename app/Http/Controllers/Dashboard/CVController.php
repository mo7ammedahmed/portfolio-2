<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCVRequest;
use App\Http\Requests\UpdateCVRequest;
use App\Models\CV;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
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

        $cv = $request->user()->cv; // Assuming we have a one-to-one relationship

        return Inertia::render('admin/cv/index', [
            'cv' => $cv ? [
                'id' => $cv->id,
                'title' => $cv->title,
                'ats_total' => $cv->ats_total,
                'ats_scores' => $cv->ats_scores,
                'updated_at' => $cv->updated_at,
            ] : null,
        ]);
    }

    /**
     * Show the form for creating a new CV.
     */
    public function create(Request $request): Response
    {
        Gate::authorize('create', CV::class);

        return Inertia::render('admin/cv/form', [
            'cv' => null,
        ]);
    }

    /**
     * Store a newly created CV in storage.
     */
    public function store(StoreCVRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['experience', 'education', 'skills', 'contact_info', 'certifications', 'languages']);

        // Handle JSON fields
        $contactInfo = $request->safe()->only([
            'email', 'phone', 'location', 'linkedin', 'github', 'website',
        ]);

        $data['contact_info'] = json_encode($contactInfo);
        $data['experience'] = json_encode($request->input('experience', []));
        $data['education'] = json_encode($request->input('education', []));
        $data['skills'] = json_encode($request->input('skills', []));
        $data['certifications'] = json_encode($request->input('certifications', []));
        $data['languages'] = json_encode($request->input('languages', []));

        $cv = $request->user()->cv()->create($data);

        // Calculate ATS scores
        $this->calculateATSScores($cv);

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
                'contact_info' => json_decode($cv->contact_info, true),
                'experience' => json_decode($cv->experience, true),
                'education' => json_decode($cv->education, true),
                'skills' => json_decode($cv->skills, true),
                'certifications' => json_decode($cv->certifications, true),
                'languages' => json_decode($cv->languages, true),
                'additional_sections' => $cv->additional_sections,
                'ats_scores' => json_decode($cv->ats_scores, true),
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

        $data = $request->safe()->except(['experience', 'education', 'skills', 'contact_info', 'certifications', 'languages']);

        // Handle JSON fields
        $contactInfo = $request->safe()->only([
            'email', 'phone', 'location', 'linkedin', 'github', 'website',
        ]);

        $data['contact_info'] = json_encode($contactInfo);
        $data['experience'] = json_encode($request->input('experience', []));
        $data['education'] = json_encode($request->input('education', []));
        $data['skills'] = json_encode($request->input('skills', []));
        $data['certifications'] = json_encode($request->input('certifications', []));
        $data['languages'] = json_encode($request->input('languages', []));

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

    /**
     * Calculate ATS scores for a CV.
     */
    protected function calculateATSScores(CV $cv): void
    {
        // This is a simplified version - in reality, this would be more complex
        $scores = [
            'contact_information' => $this->scoreContactInformation($cv),
            'keyword_optimization' => rand(7, 10), // Placeholder
            'standard_headings' => 10, // We enforce standard headings
            'file_format_compatibility' => 10, // Our format is ATS-friendly
            'skills_section_quality' => rand(7, 10), // Placeholder
            'work_experience_format' => rand(7, 10), // Placeholder
            'education_completeness' => rand(7, 10), // Placeholder
            'length_appropriateness' => rand(7, 10), // Placeholder
            'font_readability' => 10, // We control the output format
            'quantifiable_achievements' => rand(5, 10), // Placeholder
        ];

        $total = array_sum($scores);

        $cv->update([
            'ats_scores' => json_encode($scores),
            'ats_total' => $total,
        ]);
    }

    /**
     * Score contact information completeness.
     */
    protected function scoreContactInformation(CV $cv): int
    {
        $contactInfo = json_decode($cv->contact_info, true) ?? [];
        $requiredFields = ['email', 'phone', 'location'];
        $optionalFields = ['linkedin', 'github', 'website'];

        $score = 0;

        // Check required fields (6 points max)
        foreach ($requiredFields as $field) {
            if (! empty($contactInfo[$field])) {
                $score += 2;
            }
        }

        // Check optional fields (4 points max)
        foreach ($optionalFields as $field) {
            if (! empty($contactInfo[$field])) {
                $score += 1;
            }
        }

        return min($score, 10);
    }
}
