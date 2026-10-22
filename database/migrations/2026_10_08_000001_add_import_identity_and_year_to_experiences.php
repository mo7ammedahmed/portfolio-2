<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('experiences', function (Blueprint $table): void {
            $table->string('seed_key')->nullable();
            $table->unique(['user_id', 'seed_key']);
            $table->unsignedSmallInteger('display_year')->nullable();
            $table->date('started_at')->nullable()->change();
        });
    }

    public function down(): void
    {
        // Keep nullable dates: unknown dates cannot safely be reconstructed.
        Schema::table('experiences', function (Blueprint $table): void {
            $table->dropUnique(['user_id', 'seed_key']);
            $table->dropColumn(['seed_key', 'display_year']);
        });
    }
};
