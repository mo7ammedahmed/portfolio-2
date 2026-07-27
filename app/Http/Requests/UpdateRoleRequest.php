<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Role;
use Override;

class UpdateRoleRequest extends StoreRoleRequest
{
    #[Override]
    public function authorize(): bool
    {
        $role = $this->route('role');

        return $role instanceof Role
            && ($this->user()?->can('update', $role) ?? false);
    }
}
