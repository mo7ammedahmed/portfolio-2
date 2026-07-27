<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Http\Requests\StoreContactMessageRequest;
use App\Models\ContactMessage;
use App\Models\Profile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ContactMessageController extends Controller
{
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

        $profile->contactMessages()->create($request->validated());

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
