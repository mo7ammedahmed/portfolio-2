<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

class CV extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'cvs';

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'contact_info' => 'array',
        'experience' => 'array',
        'education' => 'array',
        'skills' => 'array',
        'certifications' => 'array',
        'languages' => 'array',
        'ats_scores' => 'array',
    ];

    /**
     * Get the user that owns the CV.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the portfolio account that owns the CV.
     */
    public function portfolioAccount()
    {
        return $this->user->portfolioAccount();
    }

    /**
     * Scope a query to only include CVs belonging to a user.
     */
    public function scopeForUser($query, $userId = null)
    {
        if ($userId === null) {
            $userId = Auth::id();
        }

        return $query->where('user_id', $userId);
    }
}
