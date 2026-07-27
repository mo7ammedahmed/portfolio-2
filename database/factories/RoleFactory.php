<?php

namespace Database\Factories;

use App\Enums\PortfolioPermission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => fake()->unique()->jobTitle(),
            'permissions' => [
                PortfolioPermission::ManageProjects->value,
                PortfolioPermission::ManageSkills->value,
            ],
        ];
    }
}
