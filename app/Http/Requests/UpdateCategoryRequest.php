<?php

declare(strict_types=1);

namespace App\Http\Requests;

use App\Models\Category;
use Override;

class UpdateCategoryRequest extends StoreCategoryRequest
{
    #[Override]
    public function authorize(): bool
    {
        $category = $this->route('category');

        return $category instanceof Category
            && ($this->user()?->can('update', $category) ?? false);
    }
}
