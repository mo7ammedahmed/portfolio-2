<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->string('theme_dark_accent', 7)->default('#d9ff43')->after('theme_accent');
            $table->string('theme_light_accent', 7)->default('#006c55')->after('theme_dark_accent');
            $table->boolean('glass_effect_enabled')->default(false)->after('theme_light_muted');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->dropColumn([
                'theme_dark_accent',
                'theme_light_accent',
                'glass_effect_enabled',
            ]);
        });
    }
};
