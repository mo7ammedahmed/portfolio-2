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
            // Change columns to text to accommodate JSON strings for gradients
            $table->text('theme_dark_accent')->change();
            $table->text('theme_light_accent')->change();
            $table->text('theme_dark_background')->change();
            $table->text('theme_dark_surface')->change();
            $table->text('theme_light_background')->change();
            $table->text('theme_light_surface')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert back to string(7) for backward compatibility if needed.
        // However, note that if gradient data exists, truncation may occur.
        Schema::table('profiles', function (Blueprint $table): void {
            $table->string('theme_dark_accent', 7)->change();
            $table->string('theme_light_accent', 7)->change();
            $table->string('theme_dark_background', 7)->change();
            $table->string('theme_dark_surface', 7)->change();
            $table->string('theme_light_background', 7)->change();
            $table->string('theme_light_surface', 7)->change();
        });
    }
};
