<?php

declare(strict_types=1);

namespace App\Providers;

use App\Enums\PortfolioPermission;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Override;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    #[Override]
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
        $this->configurePortfolioPermissions();
        $this->configureValidationRules();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);
        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );
        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
        if (app()->isProduction()) {
            URL::forceScheme('https');
        }
    }

    private function configurePortfolioPermissions(): void
    {
        foreach (PortfolioPermission::cases() as $permission) {
            Gate::define(
                $permission->value,
                fn (User $user): bool => $user->hasPortfolioPermission($permission),
            );
        }
    }

    protected function configureValidationRules(): void
    {
        Validator::extend('hex_color', fn ($attribute, $value, $parameters, $validator) => is_string($value) && preg_match('/^#[0-9A-Fa-f]{6}$/', $value) === 1);

        Validator::extend('palette_color', function ($attribute, $value, $parameters, $validator) {
            // Accepts null? Not needed as fields are required.
            if (is_string($value)) {
                // Hex color validation
                return preg_match('/^#[0-9A-Fa-f]{6}$/', $value) === 1;
            }

            if (! is_array($value)) {
                return false;
            }

            if (! isset($value['type']) || ! in_array($value['type'], ['linear', 'radial'], true)) {
                return false;
            }

            if (! isset($value['angle']) || ! is_numeric($value['angle']) || $value['angle'] < 0 || $value['angle'] > 360) {
                return false;
            }

            if (! isset($value['stops']) || ! is_array($value['stops']) || count($value['stops']) < 2) {
                return false;
            }

            foreach ($value['stops'] as $stop) {
                if (! is_array($stop)
                    || ! isset($stop['color']) || preg_match('/^#[0-9A-Fa-f]{6}$/', $stop['color']) !== 1
                    || ! isset($stop['position']) || ! is_numeric($stop['position']) || $stop['position'] < 0 || $stop['position'] > 100
                ) {
                    return false;
                }
            }

            $positions = collect($value['stops'])->pluck('position')->sort()->values();

            return $positions->every(fn ($pos, $key) => $key === 0 || $pos > $positions->get($key - 1));
        });
    }
}
