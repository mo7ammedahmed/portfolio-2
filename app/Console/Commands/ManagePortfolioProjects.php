<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Http\Requests\StoreProjectRequest;
use App\Models\User;
use App\Services\SavePortfolioProject;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use RuntimeException;

class ManagePortfolioProjects extends Command
{
    protected $signature = 'portfolio:projects {action=list : list, show, create or update} {--owner= : Existing portfolio owner ID} {--project= : Project ID for show or update} {--data= : JSON object containing changed content fields} {--expected= : updated_at value from show, required for update} {--dry-run : Validate and preview without writing}';

    protected $description = 'Manage owner-scoped project content through trusted local or Cloud console access';

    public function handle(SavePortfolioProject $saver): int
    {
        try {
            $ownerId = $this->option('owner');
            $owner = is_string($ownerId) && ctype_digit($ownerId) ? User::find((int) $ownerId) : null;
            if (! $owner || ! $owner->isPortfolioOwner()) {
                throw new RuntimeException('Provide an existing portfolio owner with --owner.');
            }
            $action = $this->argument('action');
            if (! in_array($action, ['list', 'show', 'create', 'update'], true)) {
                throw new RuntimeException('Supported actions: list, show, create, update.');
            }
            $fields = ['id', 'slug', 'name_ar', 'name_en', 'description_ar', 'description_en', 'role_ar', 'role_en', 'challenge_ar', 'challenge_en', 'solution_ar', 'solution_en', 'outcomes_ar', 'outcomes_en', 'status', 'url', 'repository_url', 'repositories', 'is_visible', 'is_featured', 'sort_order', 'updated_at'];
            if ($action === 'list') {
                $this->line($owner->projects()->orderBy('sort_order')->get($fields)->toJson(JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

                return self::SUCCESS;
            }
            DB::transaction(function () use ($owner, $action, $fields, $saver): void {
                $project = $action === 'create' ? null : $owner->projects()->whereKey($this->option('project'))->lockForUpdate()->firstOrFail();
                if ($action === 'show') {
                    $this->line(json_encode($project?->only($fields), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR));

                    return;
                }
                if ($project && $this->option('expected') !== $project->updated_at?->toISOString()) {
                    throw new RuntimeException('Project changed or --expected is missing. Read show again and use its updated_at value.');
                }
                $json = $this->option('data');
                $changes = is_string($json) ? json_decode($json, true, 32, JSON_THROW_ON_ERROR) : null;
                if (! is_array($changes) || array_is_list($changes)) {
                    throw new RuntimeException('--data must be a JSON object.');
                }
                $allowed = array_diff($fields, ['id', 'slug', 'updated_at']);
                if (array_diff(array_keys($changes), $allowed)) {
                    throw new RuntimeException('Unsupported fields. Only project text, links, status, visibility and ordering may be changed.');
                }
                $request = new StoreProjectRequest;
                $request->setUserResolver(fn () => $owner);
                $rules = array_filter($request->rules(), fn ($key) => in_array(explode('.', $key)[0], $allowed, true), ARRAY_FILTER_USE_KEY);
                $data = $project ? [...$project->only($allowed), ...$changes] : ['status' => 'in_progress', 'is_visible' => true, 'is_featured' => false, 'sort_order' => 0, ...$changes];
                if (($data['repositories'] ?? null) === null) {
                    $data['repositories'] = [];
                }
                $validated = Validator::make($data, $rules)->validate();
                $this->line(json_encode(['action' => $action, 'owner' => $owner->id, 'project' => $project?->id, 'changes' => $changes, 'dry_run' => (bool) $this->option('dry-run')], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR));
                if (! $this->option('dry-run')) {
                    $saved = $saver->save($owner, $validated, $project);
                    $this->info('Saved project '.$saved->id.'.');
                }
            });

            return self::SUCCESS;
        } catch (\Throwable $error) {
            $this->error($error->getMessage());

            return self::FAILURE;
        }
    }
}
