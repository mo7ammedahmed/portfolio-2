<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->boolean('animation_enabled')->default(true);
            $table->float('animation_opacity')->default(0.85);
            $table->float('animation_scale')->default(1);
            $table->unsignedTinyInteger('animation_cycles')->default(3);
            $table->boolean('animation_pointer')->default(true);
            $table->boolean('animation_mobile')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->dropColumn(['animation_enabled', 'animation_opacity', 'animation_scale', 'animation_cycles', 'animation_pointer', 'animation_mobile']);
        });
    }
};
