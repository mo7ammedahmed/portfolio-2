<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CategoryController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Category::class);

        return Inertia::render('admin/categories/index', [
            'categories' => $request->user()->portfolioAccount()->categories()
                ->withCount('projects')
                ->orderBy('sort_order')
                ->paginate(12),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Category::class);

        return Inertia::render('admin/categories/form', ['category' => null]);
    }

    public function store(StoreCategoryRequest $request): RedirectResponse
    {
        $request->user()->portfolioAccount()->categories()->create(
            $request->validated(),
        );

        return to_route('portfolio.categories.index')
            ->with('success', 'Category created.');
    }

    public function edit(Category $category): Response
    {
        Gate::authorize('update', $category);

        return Inertia::render('admin/categories/form', [
            'category' => $category->only([
                'id',
                'name_ar',
                'name_en',
                'description_ar',
                'description_en',
                'color',
                'is_visible',
                'sort_order',
            ]),
        ]);
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category,
    ): RedirectResponse {
        $category->update($request->validated());

        return to_route('portfolio.categories.index')
            ->with('success', 'Category updated.');
    }

    public function destroy(Category $category): RedirectResponse
    {
        Gate::authorize('delete', $category);
        $category->delete();

        return to_route('portfolio.categories.index')
            ->with('success', 'Category deleted.');
    }
}
