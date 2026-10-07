<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visitor_sessions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('profile_id')->constrained()->cascadeOnDelete();
            $table->uuid('session_uuid')->unique();
            $table->string('visitor_hash', 64)->index();
            $table->timestamp('started_at');
            $table->timestamp('last_seen_at');
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->unsignedInteger('page_views_count')->default(0);
            $table->string('landing_page', 500);
            $table->string('last_page', 500)->nullable();
            $table->text('referrer')->nullable();
            $table->string('utm_source')->nullable();
            $table->string('utm_medium')->nullable();
            $table->string('utm_campaign')->nullable();
            $table->string('browser', 80)->nullable();
            $table->string('platform', 80)->nullable();
            $table->string('device_type', 30)->nullable();
            $table->string('language', 20)->nullable();
            $table->string('timezone', 80)->nullable();
            $table->unsignedSmallInteger('screen_width')->nullable();
            $table->unsignedSmallInteger('screen_height')->nullable();
            $table->timestamps();

            $table->index(['profile_id', 'started_at']);
            $table->index(['profile_id', 'last_seen_at']);
        });

        Schema::create('page_views', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('visitor_session_id')->constrained()->cascadeOnDelete();
            $table->uuid('page_uuid')->unique();
            $table->string('path', 500)->index();
            $table->string('title')->nullable();
            $table->timestamp('entered_at');
            $table->timestamp('left_at')->nullable();
            $table->unsignedInteger('duration_seconds')->default(0);
            $table->timestamps();

            $table->index(['visitor_session_id', 'entered_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('page_views');
        Schema::dropIfExists('visitor_sessions');
    }
};
