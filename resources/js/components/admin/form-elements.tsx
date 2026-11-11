import { cloneElement, isValidElement, useId } from 'react';
import type {
    InputHTMLAttributes,
    ReactNode,
    TextareaHTMLAttributes,
} from 'react';
import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function Field({
    label,
    error,
    hint,
    children,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    const generatedId = useId();
    const control = isValidElement<{ id?: string }>(children)
        ? cloneElement(children, { id: children.props.id ?? generatedId })
        : children;

    return (
        <div className="grid gap-2">
            <Label htmlFor={generatedId}>{label}</Label>
            {control}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            <InputError message={error} />
        </div>
    );
}

export function TextInput(
    props: InputHTMLAttributes<HTMLInputElement> & { error?: string },
) {
    const { error, className, ...rest } = props;

    return (
        <Input
            {...rest}
            aria-invalid={Boolean(error)}
            className={cn('bg-card', className)}
        />
    );
}

export function Textarea(
    props: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string },
) {
    const { error, className, ...rest } = props;

    return (
        <textarea
            {...rest}
            aria-invalid={Boolean(error)}
            className={cn(
                'min-h-28 w-full rounded-md border bg-card px-3 py-2 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 aria-invalid:border-destructive aria-invalid:ring-destructive/20',
                className,
            )}
        />
    );
}

export function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section className="studio-section mt-6 grid gap-6 rounded-xl border bg-card p-5 sm:p-7 lg:grid-cols-[14rem_minmax(0,1fr)]">
            <div className="lg:sticky lg:top-6 lg:self-start">
                <span
                    aria-hidden
                    className="studio-section-index studio-pill is-accent mb-3 font-mono tracking-[0.12em]"
                />
                <h2 className="font-editorial text-2xl">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {description}
                </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">{children}</div>
        </section>
    );
}
