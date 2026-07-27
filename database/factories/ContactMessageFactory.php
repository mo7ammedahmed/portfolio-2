<?php

namespace Database\Factories;

use App\Models\ContactMessage;
use App\Models\Profile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ContactMessage>
 */
class ContactMessageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'profile_id' => Profile::factory(),
            'name' => fake()->name(),
            'message' => fake()->paragraph(),
        ];
    }
}
