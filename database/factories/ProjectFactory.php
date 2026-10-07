<?php

namespace Database\Factories;

use App\Models\Project;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Project>
 */
class ProjectFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'category_id' => null,
            'name_ar' => 'منصة رقمية',
            'name_en' => fake()->unique()->words(3, true),
            'description_ar' => 'تجربة رقمية سريعة وموجهة لنتائج الأعمال.',
            'description_en' => fake()->paragraph(),
            'url' => fake()->url(),
            'repository_url' => null,
            'is_featured' => false,
            'is_visible' => true,
            'sort_order' => 0,
        ];
    }
}
