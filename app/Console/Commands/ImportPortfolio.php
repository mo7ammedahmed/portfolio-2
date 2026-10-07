<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use App\Services\ImportPortfolioProjects;
use Illuminate\Console\Command;

class ImportPortfolio extends Command
{
    protected $signature = 'portfolio:import {--owner= : Existing portfolio owner ID} {--dry-run : Validate and preview without writing} {--overwrite : Update seed-managed fields on existing projects}';

    protected $description = 'Import the six portfolio case studies without creating accounts or deleting content';

    public function handle(ImportPortfolioProjects $importer): int
    {
        $id = $this->option('owner');
        $owner = is_string($id) && ctype_digit($id) ? User::query()->find((int) $id) : null;
        if (! $owner || ! $owner->isPortfolioOwner()) {
            $this->error('Provide --owner with an existing portfolio owner ID.');

            return self::FAILURE;
        }
        try {
            $report = $importer->run($owner, require database_path('content/projects.php'), (bool) $this->option('dry-run'), (bool) $this->option('overwrite'));
            $this->table(['Project', 'Action'], $report);

            return self::SUCCESS;
        } catch (\Throwable $error) {
            $this->error($error->getMessage());

            return self::FAILURE;
        }
    }
}
