import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    Inbox,
    Mail,
    Reply,
    Trash2,
    UserRound,
} from 'lucide-react';
import { PageHeading } from '@/components/admin/page-heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { destroy, index as messagesIndex } from '@/routes/portfolio/messages';

type Message = {
    id: number;
    name: string;
    email: string;
    subject: string;
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

function deleteMessage(message: Message): void {
    if (!window.confirm(`Delete “${message.subject}” from ${message.name}?`)) {
        return;
    }

    router.delete(destroy(message.id).url, { preserveScroll: true });
}

function paginationLabel(label: string): string {
    return label.replace('&laquo;', '←').replace('&raquo;', '→').trim();
}

export default function ContactMessages({ messages }: Props) {
    const items = messages?.data ?? [];

    return (
        <>
            <Head title="Contact messages" />
            <PageHeading
                eyebrow="Inbox"
                title="Contact messages"
                description="Review portfolio enquiries, open the full conversation, and reply from your email client."
            />

            {items.length === 0 ? (
                <div className="mt-10 grid min-h-72 place-items-center rounded-2xl border border-dashed bg-card p-8 text-center">
                    <div>
                        <span className="mx-auto grid size-14 place-items-center rounded-2xl border bg-background">
                            <Inbox className="size-6 text-highlight" />
                        </span>
                        <h2 className="mt-5 text-xl font-semibold">
                            Your inbox is clear
                        </h2>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                            New portfolio enquiries will appear here with the
                            sender, subject, and full message.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="mt-10">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Inbox className="size-4 text-highlight" />
                            <span>
                                {messages?.total}{' '}
                                {messages?.total === 1
                                    ? 'conversation'
                                    : 'conversations'}
                            </span>
                        </p>
                        <p className="hidden text-xs text-muted-foreground sm:block">
                            Select a message to read it
                        </p>
                    </div>

                    <div className="grid gap-3 xl:grid-cols-2">
                        {items.map((message) => (
                            <Dialog key={message.id}>
                                <article className="group relative flex min-w-0 items-stretch overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                                    <DialogTrigger asChild>
                                        <button
                                            type="button"
                                            className="flex min-w-0 flex-1 items-start gap-4 p-5 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:p-6"
                                        >
                                            <span className="grid size-11 shrink-0 place-items-center rounded-xl border bg-background font-editorial text-lg text-highlight">
                                                {message.name
                                                    .trim()
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-start justify-between gap-4">
                                                    <span className="min-w-0">
                                                        <span className="block truncate font-semibold">
                                                            {message.subject}
                                                        </span>
                                                        <span className="mt-1 block truncate text-xs text-muted-foreground">
                                                            {message.name} ·{' '}
                                                            {message.email}
                                                        </span>
                                                    </span>
                                                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-highlight" />
                                                </span>
                                                <span className="mt-4 line-clamp-2 block text-sm leading-6 text-muted-foreground">
                                                    {message.message}
                                                </span>
                                                <time className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <CalendarDays className="size-3.5" />
                                                    {new Date(
                                                        message.created_at,
                                                    ).toLocaleString()}
                                                </time>
                                            </span>
                                        </button>
                                    </DialogTrigger>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="m-3 shrink-0 self-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                        aria-label={`Delete message from ${message.name}`}
                                        onClick={() => deleteMessage(message)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </article>

                                <DialogContent className="max-h-[calc(100vh-2rem)] gap-0 overflow-y-auto p-0 sm:max-w-2xl">
                                    <div className="h-1.5 bg-primary" />
                                    <DialogHeader className="border-b p-6 pr-14 sm:p-8 sm:pr-16">
                                        <p className="text-xs font-semibold tracking-[0.16em] text-highlight uppercase">
                                            Contact enquiry
                                        </p>
                                        <DialogTitle className="font-editorial text-2xl leading-tight sm:text-3xl">
                                            {message.subject}
                                        </DialogTitle>
                                        <DialogDescription>
                                            Received from {message.name}
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="grid gap-6 p-6 sm:p-8">
                                        <dl className="grid gap-3 rounded-xl border bg-muted/30 p-4 sm:grid-cols-2">
                                            <div className="flex items-start gap-3">
                                                <UserRound className="mt-0.5 size-4 text-highlight" />
                                                <div className="min-w-0">
                                                    <dt className="text-xs text-muted-foreground">
                                                        Sender
                                                    </dt>
                                                    <dd className="mt-0.5 truncate text-sm font-medium">
                                                        {message.name}
                                                    </dd>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Mail className="mt-0.5 size-4 text-highlight" />
                                                <div className="min-w-0">
                                                    <dt className="text-xs text-muted-foreground">
                                                        Email
                                                    </dt>
                                                    <dd className="mt-0.5 truncate text-sm font-medium">
                                                        {message.email}
                                                    </dd>
                                                </div>
                                            </div>
                                        </dl>
                                        <div>
                                            <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                                                Message
                                            </p>
                                            <p className="mt-3 text-[15px] leading-7 whitespace-pre-wrap">
                                                {message.message}
                                            </p>
                                        </div>
                                    </div>

                                    <DialogFooter className="border-t bg-muted/20 p-6 sm:items-center sm:justify-between sm:p-8">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() =>
                                                deleteMessage(message)
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                            Delete
                                        </Button>
                                        <Button asChild>
                                            <a
                                                href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                                            >
                                                <Reply className="size-4" />
                                                Reply by email
                                            </a>
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>

                    {(messages?.links.length ?? 0) > 3 && (
                        <nav
                            aria-label="Message pages"
                            className="mt-8 flex flex-wrap gap-2"
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
                                        <Link href={link.url} preserveScroll>
                                            {paginationLabel(link.label)}
                                        </Link>
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
