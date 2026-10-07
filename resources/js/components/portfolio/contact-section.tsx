import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import type { PortfolioProfile } from '@/types';
import { localized } from './public-layout';
import type { Locale } from './public-layout';

export function ContactSection({
    profile,
    locale,
    success,
}: {
    profile: PortfolioProfile;
    locale: Locale;
    success?: string | null;
}) {
    const ar = locale === 'ar';
    const form = useForm({ name: '', email: '', subject: '', message: '' });
    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => form.reset(),
        });
    };
    const fields = [
        { key: 'name', label: ar ? 'الاسم' : 'Name', type: 'text' },
        {
            key: 'email',
            label: ar ? 'البريد الإلكتروني' : 'Email',
            type: 'email',
        },
        { key: 'subject', label: ar ? 'الموضوع' : 'Subject', type: 'text' },
        {
            key: 'message',
            label: ar
                ? 'حدثني عن الفرصة أو المشروع'
                : 'Tell me about the opportunity or project',
            type: 'textarea',
        },
    ] as const;

    return (
        <section id="contact" className="folio-section folio-contact">
            <div>
                <p className="folio-kicker">
                    {ar ? 'لنبدأ محادثة' : 'Start a conversation'}
                </p>
                <h2>
                    {ar
                        ? 'لديك مشروع، أو فرصة للعمل معًا؟'
                        : 'A project in mind, or a role to discuss?'}
                </h2>
                <p>
                    {ar
                        ? 'يسعدني التعرف على احتياجك، سواء لبناء منتج أو للانضمام إلى فريقك.'
                        : 'I’d like to hear what you need, whether you’re building a product or growing your team.'}
                </p>
                <a
                    className="folio-contact-email"
                    href={`mailto:${profile.email}`}
                >
                    {profile.email}
                </a>
                <p>{localized(profile, 'location', locale)}</p>
                <div className="folio-actions">
                    {profile.github && (
                        <a
                            href={profile.github}
                            target="_blank"
                            rel="noreferrer"
                        >
                            GitHub
                        </a>
                    )}
                    {profile.linkedin && (
                        <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noreferrer"
                        >
                            LinkedIn
                        </a>
                    )}
                    {profile.whatsapp && (
                        <a
                            href={
                                profile.whatsapp.startsWith('http')
                                    ? profile.whatsapp
                                    : `https://wa.me/${profile.whatsapp.replace(/\D/g, '')}`
                            }
                            target="_blank"
                            rel="noreferrer"
                        >
                            WhatsApp
                        </a>
                    )}
                </div>
            </div>
            <form onSubmit={submit} className="folio-form">
                {success && (
                    <p role="status">
                        {ar
                            ? 'تم استلام رسالتك. شكرًا لتواصلك.'
                            : 'Your message has been received. Thank you for reaching out.'}
                    </p>
                )}
                {fields.map(({ key, label, type }) => (
                    <div key={key}>
                        <label htmlFor={`contact-${key}`}>{label}</label>
                        {type === 'textarea' ? (
                            <textarea
                                id={`contact-${key}`}
                                required
                                maxLength={5000}
                                rows={5}
                                value={form.data[key]}
                                onChange={(e) =>
                                    form.setData(key, e.target.value)
                                }
                                aria-invalid={Boolean(form.errors[key])}
                                aria-describedby={
                                    form.errors[key]
                                        ? `error-${key}`
                                        : undefined
                                }
                            />
                        ) : (
                            <input
                                id={`contact-${key}`}
                                type={type}
                                required
                                maxLength={
                                    key === 'name'
                                        ? 120
                                        : key === 'email'
                                          ? 254
                                          : 160
                                }
                                autoComplete={
                                    key === 'name'
                                        ? 'name'
                                        : key === 'email'
                                          ? 'email'
                                          : undefined
                                }
                                value={form.data[key]}
                                onChange={(e) =>
                                    form.setData(key, e.target.value)
                                }
                                aria-invalid={Boolean(form.errors[key])}
                                aria-describedby={
                                    form.errors[key]
                                        ? `error-${key}`
                                        : undefined
                                }
                            />
                        )}
                        {form.errors[key] && (
                            <p id={`error-${key}`} role="alert">
                                {form.errors[key]}
                            </p>
                        )}
                    </div>
                ))}
                <button className="folio-button" disabled={form.processing}>
                    {form.processing
                        ? ar
                            ? 'جارٍ الإرسال…'
                            : 'Sending…'
                        : ar
                          ? 'إرسال الرسالة'
                          : 'Send message'}
                </button>
            </form>
        </section>
    );
}
