<?php

declare(strict_types=1);

use App\Http\Controllers\AcceptUserInvitationController;
use App\Http\Controllers\AnalyticsCollectorController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ContactMessageController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\PortfolioAnalyticsController;
use App\Http\Controllers\PortfolioController;
use App\Http\Controllers\PortfolioDashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\PwaManifestController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\TeamController;
use App\Http\Controllers\TeamMemberController;
use App\Http\Controllers\UserInvitationController;
use Illuminate\Support\Facades\Route;

Route::get('/', PortfolioController::class)->name('home');
Route::post('contact', [ContactMessageController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('contact.store');
Route::get('manifest.webmanifest', PwaManifestController::class)->name('pwa.manifest');
Route::post('analytics/collect', AnalyticsCollectorController::class)
    ->middleware('throttle:120,1')
    ->name('analytics.collect');

Route::middleware('guest')->group(function () {
    Route::get('invitations/{invitation}/accept', [AcceptUserInvitationController::class, 'show'])
        ->name('invitations.accept');
    Route::post('invitations/{invitation}/accept', [AcceptUserInvitationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('invitations.accept.store');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', PortfolioDashboardController::class)->name('dashboard');

    Route::prefix('dashboard')->name('portfolio.')->group(function () {
        Route::get('team', TeamController::class)->name('team');
        Route::post('roles', [RoleController::class, 'store'])->name('roles.store');
        Route::put('roles/{role}', [RoleController::class, 'update'])->name('roles.update');
        Route::delete('roles/{role}', [RoleController::class, 'destroy'])->name('roles.destroy');
        Route::post('invitations', [UserInvitationController::class, 'store'])
            ->middleware('throttle:10,1')
            ->name('invitations.store');
        Route::delete('invitations/{invitation}', [UserInvitationController::class, 'destroy'])
            ->name('invitations.destroy');
        Route::put('team-members/{member}', [TeamMemberController::class, 'update'])
            ->name('team-members.update');
        Route::delete('team-members/{member}', [TeamMemberController::class, 'destroy'])
            ->name('team-members.destroy');
        Route::get('analytics', PortfolioAnalyticsController::class)->name('analytics');
        Route::resource('messages', ContactMessageController::class)
            ->only(['index', 'destroy']);
        Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::put('profile', [ProfileController::class, 'update'])->name('profile.update');

        Route::resource('projects', ProjectController::class)->except('show');
        Route::resource('experiences', ExperienceController::class)->except('show');
        Route::resource('categories', CategoryController::class)->except('show');
        Route::resource('skills', SkillController::class)->except('show');
    });
});

require __DIR__.'/settings.php';
