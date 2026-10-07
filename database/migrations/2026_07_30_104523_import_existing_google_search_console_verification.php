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
        $profileId = DB::table('profiles')
            ->where('is_visible', true)
            ->oldest('id')
            ->value('id');

        if ($profileId) {
            DB::table('tracking_integrations')->insertOrIgnore([
                'profile_id' => $profileId,
                'platform' => 'google_search_console',
                'tracking_id' => 'MlBLjk8L0D-TBSquV-4PtBobRbjuJ1pl1PQVatc-wf4',
                'is_enabled' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('tracking_integrations')
            ->where('platform', 'google_search_console')
            ->where('tracking_id', 'MlBLjk8L0D-TBSquV-4PtBobRbjuJ1pl1PQVatc-wf4')
            ->delete();
    }
};
