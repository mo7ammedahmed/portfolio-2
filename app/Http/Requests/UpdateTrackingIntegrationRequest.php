<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PortfolioPermission;
use App\Enums\TrackingInstallationMethod;
use App\Enums\TrackingPlatform;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class UpdateTrackingIntegrationRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        if (! $this->has('installation_method')) {
            $this->merge([
                'installation_method' => TrackingInstallationMethod::Managed->value,
            ]);
        }
    }

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
        $installationMethod = TrackingInstallationMethod::tryFrom(
            $this->string('installation_method')->toString(),
        );

        return [
            'installation_method' => [
                'required',
                Rule::enum(TrackingInstallationMethod::class),
            ],
            'tracking_id' => [
                Rule::requiredIf(
                    $installationMethod === TrackingInstallationMethod::Managed,
                ),
                'nullable',
                'string',
                'max:255',
                ...($trackingPlatform
                    && $installationMethod === TrackingInstallationMethod::Managed
                    ? ['regex:'.$trackingPlatform->validationPattern()]
                    : []),
            ],
            'head_code' => [
                Rule::requiredIf(
                    $installationMethod === TrackingInstallationMethod::Custom,
                ),
                'nullable',
                'string',
                'max:50000',
            ],
            'body_code' => [
                Rule::requiredIf(
                    $installationMethod === TrackingInstallationMethod::Custom
                    && $trackingPlatform?->hasBodyFallback(),
                ),
                'nullable',
                'string',
                'max:50000',
            ],
            'is_enabled' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $installationMethod = TrackingInstallationMethod::tryFrom(
                    $this->string('installation_method')->toString(),
                );

                if ($installationMethod !== TrackingInstallationMethod::Custom) {
                    return;
                }

                if (! $this->user()?->isPortfolioOwner()) {
                    $validator->errors()->add(
                        'installation_method',
                        'Only the portfolio owner can install custom tracking code.',
                    );

                    return;
                }

                $platform = $this->route('platform');
                $trackingPlatform = $platform instanceof TrackingPlatform
                    ? $platform
                    : TrackingPlatform::tryFrom((string) $platform);

                if (! $trackingPlatform) {
                    return;
                }

                if (! Str::contains(
                    $this->string('head_code')->toString(),
                    $trackingPlatform->headCodeMarker(),
                    true,
                )) {
                    $validator->errors()->add(
                        'head_code',
                        "Paste the official {$trackingPlatform->label()} head code.",
                    );
                }

                if ($this->usesUnsafeStringEvaluation(
                    $this->string('head_code')->toString(),
                )) {
                    $validator->errors()->add(
                        'head_code',
                        'This code uses unsafe string evaluation. Use provider code or a GTM Custom Template that does not require unsafe-eval.',
                    );
                }

                $bodyCodeMarker = $trackingPlatform->bodyCodeMarker();

                if ($bodyCodeMarker !== null
                    && ! Str::contains(
                        $this->string('body_code')->toString(),
                        $bodyCodeMarker,
                        true,
                    )) {
                    $validator->errors()->add(
                        'body_code',
                        "Paste the official {$trackingPlatform->label()} body fallback code.",
                    );
                }

                if ($this->usesUnsafeStringEvaluation(
                    $this->string('body_code')->toString(),
                )) {
                    $validator->errors()->add(
                        'body_code',
                        'This code uses unsafe string evaluation and cannot be installed.',
                    );
                }
            },
        ];
    }

    private function usesUnsafeStringEvaluation(string $code): bool
    {
        return Str::isMatch(
            '/\beval\s*\(|\bnew\s+Function\s*\(|\bset(?:Timeout|Interval)\s*\(\s*[\'\"]/i',
            $code,
        );
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tracking_id.regex' => 'Enter a valid tracking ID for this platform.',
            'head_code.max' => 'The head code may not exceed 50,000 characters.',
            'body_code.max' => 'The body code may not exceed 50,000 characters.',
        ];
    }
}
