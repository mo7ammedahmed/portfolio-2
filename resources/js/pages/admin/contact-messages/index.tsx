import { Head, Link, router } from '@inertiajs/react';
import { Inbox, Trash2 } from 'lucide-react';
import { PageHeading } from '@/components/admin/page-heading';
import { Button } from '@/components/ui/button';
import { destroy, index as messagesIndex } from '@/routes/portfolio/messages';

type Message = {
    id: number;
    name: string;
    message: string;
    created_at: string;
};

type PageLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Props = {
    messages: {
        data: Message[];
        links: PageLink[];
        total: number;
    } | null;
};

export default function ContactMessages({ messages }: Props) {
    const items = messages?.data ?? [];

    return (
        <>
            <Head title="Contact messages" />
            <PageHeading
                eyebrow="Inbox"
                title="Contact messages"
                description="Messages sent from the public portfolio contact form."
            />

            {items.length === 0 ? (
                <div className="mt-10 grid min-h-72 place-items-center rounded-2xl border border-dashed bg-card p-8 text-center">
                    <div>
                        <Inbox className="mx-auto size-8 text-highlight" />
                        <h2 className="mt-4 text-xl font-semibold">
                            No messages yet
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            New portfolio enquiries will appear here.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="mt-10 grid gap-4">
                    <p className="text-sm text-muted-foreground">
                        {messages?.total} total messages
                    </p>
                    {items.map((message) => (
                        <article
                            key={message.id}
                            className="rounded-2xl border bg-card p-5 sm:p-6"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-semibold">
                                        {message.name}
                                    </h2>
                                    <time className="mt-1 block text-xs text-muted-foreground">
                                        {new Date(
                                            message.created_at,
                                        ).toLocaleString()}
                                    </time>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Delete message from ${message.name}`}
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                'Delete this message?',
                                            )
                                        ) {
                                            router.delete(
                                                destroy(message.id).url,
                                                { preserveScroll: true },
                                            );
                                        }
                                    }}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            </div>
                            <p className="mt-5 text-sm leading-7 whitespace-pre-wrap text-muted-foreground">
                                {message.message}
                            </p>
                        </article>
                    ))}
                    {(messages?.links.length ?? 0) > 3 && (
                        <nav
                            aria-label="Message pages"
                            className="flex flex-wrap gap-2 pt-4"
                        >
                            {messages?.links.map((link) =>
                                link.url ? (
                                    <Button
                                        key={link.label}
                                        variant={
                                            link.active ? 'default' : 'outline'
                                        }
                                        size="sm"
                                        asChild
                                    >
                                        <Link
                                            href={link.url}
                                            preserveScroll
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    </Button>
                                ) : null,
                            )}
                        </nav>
                    )}
                </div>
            )}
        </>
    );
}

ContactMessages.layout = {
    breadcrumbs: [{ title: 'Messages', href: messagesIndex() }],
};
