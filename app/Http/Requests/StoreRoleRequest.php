<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PortfolioPermission;
use App\Models\Role;
use Illuminate\Database\Query\Builder;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Role::class) ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $role = $this->route('role');

        return [
            'name' => [
                'required',
                'string',
                'max:80',
                Rule::unique('roles', 'name')
                    ->where(
                        fn (Builder $query): Builder => $query->where(
                            'owner_id',
                            $this->user()?->id,
                        ),
                    )
                    ->ignore($role),
            ],
            'permissions' => ['required', 'array', 'min:1'],
            'permissions.*' => [
                'required',
                'string',
                'distinct',
                Rule::enum(PortfolioPermission::class),
            ],
        ];
    }
}
