<?php

declare(strict_types=1);

use App\Casts\GradientCast;
use App\Models\Profile;

test('gradient cast returns hex string for plain color', function () {
    $cast = new GradientCast;
    $result = $cast->get(new Profile, 'theme_dark_accent', '#d9ff43', []);

    expect($result)->toBe('#d9ff43');
});

test('gradient cast returns array for valid gradient JSON', function () {
    $cast = new GradientCast;
    $gradientJson = json_encode([
        'type' => 'linear',
        'angle' => 90,
        'stops' => [
            ['color' => '#ff0000', 'position' => 0],
            ['color' => '#0000ff', 'position' => 100],
        ],
    ]);
    $result = $cast->get(new Profile, 'theme_dark_accent', $gradientJson, []);

    expect($result)->toBe([
        'type' => 'linear',
        'angle' => 90,
        'stops' => [
            ['color' => '#ff0000', 'position' => 0],
            ['color' => '#0000ff', 'position' => 100],
        ],
    ]);
});

test('gradient cast returns hex string for invalid JSON', function () {
    $cast = new GradientCast;
    $result = $cast->get(new Profile, 'theme_dark_accent', 'not-json', []);

    expect($result)->toBe('not-json');
});

test('gradient cast stores gradient array as JSON', function () {
    $cast = new GradientCast;
    $gradient = [
        'type' => 'radial',
        'angle' => 180,
        'stops' => [
            ['color' => '#ffffff', 'position' => 0],
            ['color' => '#000000', 'position' => 100],
        ],
    ];
    $result = $cast->set(new Profile, 'theme_dark_accent', $gradient, []);

    expect($result)->toBe(json_encode($gradient));
});

test('gradient cast stores hex string as-is', function () {
    $cast = new GradientCast;
    $result = $cast->set(new Profile, 'theme_dark_accent', '#d9ff43', []);

    expect($result)->toBe('#d9ff43');
});

test('profile validateGradient accepts valid hex', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    expect($method->invoke($profile, '#d9ff43'))->toBeTrue();
});

test('profile validateGradient rejects invalid hex', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    expect($method->invoke($profile, 'red'))->toBeFalse();
    expect($method->invoke($profile, '#ff'))->toBeFalse();
    expect($method->invoke($profile, '#d9ff43ff'))->toBeFalse();
});

test('profile validateGradient accepts valid linear gradient', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    $gradient = [
        'type' => 'linear',
        'angle' => 45,
        'stops' => [
            ['color' => '#ff0000', 'position' => 0],
            ['color' => '#0000ff', 'position' => 100],
        ],
    ];

    expect($method->invoke($profile, $gradient))->toBeTrue();
});

test('profile validateGradient accepts valid radial gradient', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    $gradient = [
        'type' => 'radial',
        'angle' => 0,
        'stops' => [
            ['color' => '#ffffff', 'position' => 0],
            ['color' => '#000000', 'position' => 100],
        ],
    ];

    expect($method->invoke($profile, $gradient))->toBeTrue();
});

test('profile validateGradient rejects gradient with invalid type', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    $gradient = [
        'type' => 'diagonal',
        'angle' => 45,
        'stops' => [
            ['color' => '#ff0000', 'position' => 0],
            ['color' => '#0000ff', 'position' => 100],
        ],
    ];

    expect($method->invoke($profile, $gradient))->toBeFalse();
});

test('profile validateGradient rejects gradient with out-of-range angle', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    $gradient = [
        'type' => 'linear',
        'angle' => 400,
        'stops' => [
            ['color' => '#ff0000', 'position' => 0],
            ['color' => '#0000ff', 'position' => 100],
        ],
    ];

    expect($method->invoke($profile, $gradient))->toBeFalse();
});

test('profile validateGradient rejects gradient with less than two stops', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    $gradient = [
        'type' => 'linear',
        'angle' => 0,
        'stops' => [
            ['color' => '#ff0000', 'position' => 0],
        ],
    ];

    expect($method->invoke($profile, $gradient))->toBeFalse();
});

test('profile validateGradient rejects gradient with invalid stop color', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    $gradient = [
        'type' => 'linear',
        'angle' => 0,
        'stops' => [
            ['color' => 'red', 'position' => 0],
            ['color' => '#0000ff', 'position' => 100],
        ],
    ];

    expect($method->invoke($profile, $gradient))->toBeFalse();
});

test('profile validateGradient rejects gradient with out-of-range stop position', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    $gradient = [
        'type' => 'linear',
        'angle' => 0,
        'stops' => [
            ['color' => '#ff0000', 'position' => -10],
            ['color' => '#0000ff', 'position' => 100],
        ],
    ];

    expect($method->invoke($profile, $gradient))->toBeFalse();
});

test('profile validateGradient rejects gradient with non-strictly-increasing positions', function () {
    $profile = new Profile;
    $reflection = new ReflectionClass($profile);
    $method = $reflection->getMethod('validateGradient');

    $gradient = [
        'type' => 'linear',
        'angle' => 0,
        'stops' => [
            ['color' => '#ff0000', 'position' => 50],
            ['color' => '#0000ff', 'position' => 50],
        ],
    ];

    expect($method->invoke($profile, $gradient))->toBeFalse();
});
