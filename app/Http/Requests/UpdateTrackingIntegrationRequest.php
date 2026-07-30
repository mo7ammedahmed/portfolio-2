<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PortfolioPermission;
use App\Enums\TrackingPlatform;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTrackingIntegrationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->hasPortfolioPermission(
            PortfolioPermission::ManageProfile,
        ) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $platform = $this->route('platform');
        $trackingPlatform = $platform instanceof TrackingPlatform
            ? $platform
            : TrackingPlatform::tryFrom((string) $platform);

        return [
            'tracking_id' => [
                'required',
                'string',
                'max:255',
                ...($trackingPlatform
                    ? ['regex:'.$trackingPlatform->validationPattern()]
                    : ['prohibited']),
            ],
            'is_enabled' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tracking_id.regex' => 'Enter a valid tracking ID for this platform.',
        ];
    }
}
