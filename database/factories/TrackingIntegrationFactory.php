<?php

declare(strict_types=1);

namespace Database\Factories;

use App\Enums\TrackingInstallationMethod;
use App\Enums\TrackingPlatform;
use App\Models\Profile;
use App\Models\TrackingIntegration;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TrackingIntegration>
 */
class TrackingIntegrationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'profile_id' => Profile::factory(),
            'platform' => TrackingPlatform::GoogleTag,
            'tracking_id' => 'G-'.strtoupper(fake()->bothify('##########')),
            'installation_method' => TrackingInstallationMethod::Managed,
            'head_code' => null,
            'body_code' => null,
            'is_enabled' => true,
        ];
    }
}
