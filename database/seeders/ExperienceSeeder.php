<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExperienceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $owner = User::query()->whereKey(config('portfolio.seed_owner_id'))->first();
        if (! $owner || ! $owner->isPortfolioOwner()) {
            throw new \RuntimeException('Set PORTFOLIO_SEED_OWNER_ID to an existing owner before seeding experiences.');
        }

        $this->seedFor($owner);
    }

    public function seedFor(User $owner): void
    {
        if (! $owner->isPortfolioOwner()) {
            throw new \RuntimeException('Experiences must belong to a portfolio owner.');
        }
        DB::transaction(function () use ($owner): void {
            foreach (require database_path('content/experiences.php') as $data) {
                if ($owner->experiences()->where('seed_key', $data['seed_key'])->exists()) {
                    continue;
                }
                $matches = $owner->experiences()->whereNull('seed_key')
                    ->where('company_en', $data['company_en'])->where('name_en', $data['name_en'])->get();
                if ($matches->count() > 1) {
                    throw new \RuntimeException('Ambiguous experience match: '.$data['seed_key']);
                }
                $experience = $matches->first() ?? $owner->experiences()->make();
                if (! $experience->exists) {
                    $attributes = $data;
                    unset($attributes['seed_key']);
                    $experience->fill($attributes);
                }
                $experience->seed_key = $data['seed_key'];
                $experience->save();
            }
        });
    }
}
