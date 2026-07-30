<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('profiles')->update([
            'theme_dark_accent' => DB::raw('theme_accent'),
            'theme_light_accent' => DB::raw('theme_accent'),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {}
};
