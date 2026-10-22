<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class RepairPortfolioCovers extends Command
{
    protected $signature = 'portfolio:repair-covers {--owner=} {--dry-run}';

    protected $description = 'Restore missing seeded covers without replacing existing images or editorial content';

    public function handle(): int
    {
        try {
            $id = $this->option('owner');
            $owner = is_string($id) && ctype_digit($id) ? User::find((int) $id) : null;
            if (! $owner || ! $owner->isPortfolioOwner()) {
                throw new RuntimeException('Provide an existing portfolio owner with --owner.');
            }
            $disk = Storage::disk(config('filesystems.default'));
            foreach (require database_path('content/projects.php') as $item) {
                $project = $owner->projects()->where('seed_key', $item['seed_key'])->first();
                if (! $project || ! $item['cover'] || ($project->image && $disk->exists($project->image))) {
                    continue;
                }
                $source = realpath(base_path($item['cover']));
                $root = realpath(database_path('content/images'));
                if (! $source || ! $root || ! str_starts_with($source, $root.DIRECTORY_SEPARATOR) || ! @getimagesize($source)) {
                    throw new RuntimeException('Invalid bundled cover.');
                }
                $this->line(($this->option('dry-run') ? 'Would restore: ' : 'Restoring: ').$project->slug);
                if ($this->option('dry-run')) {
                    continue;
                }
                $target = 'portfolio/projects/'.$owner->id.'/'.$item['seed_key'].'-'.substr((string) hash_file('sha256', $source), 0, 16).'.jpg';
                $contents = file_get_contents($source);
                if ($contents === false) {
                    throw new RuntimeException('Could not read bundled cover.');
                }
                if (! $disk->exists($target) && ! $disk->put($target, $contents)) {
                    throw new RuntimeException('Could not store cover.');
                }
                $project->update(['image' => $target]);
            }

            return self::SUCCESS;
        } catch (\Throwable $error) {
            $this->error($error->getMessage());

            return self::FAILURE;
        }
    }
}
