<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreSkillRequest;
use App\Http\Requests\UpdateSkillRequest;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class SkillController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Skill::class);

        return Inertia::render('admin/skills/index', [
            'skills' => $request->user()->portfolioAccount()->skills()
                ->orderBy('sort_order')
                ->paginate(15)
                ->through(fn (Skill $skill): array => [
                    ...$skill->only([
                        'id',
                        'name_ar',
                        'name_en',
                        'group_en',
                        'icon_key',
                        'proficiency',
                        'is_visible',
                        'sort_order',
                    ]),
                    'image_url' => $skill->image
                        ? Storage::disk('public')->url($skill->image)
                        : null,
                ]),
        ]);
    }

    public function create(): Response
    {
        Gate::authorize('create', Skill::class);

        return Inertia::render('admin/skills/form', ['skill' => null]);
    }

    public function store(StoreSkillRequest $request): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'remove_image']);
        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('portfolio/skills', 'public');

            if (! is_string($imagePath)) {
                return back()->withErrors([
                    'image' => 'The skill image could not be saved. Please try again.',
                ]);
            }

            $data['image'] = $imagePath;
        }

        try {
            $request->user()->portfolioAccount()->skills()->create($data);
        } catch (Throwable $exception) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }

            throw $exception;
        }

        return to_route('portfolio.skills.index')
            ->with('success', 'Skill created.');
    }

    public function edit(Skill $skill): Response
    {
        Gate::authorize('update', $skill);

        return Inertia::render('admin/skills/form', [
            'skill' => [
                ...$skill->only([
                    'id',
                    'name_ar',
                    'name_en',
                    'description_ar',
                    'description_en',
                    'group_ar',
                    'group_en',
                    'icon_key',
                    'proficiency',
                    'is_visible',
                    'sort_order',
                ]),
                'image_url' => $skill->image
                    ? Storage::disk('public')->url($skill->image)
                    : null,
            ],
        ]);
    }

    public function update(UpdateSkillRequest $request, Skill $skill): RedirectResponse
    {
        $data = $request->safe()->except(['image', 'remove_image']);
        $oldImagePath = $skill->image;
        $newImagePath = null;

        if ($request->hasFile('image')) {
            $newImagePath = $request->file('image')->store('portfolio/skills', 'public');

            if (! is_string($newImagePath)) {
                return back()->withErrors([
                    'image' => 'The skill image could not be saved. Please try again.',
                ]);
            }

            $data['image'] = $newImagePath;
        } elseif ($request->boolean('remove_image')) {
            $data['image'] = null;
        }

        try {
            $skill->update($data);
        } catch (Throwable $exception) {
            if ($newImagePath) {
                Storage::disk('public')->delete($newImagePath);
            }

            throw $exception;
        }

        if (
            $oldImagePath
            && $oldImagePath !== $newImagePath
            && ($newImagePath || $request->boolean('remove_image'))
        ) {
            Storage::disk('public')->delete($oldImagePath);
        }

        return to_route('portfolio.skills.index')
            ->with('success', 'Skill updated.');
    }

    public function destroy(Skill $skill): RedirectResponse
    {
        Gate::authorize('delete', $skill);

        if ($skill->image) {
            Storage::disk('public')->delete($skill->image);
        }

        $skill->delete();

        return to_route('portfolio.skills.index')
            ->with('success', 'Skill deleted.');
    }
}
