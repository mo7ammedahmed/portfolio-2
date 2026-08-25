<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Enums\PortfolioPermission;
use Override;

class UpdateProfileRequest extends StoreProfileRequest
{
    #[Override]
    public function authorize(): bool
    {
        return $this->user()?->hasPortfolioPermission(
            PortfolioPermission::ManageProfile,
        ) ?? false;
    }
}
