<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Category;
use App\Models\Project;
use App\Models\Skill;
use App\Services\SavePortfolioProject;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Project::class);

        $search = $request->string('search')->trim()->limit(100)->toString();
        $sort = in_array($request->string('sort')->toString(), ['name_en', 'created_at', 'sort_order'], true)
            ? $request->string('sort')->toString()
            : 'sort_order';
        $direction = $request->string('direction')->toString() === 'desc' ? 'desc' : 'asc';

        $projects = $request->user()->portfolioAccount()->projects()
            ->select([
                'id',
                'category_id',
                'name_ar',
                'name_en',
                'image',
                'url',
                'is_featured',
                'is_visible',
                'sort_order',
                'created_at',
            ])
            ->with('category:id,name_en,color')
            ->when($search, function (Builder $query) use ($search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('name_en', 'like', "%{$search}%")
                        ->orWhere('name_ar', 'like', "%{$search}%");
                });
            })
            ->orderBy($sort, $direction)
            ->orderBy('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (Project $project): array => [
                ...$project->only([
                    'slug', 'status', 'role_ar', 'role_en', 'challenge_ar', 'challenge_en',
                    'solution_ar', 'solution_en', 'outcomes_ar', 'outcomes_en',
                    'id',
                    'name_ar',
                    'name_en',
                    'url',
                    'is_featured',
                    'is_visible',
                    'sort_order',
                    'created_at',
                ]),
                'image_url' => $project->image
                    ? Storage::disk(config('filesystems.default'))->url($project->image)
                    : null,
                'category' => $project->category?->only(['id', 'name_en', 'color']),
            ]);

        return Inertia::render('admin/projects/index', [
            'projects' => $projects,
            'filters' => ['search' => $search, 'sort' => $sort, 'direction' => $direction],
        ]);
    }

    public function create(Request $request): Response
    {
        Gate::authorize('create', Project::class);

        return Inertia::render('admin/projects/form', [
            'project' => null,
            ...$this->formOptions($request),
        ]);
    }

    public function store(StoreProjectRequest $request): RedirectResponse
    {
        app(SavePortfolioProject::class)->save($request->user()->portfolioAccount(), $request->validated());

        return to_route('portfolio.projects.index')
            ->with('success', 'Project created.');
    }

    public function edit(Request $request, Project $project): Response
    {
        Gate::authorize('update', $project);

        $project->load(['skills:id', 'images']);

        return Inertia::render('admin/projects/form', [
            'project' => [
                ...$project->only([
                    'slug', 'status', 'role_ar', 'role_en', 'challenge_ar', 'challenge_en',
                    'solution_ar', 'solution_en', 'outcomes_ar', 'outcomes_en',
                    'id',
                    'category_id',
                    'name_ar',
                    'name_en',
                    'description_ar',
                    'description_en',
                    'url',
                    'repository_url',
                    'is_featured',
                    'is_visible',
                    'sort_order',
                ]),
                'gallery' => $project->images->map(fn ($image): array => [
                    'id' => $image->id, 'alt_ar' => $image->alt_ar, 'alt_en' => $image->alt_en, 'sort_order' => $image->sort_order,
                    'url' => Storage::disk(config('filesystems.default'))->url($image->path),
                ]),
                'skill_ids' => $project->skills->pluck('id')->all(),
                'image_url' => $project->image
                    ? Storage::disk(config('filesystems.default'))->url($project->image)
                    : null,
            ],
            ...$this->formOptions($request),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        app(SavePortfolioProject::class)->save($request->user()->portfolioAccount(), $request->validated(), $project);

        return to_route('portfolio.projects.index')
            ->with('success', 'Project updated.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('delete', $project);

        if ($project->image) {
            Storage::disk(config('filesystems.default'))->delete($project->image);
        }

        foreach ($project->images as $image) {
            Storage::disk(config('filesystems.default'))->delete($image->path);
        }
        $project->delete();

        return to_route('portfolio.projects.index')
            ->with('success', 'Project deleted.');
    }

    /**
     * @return array{
     *     categories: Collection<int, Category>,
     *     skills: Collection<int, Skill>
     * }
     */
    private function formOptions(Request $request): array
    {
        return [
            'categories' => $request->user()->portfolioAccount()->categories()
                ->orderBy('sort_order')
                ->get(['id', 'name_en']),
            'skills' => $request->user()->portfolioAccount()->skills()
                ->orderBy('sort_order')
                ->get(['id', 'name_en', 'group_en']),
        ];
    }
}
