<?php

declare(strict_types=1);

namespace App\Notifications;

use App\Models\UserInvitation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserInvitationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public UserInvitation $invitation,
        public string $token,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $this->invitation->loadMissing('owner:id,name', 'role:id,name');

        return (new MailMessage)
            ->subject('You have been invited to manage a portfolio')
            ->greeting('You are invited')
            ->line(
                "{$this->invitation->owner->name} invited you to collaborate as {$this->invitation->role->name}.",
            )
            ->action(
                'Accept invitation',
                route('invitations.accept', [
                    'invitation' => $this->invitation,
                    'token' => $this->token,
                ]),
            )
            ->line('This invitation expires in 7 days. If you were not expecting it, no action is required.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [];
    }
}
