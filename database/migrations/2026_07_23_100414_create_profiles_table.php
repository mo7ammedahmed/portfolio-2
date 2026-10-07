<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('name_ar');
            $table->string('name_en');
            $table->string('role_ar');
            $table->string('role_en');
            $table->string('short_description_ar', 500);
            $table->string('short_description_en', 500);
            $table->text('description_ar');
            $table->text('description_en');
            $table->string('image')->nullable();
            $table->string('logo')->nullable();
            $table->string('location_ar')->nullable();
            $table->string('location_en')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('github')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('mobile')->nullable();
            $table->string('email');
            $table->string('website')->nullable();
            $table->string('resume_url')->nullable();
            $table->boolean('is_available')->default(true);
            $table->boolean('is_visible')->default(true);
            $table->string('theme_accent', 7)->default('#d9ff43');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
