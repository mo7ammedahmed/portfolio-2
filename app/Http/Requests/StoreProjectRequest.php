<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Project;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreProjectRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if ($this->boolean('gallery_present') && ! $this->has('gallery')) {
            $this->merge(['gallery' => []]);
        }
        if ($this->boolean('skill_ids_present') && ! $this->has('skill_ids')) {
            $this->merge(['skill_ids' => []]);
        }
    }

    public function authorize(): bool
    {
        return $this->user()?->can('create', Project::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $userId = $this->user()?->portfolioOwnerId();

        return [
            'slug' => ['sometimes', 'required', 'string', 'max:160', 'regex:/^[a-z0-9-]+$/', Rule::unique('projects', 'slug')->ignore($this->route('project') instanceof Project ? $this->route('project')->id : null)],
            'status' => ['sometimes', 'required', Rule::in(['in_progress', 'completed'])],
            'role_ar' => ['nullable', 'string', 'max:5000'],
            'role_en' => ['nullable', 'string', 'max:5000'],
            'challenge_ar' => ['nullable', 'string', 'max:5000'],
            'challenge_en' => ['nullable', 'string', 'max:5000'],
            'solution_ar' => ['nullable', 'string', 'max:5000'],
            'solution_en' => ['nullable', 'string', 'max:5000'],
            'outcomes_ar' => ['nullable', 'string', 'max:5000'],
            'outcomes_en' => ['nullable', 'string', 'max:5000'],
            'gallery' => ['sometimes', 'array', 'max:12'],
            'gallery.*.id' => ['nullable', 'integer', 'distinct', Rule::exists('project_images', 'id')->where('project_id', $this->route('project') instanceof Project ? $this->route('project')->id : 0)],
            'gallery.*.file' => ['nullable', 'required_without:gallery.*.id', File::image()->max('6mb')],
            'gallery.*.alt_ar' => ['required', 'string', 'max:255'],
            'gallery.*.alt_en' => ['required', 'string', 'max:255'],
            'gallery.*.sort_order' => ['required', 'integer', 'min:0', 'max:10000'],
            'name_ar' => ['required', 'string', 'max:160'],
            'name_en' => ['required', 'string', 'max:160'],
            'description_ar' => ['required', 'string', 'max:5000'],
            'description_en' => ['required', 'string', 'max:5000'],
            'category_id' => [
                'nullable',
                Rule::exists('categories', 'id')->where(
                    fn (Builder $query): Builder => $query->where('user_id', $userId),
                ),
            ],
            'skill_ids' => ['array', 'max:20'],
            'skill_ids.*' => [
                'integer',
                'distinct',
                Rule::exists('skills', 'id')->where(
                    fn (Builder $query): Builder => $query->where('user_id', $userId),
                ),
            ],
            'image' => ['nullable', File::image()->max('6mb')],
            'url' => ['nullable', 'url:http,https', 'max:500'],
            'repository_url' => ['nullable', 'url:http,https', 'max:500'],
            'is_featured' => ['required', 'boolean'],
            'is_visible' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
