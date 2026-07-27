<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->string('theme_dark_background', 7)->default('#070707')->after('theme_accent');
            $table->string('theme_dark_surface', 7)->default('#0d0d0d')->after('theme_dark_background');
            $table->string('theme_dark_foreground', 7)->default('#f4f4f1')->after('theme_dark_surface');
            $table->string('theme_dark_muted', 7)->default('#a4a4a0')->after('theme_dark_foreground');
            $table->string('theme_light_background', 7)->default('#f4f3ee')->after('theme_dark_muted');
            $table->string('theme_light_surface', 7)->default('#ffffff')->after('theme_light_background');
            $table->string('theme_light_foreground', 7)->default('#0a0a0a')->after('theme_light_surface');
            $table->string('theme_light_muted', 7)->default('#686864')->after('theme_light_foreground');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->dropColumn([
                'theme_dark_background',
                'theme_dark_surface',
                'theme_dark_foreground',
                'theme_dark_muted',
                'theme_light_background',
                'theme_light_surface',
                'theme_light_foreground',
                'theme_light_muted',
            ]);
        });
    }
};
