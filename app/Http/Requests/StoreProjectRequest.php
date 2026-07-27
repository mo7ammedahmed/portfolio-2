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
