<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LocalPreviewSeeder extends Seeder
{
    public const OWNER_EMAIL = 'mohammed.abozamel112@gmail.com';

    public function run(): void
    {
        if (! app()->environment('local')) {
            throw new \RuntimeException('LocalPreviewSeeder may only run locally.');
        }
        $owner = User::query()->firstOrCreate(['email' => self::OWNER_EMAIL], [
            'name' => 'Mohammed Ahmed', 'password' => Str::random(48),
        ]);
        if (! $owner->isPortfolioOwner()) {
            throw new \RuntimeException('The preview email belongs to a team member. Select an existing owner with portfolio:import --owner=ID.');
        }
        $owner->profile()->firstOrCreate([], [
            'name_ar' => 'محمد أحمد', 'name_en' => 'Mohammed Ahmed',
            'role_ar' => 'مطور ويب متكامل', 'role_en' => 'Full Stack Developer',
            'short_description_ar' => 'أطوّر أنظمة تعليمية ومواقع شركات، من الواجهة إلى منطق التطبيق.',
            'short_description_en' => 'I develop school platforms and business websites, from the interface to the application logic.',
            'description_ar' => 'أعمل على تطوير منتجات ويب تربط تجربة المستخدم بمتطلبات العمل. تشمل أعمالي منصات إدارة المدارس ومواقع الشركات وتطوير الواجهات الخلفية. أستخدم Laravel وReact وتقنيات الويب لبناء تجارب قابلة للإدارة والتطوير.',
            'description_en' => 'I develop web products that connect user experience with business requirements. My work includes school management platforms, company websites and backend development. I use Laravel, React and web technologies to build experiences that can be maintained and extended.',
            'location_ar' => 'أبها، المملكة العربية السعودية', 'location_en' => 'Abha, Saudi Arabia',
            'email' => 'mohammed.abozamel112@gmail.com',
            'github' => 'https://github.com/mo7ammedahmed',
            'linkedin' => 'https://www.linkedin.com/in/mohammed-ahmed-181124264',
            'website' => 'https://mohammedahmed.laravel.cloud/',
            'is_available' => true, 'is_visible' => true,
            'theme_dark_accent' => '#006c55', 'theme_light_accent' => '#006c55',
        ]);
        $this->command->info('Local preview owner ID: '.$owner->id.'. No login credentials were printed or replaced.');
        $this->command->info('To choose a login password, run: php artisan portfolio:local-access --owner='.$owner->id);
    }
}
