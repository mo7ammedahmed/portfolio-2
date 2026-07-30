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
        Schema::table('tracking_integrations', function (Blueprint $table): void {
            $table->string('installation_method', 20)
                ->default('managed')
                ->after('tracking_id');
            $table->longText('head_code')->nullable()->after('installation_method');
            $table->longText('body_code')->nullable()->after('head_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tracking_integrations', function (Blueprint $table): void {
            $table->dropColumn([
                'installation_method',
                'head_code',
                'body_code',
            ]);
        });
    }
};
