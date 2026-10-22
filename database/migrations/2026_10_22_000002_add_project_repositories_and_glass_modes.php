<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->json('repositories')->nullable();
        });
        Schema::table('profiles', function (Blueprint $table): void {
            $table->boolean('glass_border_enabled')->default(true);
            $table->float('glass_light_opacity')->nullable();
            $table->float('glass_dark_opacity')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('projects', fn (Blueprint $table) => $table->dropColumn('repositories'));
        Schema::table('profiles', fn (Blueprint $table) => $table->dropColumn(['glass_border_enabled', 'glass_light_opacity', 'glass_dark_opacity']));
    }
};
