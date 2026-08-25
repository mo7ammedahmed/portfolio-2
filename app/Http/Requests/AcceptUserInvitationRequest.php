<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Concerns\PasswordValidationRules;
use App\Models\UserInvitation;
use Illuminate\Foundation\Http\FormRequest;

class AcceptUserInvitationRequest extends FormRequest
{
    use PasswordValidationRules;

    public function authorize(): bool
    {
        $invitation = $this->route('invitation');

        return $invitation instanceof UserInvitation
            && $invitation->isPending()
            && $invitation->tokenMatches((string) $this->input('token'));
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'token' => ['required', 'string', 'size:64'],
            'password' => $this->passwordRules(),
        ];
    }
}
