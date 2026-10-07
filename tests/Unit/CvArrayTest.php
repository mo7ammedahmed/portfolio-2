<?php

use App\Models\CV;

test('CV arrays support existing double encoded records and new native arrays', function () {
    $contact = ['email' => 'person@example.test'];
    $cv = new CV;
    $cv->setRawAttributes(['contact_info' => json_encode(json_encode($contact))]);
    expect($cv->contact_info)->toBe($contact);
    $cv->contact_info = $contact;
    expect(json_decode($cv->getAttributes()['contact_info'], true))->toBe($contact)
        ->and($cv->contact_info)->toBe($contact);
});
