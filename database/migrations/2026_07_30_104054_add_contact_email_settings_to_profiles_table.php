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
            $table->string('contact_notification_email', 254)->nullable()->after('email');
            $table->string('contact_notification_subject_template')
                ->default('New portfolio enquiry: {subject}')
                ->after('contact_notification_email');
            $table->text('contact_notification_body_template')->nullable()->after('contact_notification_subject_template');
            $table->boolean('contact_auto_reply_enabled')->default(true)->after('contact_notification_body_template');
            $table->string('contact_auto_reply_subject_template')
                ->default('Thanks for your message about {subject}')
                ->after('contact_auto_reply_enabled');
            $table->text('contact_auto_reply_body_template')->nullable()->after('contact_auto_reply_subject_template');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table): void {
            $table->dropColumn([
                'contact_notification_email',
                'contact_notification_subject_template',
                'contact_notification_body_template',
                'contact_auto_reply_enabled',
                'contact_auto_reply_subject_template',
                'contact_auto_reply_body_template',
            ]);
        });
    }
};
