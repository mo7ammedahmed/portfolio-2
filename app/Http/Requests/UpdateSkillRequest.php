<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Skill;
use Override;

class UpdateSkillRequest extends StoreSkillRequest
{
    #[Override]
    public function authorize(): bool
    {
        $skill = $this->route('skill');

        return $skill instanceof Skill
            && ($this->user()?->can('update', $skill) ?? false);
    }
}
