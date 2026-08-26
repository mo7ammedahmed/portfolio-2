import { Save } from 'lucide-react';
import type { InertiaFormProps } from '@inertiajs/react';
import type { ReactElement } from 'react';
import { useId } from 'react';

type Props = {
    form: Pick<InertiaFormProps<Record<string, any>>, 'isDirty' | 'processing'>;
    onSubmit: () => void;
    className?: string;
};

export default function FloatingSaveButton({
    form,
    onSubmit,
    className,
}: Props): ReactElement | null {
    const id = useId();

    if (!form.isDirty) {
        return null;
    }

    return (
        <button
            type="button"
            id={id}
            onClick={onSubmit}
            disabled={form.processing}
            aria-label="Save changes"
            className={[
                'fixed bottom-4 left-1/2 -translate-x-1/2 z-50',
                'flex items-center gap-2 rounded-xl border',
                'bg-primary/90 px-4 py-2 text-xs font-semibold',
                'shadow-md backdrop-blur-md',
                'border-border/20 hover:bg-primary/80',
                'transition-all duration-200',
                'disabled:pointer-events-none disabled:opacity-50',
                className,
            ].join(' ')}
        >
            <Save className="size-4" />
            Save changes
        </button>
    );
}
