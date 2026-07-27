<?php

declare(strict_types=1);

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\PortfolioPermission;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Override;

/**
 * @property int $id
 * @property int|null $owner_id
 * @property int|null $role_id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['owner_id', 'role_id', 'name', 'email', 'email_verified_at', 'password'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(self::class, 'owner_id');
    }

    /** @return BelongsTo<Role, $this> */
    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    /** @return HasMany<User, $this> */
    public function teamMembers(): HasMany
    {
        return $this->hasMany(self::class, 'owner_id');
    }

    /** @return HasMany<Role, $this> */
    public function roles(): HasMany
    {
        return $this->hasMany(Role::class, 'owner_id');
    }

    /** @return HasMany<UserInvitation, $this> */
    public function invitations(): HasMany
    {
        return $this->hasMany(UserInvitation::class, 'owner_id');
    }

    /** @return HasOne<Profile, $this> */
    public function profile(): HasOne
    {
        return $this->hasOne(Profile::class);
    }

    /** @return HasMany<Project, $this> */
    public function projects(): HasMany
    {
        return $this->hasMany(Project::class);
    }

    /** @return HasMany<Experience, $this> */
    public function experiences(): HasMany
    {
        return $this->hasMany(Experience::class);
    }

    /** @return HasMany<Category, $this> */
    public function categories(): HasMany
    {
        return $this->hasMany(Category::class);
    }

    /** @return HasMany<Skill, $this> */
    public function skills(): HasMany
    {
        return $this->hasMany(Skill::class);
    }

    public function isPortfolioOwner(): bool
    {
        return $this->owner_id === null;
    }

    public function portfolioOwnerId(): int
    {
        return $this->owner_id ?? $this->id;
    }

    public function portfolioAccount(): self
    {
        if ($this->isPortfolioOwner()) {
            return $this;
        }

        return $this->owner()->firstOrFail();
    }

    public function hasPortfolioPermission(PortfolioPermission|string $permission): bool
    {
        if ($this->isPortfolioOwner()) {
            return true;
        }

        $permissionValue = $permission instanceof PortfolioPermission
            ? $permission->value
            : $permission;

        return $this->role?->hasPermission($permissionValue) ?? false;
    }

    /**
     * @return list<string>
     */
    public function portfolioPermissions(): array
    {
        if ($this->isPortfolioOwner()) {
            return array_map(
                fn (PortfolioPermission $permission): string => $permission->value,
                PortfolioPermission::cases(),
            );
        }

        $role = $this->role;

        return $role === null ? [] : $role->permissions;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    #[Override]
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }
}
