<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
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
            'name_ar' => 'تطبيقات الويب',
            'name_en' => fake()->unique()->words(2, true),
            'description_ar' => 'منتجات رقمية مبنية للأعمال.',
            'description_en' => fake()->sentence(),
            'color' => fake()->randomElement(['#ff5b35', '#1f6f78', '#7857ff']),
            'is_visible' => true,
            'sort_order' => 0,
        ];
    }
}
