<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Experience;
use Override;

class UpdateExperienceRequest extends StoreExperienceRequest
{
    #[Override]
    public function authorize(): bool
    {
        $experience = $this->route('experience');

        return $experience instanceof Experience
            && ($this->user()?->can('update', $experience) ?? false);
    }
}
