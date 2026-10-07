<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table): void {
            $table->string('slug')->nullable()->unique();
            $table->string('seed_key')->nullable();
            $table->unique(['user_id', 'seed_key']);
            $table->string('status')->default('in_progress');
            foreach (['role', 'challenge', 'solution', 'outcomes'] as $field) {
                foreach (['ar', 'en'] as $locale) {
                    $table->text($field.'_'.$locale)->nullable();
                }
            }
        });
        DB::table('projects')->orderBy('id')->each(function (object $project): void {
            DB::table('projects')->where('id', $project->id)->update([
                'slug' => (Str::slug($project->name_en) ?: 'project').'-'.$project->id,
            ]);
        });
        Schema::create('project_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('project_id')->constrained()->cascadeOnDelete();
            $table->string('path');
            $table->string('alt_ar')->default('');
            $table->string('alt_en')->default('');
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_images');
        Schema::table('projects', function (Blueprint $table): void {
            $table->dropUnique(['user_id', 'seed_key']);
            $table->dropUnique(['slug']);
            $table->dropColumn(['slug', 'seed_key', 'status', 'role_ar', 'role_en', 'challenge_ar', 'challenge_en', 'solution_ar', 'solution_en', 'outcomes_ar', 'outcomes_en']);
        });
    }
};
