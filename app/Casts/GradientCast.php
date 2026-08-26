<?php

declare(strict_types=1);

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use JsonException;

/**
 * Cast gradient fields to either a string (hex) or an array representing gradient.
 */
class GradientCast implements CastsAttributes
{
    /**
     * Cast the given value.
     *
     * @param  Model  $model
     * @param  mixed  $value
     * @return array<string, mixed>|string
     */
    public function get($model, string $key, $value, array $attributes)
    {
        if (is_null($value)) {
            return null;
        }

        if (is_string($value)) {
            // Try to parse as JSON gradient; if valid gradient array, return it.
            $decoded = json_decode($value, true, 512);
            if (json_last_error() !== JSON_ERROR_NONE) {
                // Otherwise assume it's a hex color string.
                return $value;
            }
            if (! is_array($decoded)) {
                // Otherwise assume it's a hex color string.
                return $value;
            }
            // Validate gradient structure
            if ($this->isValidGradient($decoded)) {
                return $decoded;
            }

            // Otherwise assume it's a hex color string.
            return $value;
        }

        // If already an array (from eager loading or something), return as-is.
        return $value;
    }

    /**
     * Prepare the given value for storage.
     *
     * @param  Model  $model
     * @param  array|string  $value
     */
    public function set($model, string $key, $value, array $attributes): string
    {
        if (is_null($value)) {
            return null;
        }

        if (is_array($value)) {
            // Store gradient as JSON string.
            try {
                return json_encode($value, JSON_THROW_ON_ERROR);
            } catch (JsonException) {
                // Fallback to empty string?
                return '';
            }
        }

        // Assume it's a hex color string; store as-is.
        return (string) $value;
    }

    /**
     * Validate gradient array structure.
     */
    protected function isValidGradient(array $gradient): bool
    {
        if (! isset($gradient['type']) || ! in_array($gradient['type'], ['linear', 'radial'], true)) {
            return false;
        }

        if (! isset($gradient['angle']) || ! is_numeric($gradient['angle']) || $gradient['angle'] < 0 || $gradient['angle'] > 360) {
            return false;
        }

        if (! isset($gradient['stops']) || ! is_array($gradient['stops']) || count($gradient['stops']) < 2) {
            return false;
        }

        foreach ($gradient['stops'] as $stop) {
            if (! is_array($stop)
                || ! isset($stop['color']) || preg_match('/^#[0-9A-Fa-f]{6}$/', $stop['color']) !== 1
                || ! isset($stop['position']) || ! is_numeric($stop['position']) || $stop['position'] < 0 || $stop['position'] > 100
            ) {
                return false;
            }
        }

        $positions = collect($gradient['stops'])->pluck('position')->sort()->values();

        return $positions->every(fn ($pos, $key) => $key === 0 || $pos > $positions->get($key - 1));
    }
}
