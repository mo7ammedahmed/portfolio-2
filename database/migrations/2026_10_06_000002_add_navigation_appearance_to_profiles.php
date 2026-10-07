<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->string('nav_background', 7)->default('#0a0a0a');
            $table->string('nav_text', 7)->default('#f5f5f2');
            $table->string('nav_muted', 7)->default('#a1a1aa');
            $table->string('nav_active_background', 7)->default('#006c55');
            $table->string('nav_active_text', 7)->default('#ffffff');
            $table->string('nav_border', 7)->default('#383838');
            $table->boolean('nav_glass_enabled')->default(false);
            $table->decimal('nav_opacity', 3, 2)->default(0.72);
            $table->unsignedTinyInteger('nav_blur')->default(20);
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->dropColumn(['nav_background', 'nav_text', 'nav_muted', 'nav_active_background', 'nav_active_text', 'nav_border', 'nav_glass_enabled', 'nav_opacity', 'nav_blur']);
        });
    }
};
