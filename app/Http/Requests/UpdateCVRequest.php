<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\CV;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateCVRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('update', CV::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $this->user()?->portfolioOwnerId();

        return [
            'title' => ['required', 'string', 'max:200'],
            'summary' => ['nullable', 'string'],
            'contact_info.email' => ['nullable', 'email', 'max:255'],
            'contact_info.phone' => ['nullable', 'string', 'max:20'],
            'contact_info.location' => ['nullable', 'string', 'max:255'],
            'contact_info.linkedin' => ['nullable', 'url', 'max:500'],
            'contact_info.github' => ['nullable', 'url', 'max:500'],
            'contact_info.website' => ['nullable', 'url', 'max:500'],
            'experience' => ['nullable', 'array'],
            'experience.*' => ['array'],
            'experience.*.title' => ['nullable', 'string', 'max:255'],
            'experience.*.company' => ['nullable', 'string', 'max:255'],
            'experience.*.location' => ['nullable', 'string', 'max:255'],
            'experience.*.start_date' => ['nullable', 'date'],
            'experience.*.end_date' => ['nullable', 'date'],
            'experience.*.current' => ['nullable', 'boolean'],
            'experience.*.description' => ['nullable', 'string'],
            'education' => ['nullable', 'array'],
            'education.*' => ['array'],
            'education.*.institution' => ['nullable', 'string', 'max:255'],
            'education.*.degree' => ['nullable', 'string', 'max:255'],
            'education.*.field_of_study' => ['nullable', 'string', 'max:255'],
            'education.*.start_date' => ['nullable', 'date'],
            'education.*.end_date' => ['nullable', 'date'],
            'education.*.current' => ['nullable', 'boolean'],
            'education.*.description' => ['nullable', 'string'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['array'],
            'skills.*.name' => ['nullable', 'string', 'max:255'],
            'skills.*.proficiency' => ['nullable', 'integer', 'min:1', 'max:5'],
            'skills.*.years_experience' => ['nullable', 'integer', 'min:0'],
            'certifications' => ['nullable', 'array'],
            'certifications.*' => ['array'],
            'certifications.*.name' => ['nullable', 'string', 'max:255'],
            'certifications.*.issuing_organization' => ['nullable', 'string', 'max:255'],
            'certifications.*.issue_date' => ['nullable', 'date'],
            'certifications.*.expiration_date' => ['nullable', 'date'],
            'certifications.*.credential_id' => ['nullable', 'string', 'max:255'],
            'certifications.*.credential_url' => ['nullable', 'url', 'max:500'],
            'languages' => ['nullable', 'array'],
            'languages.*' => ['array'],
            'languages.*.language' => ['nullable', 'string', 'max:100'],
            'languages.*.proficiency' => ['nullable', 'string', 'in:novice,intermediate,advanced,fluent,native'],
            'additional_sections' => ['nullable', 'string'],
        ];
    }
}
