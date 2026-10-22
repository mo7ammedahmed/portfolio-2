<!doctype html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>{{ $cv->title }} — CV</title>
    <style>
        body { font: 16px/1.6 system-ui, sans-serif; color: #172c26; max-width: 800px; margin: 40px auto; padding: 24px; }
        h1 { margin-bottom: 8px; } h2 { border-bottom: 1px solid #ccd6d2; padding-bottom: 6px; }
        article { break-inside: avoid; margin-bottom: 24px; } p { white-space: pre-line; overflow-wrap: anywhere; }
        button { padding: 12px 20px; cursor: pointer; }
        @media print { button { display: none; } body { margin: 0; padding: 0; max-width: none; } }
        @page { margin: 20mm; }
    </style>
</head>
<body>
    <button type="button" onclick="window.print()">Print / Save as PDF</button>
    <main dir="auto">
        <h1>{{ $cv->title }}</h1>
        @foreach ($cv->contact_info ?? [] as $value)
            @if (is_string($value) && filled($value)) <p>{{ $value }}</p> @endif
        @endforeach
        @if ($cv->summary) <h2>Summary</h2><p>{{ $cv->summary }}</p> @endif
        @foreach (['experience' => 'Experience', 'education' => 'Education', 'skills' => 'Skills', 'certifications' => 'Certifications', 'languages' => 'Languages'] as $field => $heading)
            @if (! empty($cv->$field))
                <section><h2>{{ $heading }}</h2>
                    @foreach ($cv->$field as $entry)
                        <article>
                            @foreach ($entry as $label => $value)
                                @if (is_scalar($value) && filled($value) && $label !== 'current')
                                    <p><strong>{{ ucfirst(str_replace('_', ' ', $label)) }}:</strong> {{ $value }}</p>
                                @endif
                            @endforeach
                            @if ($entry['current'] ?? false) <p>Present</p> @endif
                        </article>
                    @endforeach
                </section>
            @endif
        @endforeach
        @if ($cv->additional_sections) <h2>Additional information</h2><p>{{ $cv->additional_sections }}</p> @endif
    </main>
</body>
</html>
