<?php

use App\Models\ContactMessage;
use App\Models\Profile;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('a visitor can send a contact message', function () {
    $profile = Profile::factory()->create(['is_visible' => true]);

    $this->post(route('contact.store'), [
        'name' => 'Sara Ahmed',
        'message' => 'I would like to discuss a new platform.',
    ])->assertRedirect(route('home'));

    $this->assertDatabaseHas('contact_messages', [
        'profile_id' => $profile->id,
        'name' => 'Sara Ahmed',
        'message' => 'I would like to discuss a new platform.',
    ]);
});

test('contact messages require a name and message', function () {
    Profile::factory()->create(['is_visible' => true]);

    $this->post(route('contact.store'), [])
        ->assertSessionHasErrors(['name', 'message']);

    expect(ContactMessage::query()->count())->toBe(0);
});

test('the owner can view and delete their contact messages', function () {
    $user = User::factory()->create();
    $profile = Profile::factory()->for($user)->create();
    $message = ContactMessage::factory()->for($profile)->create();

    $this->actingAs($user)
        ->get(route('portfolio.messages.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page): Assert => $page
            ->component('admin/contact-messages/index')
            ->where('messages.data.0.name', $message->name));

    $this->actingAs($user)
        ->delete(route('portfolio.messages.destroy', $message))
        ->assertRedirect(route('portfolio.messages.index'));

    $this->assertDatabaseMissing('contact_messages', ['id' => $message->id]);
});

test('messages are isolated between portfolio owners', function () {
    $owner = User::factory()->create();
    $intruder = User::factory()->create();
    $message = ContactMessage::factory()
        ->for(Profile::factory()->for($owner))
        ->create();

    $this->actingAs($intruder)
        ->delete(route('portfolio.messages.destroy', $message))
        ->assertForbidden();
});
