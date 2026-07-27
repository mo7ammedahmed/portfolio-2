<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->string('theme_default_mode', 5)
                ->default('dark')
                ->after('theme_light_muted');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->dropColumn('theme_default_mode');
        });
    }
};
