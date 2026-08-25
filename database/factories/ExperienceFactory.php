<?php

namespace Database\Factories;

use App\Models\Experience;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Experience>
 */
class ExperienceFactory extends Factory
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
            'name_ar' => 'مطور برمجيات متكامل',
            'name_en' => 'Full Stack Developer',
            'company_ar' => 'شركة تقنية',
            'company_en' => fake()->company(),
            'description_ar' => 'بناء وتطوير منتجات رقمية عالية الجودة.',
            'description_en' => fake()->paragraph(),
            'location_ar' => 'السعودية',
            'location_en' => 'Saudi Arabia',
            'started_at' => now()->subYears(2)->startOfMonth(),
            'ended_at' => null,
            'is_current' => true,
            'is_visible' => true,
            'sort_order' => 0,
        ];
    }
}
