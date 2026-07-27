<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\UserInvitationFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Override;

/**
 * @property int $id
 * @property int $owner_id
 * @property int $role_id
 * @property string $email
 * @property string $token_hash
 * @property Carbon $expires_at
 * @property Carbon|null $accepted_at
 */
#[Fillable(['owner_id', 'role_id', 'email', 'token_hash', 'expires_at', 'accepted_at'])]
#[Hidden(['token_hash'])]
class UserInvitation extends Model
{
    /** @use HasFactory<UserInvitationFactory> */
    use HasFactory;

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return BelongsTo<Role, $this> */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function isPending(): bool
    {
        return $this->accepted_at === null && $this->expires_at->isFuture();
    }

    public function tokenMatches(string $token): bool
    {
        return hash_equals($this->token_hash, hash('sha256', $token));
    }

    /**
     * @return array<string, string>
     */
    #[Override]
    protected function casts(): array
    {
        return [
            'expires_at' => 'immutable_datetime',
            'accepted_at' => 'immutable_datetime',
        ];
    }
}
