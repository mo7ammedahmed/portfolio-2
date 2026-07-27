<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Experience;
use App\Models\Profile;
use App\Models\Project;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $user = User::create([
            'name' => 'Mohammed Ahmed',
            'email' => 'test@example.com',
            'password' => 'password',
        ]);

        Profile::query()->create([
            'user_id' => $user->id,
            'name_ar' => 'محمد أحمد',
            'name_en' => 'Mohammed Ahmed',
            'role_ar' => 'مطور برمجيات متكامل',
            'role_en' => 'Senior Full Stack Developer',
            'short_description_ar' => 'أحوّل أفكار الأعمال إلى منتجات رقمية سريعة، واضحة، وقابلة للتوسع.',
            'short_description_en' => 'I turn business ideas into fast, clear, and scalable digital products.',
            'description_ar' => 'مطور برمجيات متكامل بخبرة تزيد عن خمس سنوات في Laravel وReact وواجهات API. بنيت أكثر من عشرين منتجاً لفرق في السعودية والخليج، من منصات التسويق إلى متاجر التجارة الإلكترونية.',
            'description_en' => 'Full stack developer with 5+ years of experience across Laravel, React, and API architecture. I have delivered more than 20 products for teams across Saudi Arabia and the GCC, from high-conversion marketing platforms to dependable commerce systems.',
            'location_ar' => 'أبها، المملكة العربية السعودية',
            'location_en' => 'Abha, Saudi Arabia',
            'linkedin' => 'https://www.linkedin.com/in/mohammed-ahmed-181124264',
            'github' => 'https://github.com/mohammed-abozamel112',
            'whatsapp' => 'https://wa.me/966502057206',
            'mobile' => '+966 502 057 206',
            'email' => 'mohammed.abozamel112@gmail.com',
            'website' => 'https://mohammedahmed112.netlify.app',
            'is_available' => true,
            'is_visible' => true,
            'theme_accent' => '#d9ff43',
        ]);

        $categories = collect([
            ['name_ar' => 'منتجات الويب', 'name_en' => 'Web Products', 'color' => '#ff5b35'],
            ['name_ar' => 'تجارب التسويق', 'name_en' => 'Marketing Experiences', 'color' => '#1f6f78'],
            ['name_ar' => 'التجارة الإلكترونية', 'name_en' => 'E-commerce', 'color' => '#7857ff'],
        ])->map(fn (array $category, int $index): Category => Category::query()->create([
            'user_id' => $user->id,
            ...$category,
            'description_ar' => 'حلول مصممة لتحقيق أثر تجاري قابل للقياس.',
            'description_en' => 'Focused solutions designed for measurable business impact.',
            'is_visible' => true,
            'sort_order' => $index,
        ]));

        $skills = collect([
            ['PHP', 'بي إتش بي', 'Backend', 'الخلفية', 95],
            ['Laravel', 'لارافيل', 'Backend', 'الخلفية', 96],
            ['REST APIs', 'واجهات REST', 'Backend', 'الخلفية', 93],
            ['React', 'رياكت', 'Frontend', 'الواجهة', 92],
            ['TypeScript', 'تايب سكربت', 'Frontend', 'الواجهة', 89],
            ['Tailwind CSS', 'تايلويند', 'Frontend', 'الواجهة', 91],
            ['MySQL', 'ماي إس كيو إل', 'Data', 'البيانات', 90],
            ['AWS', 'أمازون ويب سيرفسز', 'Infrastructure', 'البنية التحتية', 82],
            ['WordPress', 'ووردبريس', 'Platforms', 'المنصات', 88],
        ])->map(fn (array $skill, int $index): Skill => Skill::query()->create([
            'user_id' => $user->id,
            'name_en' => $skill[0],
            'name_ar' => $skill[1],
            'group_en' => $skill[2],
            'group_ar' => $skill[3],
            'description_en' => 'Production experience delivering dependable client work.',
            'description_ar' => 'خبرة عملية في تسليم منتجات موثوقة للعملاء.',
            'proficiency' => $skill[4],
            'is_visible' => true,
            'sort_order' => $index,
        ]));

        $speedRocket = Project::query()->create([
            'user_id' => $user->id,
            'category_id' => $categories[0]->id,
            'name_ar' => 'سبيد روكيت',
            'name_en' => 'Speed Rocket',
            'description_ar' => 'منصة ويب سريعة أعيد تصميمها وهندستها لتحسين الوضوح والأداء، وخفّضت زمن تحميل الصفحات بنسبة 30٪.',
            'description_en' => 'A performance-led web platform redesigned and engineered for clarity, reducing page load time by 30%.',
            'url' => 'https://speed-rocket.netlify.app',
            'is_featured' => true,
            'is_visible' => true,
            'sort_order' => 0,
        ]);
        $speedRocket->skills()->sync($skills->whereIn('name_en', ['Laravel', 'React', 'Tailwind CSS'])->pluck('id'));

        $fidMarketing = Project::query()->create([
            'user_id' => $user->id,
            'category_id' => $categories[1]->id,
            'name_ar' => 'فيد للتسويق',
            'name_en' => 'FID Marketing',
            'description_ar' => 'تجربة تسويقية عربية متجاوبة بنت رحلة أوضح للعميل وساهمت في رفع العملاء المحتملين بنسبة 35٪.',
            'description_en' => 'A responsive Arabic marketing experience with a clearer customer journey that increased inbound leads by 35%.',
            'url' => 'https://teal-penguin-508269.hostingersite.com/ar',
            'is_featured' => true,
            'is_visible' => true,
            'sort_order' => 1,
        ]);
        $fidMarketing->skills()->sync($skills->whereIn('name_en', ['PHP', 'WordPress', 'Tailwind CSS'])->pluck('id'));

        collect([
            ['Full Stack Web Developer', 'مطور ويب متكامل', 'Fid Marketing', 'فيد للتسويق', '2025-01-01', null, true, 'Khamis Mushait', 'خميس مشيط'],
            ['Web Developer', 'مطور ويب', 'Future Voice', 'صوت المستقبل', '2024-05-01', '2024-12-31', false, 'Riyadh', 'الرياض'],
            ['Freelance Full Stack Developer', 'مطور برمجيات مستقل', 'Independent', 'عمل مستقل', '2019-01-01', '2024-04-30', false, 'Remote', 'عن بُعد'],
        ])->each(fn (array $item, int $index): Experience => Experience::query()->create([
            'user_id' => $user->id,
            'name_en' => $item[0],
            'name_ar' => $item[1],
            'company_en' => $item[2],
            'company_ar' => $item[3],
            'description_en' => 'Delivered full-stack applications, integrations, and polished web experiences focused on measurable outcomes.',
            'description_ar' => 'تطوير تطبيقات متكاملة وربط الأنظمة وصناعة تجارب ويب مصقولة تركّز على النتائج.',
            'started_at' => $item[4],
            'ended_at' => $item[5],
            'is_current' => $item[6],
            'location_en' => $item[7],
            'location_ar' => $item[8],
            'is_visible' => true,
            'sort_order' => $index,
        ]));
    }
}
