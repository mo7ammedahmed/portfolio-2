<?php

namespace Database\Factories;

use App\Models\Role;
use App\Models\User;
use App\Models\UserInvitation;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<UserInvitation>
 */
class UserInvitationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $token = Str::random(64);

        return [
            'owner_id' => User::factory(),
            'role_id' => fn (array $attributes): int => Role::factory()->create([
                'owner_id' => $attributes['owner_id'],
            ])->id,
            'email' => fake()->unique()->safeEmail(),
            'token_hash' => hash('sha256', $token),
            'expires_at' => now()->addDays(7),
            'accepted_at' => null,
        ];
    }
}
