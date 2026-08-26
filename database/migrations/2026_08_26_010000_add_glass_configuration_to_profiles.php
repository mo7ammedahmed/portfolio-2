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
            $table->decimal('glass_blur', 4, 2)->default(1.25)->after('glass_effect_enabled'); // e.g., 1.25 rem
            $table->decimal('glass_surface_opacity', 3, 2)->default(0.64)->after('glass_blur'); // 0-1
            $table->decimal('glass_border_opacity', 3, 2)->default(0.22)->after('glass_surface_opacity'); // 0-1
            $table->decimal('glass_saturation', 4, 2)->default(1.35)->after('glass_border_opacity'); // multiplier
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->dropColumn([
                'glass_blur',
                'glass_surface_opacity',
                'glass_border_opacity',
                'glass_saturation',
            ]);
        });
    }
};
