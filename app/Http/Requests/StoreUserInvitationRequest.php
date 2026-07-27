<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Role;
use App\Models\UserInvitation;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Override;

class StoreUserInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', UserInvitation::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:254', Rule::unique('users', 'email')],
            'role_id' => [
                'required',
                'integer',
                Rule::exists(Role::class, 'id')->where(
                    fn (Builder $query): Builder => $query->where(
                        'owner_id',
                        $this->user()?->id,
                    ),
                ),
            ],
        ];
    }

    #[Override]
    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => mb_strtolower(trim((string) $this->input('email'))),
        ]);
    }
}
