<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Skill;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\File;

class StoreSkillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Skill::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $skill = $this->route('skill');

        return [
            'name_ar' => ['required', 'string', 'max:120'],
            'name_en' => [
                'required',
                'string',
                'max:120',
                Rule::unique('skills', 'name_en')
                    ->where(
                        fn (Builder $query): Builder => $query->where(
                            'user_id',
                            $this->user()?->portfolioOwnerId(),
                        ),
                    )
                    ->ignore($skill),
            ],
            'description_ar' => ['nullable', 'string', 'max:2000'],
            'description_en' => ['nullable', 'string', 'max:2000'],
            'group_ar' => ['nullable', 'string', 'max:120'],
            'group_en' => ['nullable', 'string', 'max:120'],
            'icon_key' => ['nullable', 'string', Rule::in(Skill::ICON_KEYS)],
            'image' => ['nullable', File::image()->max('2mb')],
            'remove_image' => ['sometimes', 'boolean'],
            'proficiency' => ['required', 'integer', 'between:1,100'],
            'is_visible' => ['required', 'boolean'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:10000'],
        ];
    }
}
