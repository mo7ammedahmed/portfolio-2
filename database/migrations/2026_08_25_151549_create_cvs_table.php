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
        Schema::create('cvs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('title'); // Professional title
            $table->text('summary')->nullable(); // Professional summary
            $table->json('contact_info')->nullable(); // Structured contact data
            $table->json('experience')->nullable(); // Array of experience objects
            $table->json('education')->nullable(); // Array of education objects
            $table->json('skills')->nullable(); // Array of skill objects
            $table->json('certifications')->nullable(); // Optional
            $table->json('languages')->nullable(); // Optional
            $table->text('additional_sections')->nullable(); // For custom sections
            $table->json('ats_scores')->nullable(); // Store individual criterion scores
            $table->integer('ats_total')->default(0); // Total score out of 100
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cvs');
    }
};
