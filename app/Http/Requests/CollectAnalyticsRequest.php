<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CollectAnalyticsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'event' => ['required', Rule::in(['start', 'pageview', 'heartbeat', 'end'])],
            'session_id' => ['required', 'uuid'],
            'page_id' => ['required', 'uuid'],
            'path' => ['required', 'string', 'max:500', 'starts_with:/'],
            'title' => ['nullable', 'string', 'max:255'],
            'referrer' => ['nullable', 'url:http,https', 'max:2000'],
            'duration_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
            'page_duration_seconds' => ['nullable', 'integer', 'min:0', 'max:86400'],
            'language' => ['nullable', 'string', 'max:20'],
            'timezone' => ['nullable', 'string', 'max:80'],
            'screen_width' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'screen_height' => ['nullable', 'integer', 'min:1', 'max:65535'],
            'utm_source' => ['nullable', 'string', 'max:255'],
            'utm_medium' => ['nullable', 'string', 'max:255'],
            'utm_campaign' => ['nullable', 'string', 'max:255'],
        ];
    }
}
