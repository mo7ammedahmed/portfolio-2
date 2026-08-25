<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\PortfolioPermission;
use App\Models\ContactMessage;
use App\Models\User;

class ContactMessagePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPortfolioPermission(PortfolioPermission::ManageMessages);
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, ContactMessage $contactMessage): bool
    {
        return $this->ownsMessage($user, $contactMessage)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageMessages);
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, ContactMessage $contactMessage): bool
    {
        return $this->ownsMessage($user, $contactMessage)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageMessages);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, ContactMessage $contactMessage): bool
    {
        return $this->ownsMessage($user, $contactMessage)
            && $user->hasPortfolioPermission(PortfolioPermission::ManageMessages);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, ContactMessage $contactMessage): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, ContactMessage $contactMessage): bool
    {
        return false;
    }

    private function ownsMessage(User $user, ContactMessage $contactMessage): bool
    {
        return $contactMessage->profile->user_id === $user->portfolioOwnerId();
    }
}
