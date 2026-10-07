<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Password;

class PortfolioLocalAccess extends Command
{
    protected $signature = 'portfolio:local-access {--owner= : Existing portfolio owner ID}';

    protected $description = 'Create a local password setup link without replacing credentials';

    public function handle(): int
    {
        if (! app()->environment('local')) {
            $this->error('This command is available only in the local environment.');

            return self::FAILURE;
        }

        $owner = User::query()->find($this->option('owner'));
        if (! $owner instanceof User || ! $owner->isPortfolioOwner()) {
            $this->error('Select an existing portfolio owner with --owner=ID.');

            return self::FAILURE;
        }

        $token = Password::broker()->createToken($owner);
        $this->info('Account: '.$owner->email);
        $this->line('Choose your password: '.route('password.reset', ['token' => $token, 'email' => $owner->email]));
        $this->comment('This private local link expires. No password was changed and no email was sent.');

        return self::SUCCESS;
    }
}
