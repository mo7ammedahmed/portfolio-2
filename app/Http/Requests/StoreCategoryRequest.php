<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Category;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Category::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $category = $this->route('category');

        return [
            'name_ar' => ['required', 'string', 'max:120'],
            'name_en' => [
                'required',
                'string',
                'max:120',
                Rule::unique('categories', 'name_en')
                    ->where(
                        fn (Builder $query): Builder => $query->where(
                            'user_id',
                            $this->user()?->portfolioOwnerId(),
                        ),
                    )
                    ->ignore($category),
            ],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'description_en' => ['nullable', 'string', 'max:2000'],
            'color' => ['required', 'hex_color'],
            'is_visible' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
