<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Actions\RenderContactEmailTemplate;
use App\Http\Requests\StoreContactMessageRequest;
use App\Mail\ContactMessageAutoReply;
use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use App\Models\Profile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
    public function __construct(
        private readonly RenderContactEmailTemplate $templateRenderer,
    ) {}

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', ContactMessage::class);

        $profile = $request->user()->portfolioAccount()->profile()->first();

        return Inertia::render('admin/contact-messages/index', [
            'messages' => $profile
                ? $profile->contactMessages()
                    ->latest()
                    ->paginate(20)
                    ->through(fn (ContactMessage $message): array => [
                        'id' => $message->id,
                        'name' => $message->name,
                        'email' => $message->email ?? '',
                        'subject' => $message->subject ?? 'No subject',
                        'message' => $message->message,
                        'created_at' => $message->created_at->toIso8601String(),
                    ])
                : null,
        ]);
    }

    public function store(StoreContactMessageRequest $request): RedirectResponse
    {
        $profile = Profile::query()
            ->where('is_visible', true)
            ->oldest()
            ->firstOrFail();

        $message = $profile->contactMessages()->create($request->validated());

        $notificationSubject = $this->templateRenderer->subject(
            $profile->contact_notification_subject_template
                ?: Profile::DEFAULT_NOTIFICATION_SUBJECT,
            $profile,
            $message,
        );
        $notificationBody = $this->templateRenderer->handle(
            $profile->contact_notification_body_template
                ?: Profile::DEFAULT_NOTIFICATION_BODY,
            $profile,
            $message,
        );

        Mail::to($profile->contact_notification_email ?: $profile->email)
            ->send(new ContactMessageReceived(
                subjectLine: $notificationSubject,
                body: $notificationBody,
                senderEmail: $message->email,
                senderName: $message->name,
            ));

        if ($profile->contact_auto_reply_enabled) {
            Mail::to($message->email)->send(new ContactMessageAutoReply(
                subjectLine: $this->templateRenderer->subject(
                    $profile->contact_auto_reply_subject_template
                        ?: Profile::DEFAULT_AUTO_REPLY_SUBJECT,
                    $profile,
                    $message,
                ),
                body: $this->templateRenderer->handle(
                    $profile->contact_auto_reply_body_template
                        ?: Profile::DEFAULT_AUTO_REPLY_BODY,
                    $profile,
                    $message,
                ),
                portfolioEmail: $profile->email,
                portfolioName: $profile->name_en,
            ));
        }

        return to_route('home')->with('success', 'Your message has been sent.');
    }

    public function destroy(ContactMessage $message): RedirectResponse
    {
        Gate::authorize('delete', $message);

        $message->delete();

        return to_route('portfolio.messages.index')
            ->with('success', 'Message deleted.');
    }
}
