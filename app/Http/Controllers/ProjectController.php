<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Category;
use App\Models\Project;
use App\Models\Skill;
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
                    ? Storage::disk('public')->url($project->image)
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
        $data = $request->safe()->except(['image', 'skill_ids']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('portfolio/projects', 'public');
        }

        $project = $request->user()->portfolioAccount()->projects()->create($data);
        $project->skills()->sync($request->validated('skill_ids', []));

        return to_route('portfolio.projects.index')
            ->with('success', 'Project created.');
    }

    public function edit(Request $request, Project $project): Response
    {
        Gate::authorize('update', $project);

        $project->load('skills:id');

        return Inertia::render('admin/projects/form', [
            'project' => [
                ...$project->only([
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
                'skill_ids' => $project->skills->pluck('id')->all(),
                'image_url' => $project->image
                    ? Storage::disk('public')->url($project->image)
                    : null,
            ],
            ...$this->formOptions($request),
        ]);
    }

    public function update(UpdateProjectRequest $request, Project $project): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'skill_ids']);

        if ($request->hasFile('image')) {
            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }

            $data['image'] = $request->file('image')->store('portfolio/projects', 'public');
        }

        $project->update($data);
        $project->skills()->sync($request->validated('skill_ids', []));

        return to_route('portfolio.projects.index')
            ->with('success', 'Project updated.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        Gate::authorize('delete', $project);

        if ($project->image) {
            Storage::disk('public')->delete($project->image);
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
