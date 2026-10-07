<?php

namespace Database\Factories;

use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Skill>
 */
class SkillFactory extends Factory
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
            'name_ar' => 'لارافيل',
            'name_en' => fake()->unique()->word(),
            'description_ar' => 'خبرة عملية في بناء منتجات قابلة للتوسع.',
            'description_en' => fake()->sentence(),
            'group_ar' => 'الخلفية',
            'group_en' => 'Backend',
            'proficiency' => fake()->numberBetween(70, 100),
            'is_visible' => true,
            'sort_order' => 0,
        ];
    }
}
