<?php

namespace Database\Seeders;

use App\Models\User;
use App\Services\ImportPortfolioProjects;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ownerId = config('portfolio.seed_owner_id');
        $owner = User::query()->whereKey($ownerId)->first();
        if (! $owner) {
            throw new \RuntimeException('Set PORTFOLIO_SEED_OWNER_ID to an existing owner, or use portfolio:import --owner=ID.');
        }
        app(ImportPortfolioProjects::class)->run($owner, require database_path('content/projects.php'));
    }
}
