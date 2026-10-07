<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\TrackingIntegration;
use Illuminate\Database\Seeder;

class TrackingIntegrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $profile = Profile::query()->first();

        if ($profile) {
            TrackingIntegration::factory()->for($profile)->create();
        }
    }
}
