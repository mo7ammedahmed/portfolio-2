<?php

declare(strict_types=1);

namespace App\Models;

use App\Casts\CvArray;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string|null $summary
 * @property array<string, mixed>|null $contact_info
 * @property list<array<string, mixed>>|null $experience
 * @property list<array<string, mixed>>|null $education
 * @property list<array<string, mixed>>|null $skills
 * @property list<array<string, mixed>>|null $certifications
 * @property list<array<string, mixed>>|null $languages
 * @property string|null $additional_sections
 * @property array<string, int>|null $ats_scores
 * @property int $ats_total
 * @property Carbon|null $updated_at
 */
#[Table(name: 'cvs')]
#[Fillable(['title', 'summary', 'contact_info', 'experience', 'education', 'skills', 'certifications', 'languages', 'additional_sections', 'ats_scores', 'ats_total'])]
class CV extends Model
{
    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'contact_info' => CvArray::class,
        'experience' => CvArray::class,
        'education' => CvArray::class,
        'skills' => CvArray::class,
        'certifications' => CvArray::class,
        'languages' => CvArray::class,
        'ats_scores' => CvArray::class,
    ];

    /**
     * Get the user that owns the CV.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the portfolio account that owns the CV.
     */
    public function portfolioAccount(): User
    {
        return $this->user->portfolioAccount();
    }

    /**
     * Scope a query to only include CVs belonging to a user.
     *
     * @param  Builder<CV>  $query
     * @return Builder<CV>
     */
    public function scopeForUser(Builder $query, int|string|null $userId = null): Builder
    {
        if ($userId === null) {
            $userId = Auth::id();
        }

        return $query->where('user_id', $userId);
    }
}
