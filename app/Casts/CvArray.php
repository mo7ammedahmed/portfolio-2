<?php

declare(strict_types=1);

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;

/** @implements CastsAttributes<array<array-key, mixed>|null, array<array-key, mixed>|null> */
class CvArray implements CastsAttributes
{
    /** @return array<array-key, mixed>|null */
    public function get(Model $model, string $key, mixed $value, array $attributes): ?array
    {
        // Earlier saves encoded JSON before Eloquent encoded it a second time.
        for ($depth = 0; $depth < 2 && is_string($value); $depth++) {
            $value = json_decode($value, true);
        }

        return is_array($value) ? $value : null;
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        return $value === null ? null : json_encode($value, JSON_THROW_ON_ERROR);
    }
}
