<?php

declare(strict_types=1);

namespace App\Actions;

use App\Models\ContactMessage;
use App\Models\Profile;
use Illuminate\Support\Str;

class RenderContactEmailTemplate
{
    public function handle(
        string $template,
        Profile $profile,
        ContactMessage $message,
    ): string {
        return Str::replace(
            [
                '{name}',
                '{email}',
                '{subject}',
                '{message}',
                '{portfolio_name}',
                '{portfolio_email}',
            ],
            [
                $message->name,
                $message->email,
                $message->subject,
                $message->message,
                $profile->name_en,
                $profile->email,
            ],
            $template,
        );
    }

    public function subject(
        string $template,
        Profile $profile,
        ContactMessage $message,
    ): string {
        return Str::of($this->handle($template, $profile, $message))
            ->replaceMatches('/[\r\n]+/', ' ')
            ->squish()
            ->limit(255)
            ->toString();
    }
}
