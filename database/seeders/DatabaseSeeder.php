<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\ImportPortfolioProjects;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // A local reset removes the owner as well as their projects.
        // Production and explicitly selected owners still use the strict importer.
        if (app()->environment('local') && ! config('portfolio.seed_owner_id')) {
            if (! User::query()->exists()) {
                $this->call(LocalPreviewSeeder::class);
            }

            $owner = User::query()->where('email', LocalPreviewSeeder::OWNER_EMAIL)->first();

            if (! $owner || ! $owner->isPortfolioOwner()) {
                throw new \RuntimeException('This local database already contains accounts. Set PORTFOLIO_SEED_OWNER_ID to the intended owner, or use portfolio:import --owner=ID.');
            }

            app(ImportPortfolioProjects::class)->run($owner, require database_path('content/projects.php'));

            return;
        }

        $this->call(ProjectSeeder::class);
    }
}
