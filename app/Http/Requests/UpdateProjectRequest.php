<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Project;
use Override;

class UpdateProjectRequest extends StoreProjectRequest
{
    #[Override]
    public function authorize(): bool
    {
        $project = $this->route('project');

        return $project instanceof Project
            && ($this->user()?->can('update', $project) ?? false);
    }
}
