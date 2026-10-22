<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CV;

class CvCompleteness
{
    /** @return array<string, int> */
    public function scores(CV $cv): array
    {
        $contact = $cv->contact_info ?? [];
        $experience = collect($cv->experience ?? []);
        $checks = [
            'professional_title' => filled($cv->title),
            'summary' => filled($cv->summary),
            'email' => filled($contact['email'] ?? null),
            'phone' => filled($contact['phone'] ?? null),
            'location' => filled($contact['location'] ?? null),
            'skills' => collect($cv->skills ?? [])->contains(fn (array $item): bool => filled($item['name'] ?? null)),
            'work_experience' => $experience->contains(fn (array $item): bool => filled($item['title'] ?? null) && filled($item['company'] ?? null)),
            'experience_dates' => $experience->contains(fn (array $item): bool => filled($item['start_date'] ?? null) && (filled($item['end_date'] ?? null) || ($item['current'] ?? false))),
            'experience_descriptions' => $experience->contains(fn (array $item): bool => filled($item['description'] ?? null)),
            'education' => collect($cv->education ?? [])->contains(fn (array $item): bool => filled($item['institution'] ?? null) && filled($item['degree'] ?? null)),
        ];

        return array_map(fn (bool $complete): int => $complete ? 10 : 0, $checks);
    }
}
