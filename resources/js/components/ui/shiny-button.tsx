import type { ComponentProps } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ShinyButtonProps = ComponentProps<typeof Button> & { shiny?: boolean; intensity?: number };

export function ShinyButton({ className, shiny = true, intensity = 1, style, ...props }: ShinyButtonProps) {
    return <Button {...props} className={cn(shiny && 'transition-shadow hover:shadow-md motion-reduce:transition-none', className)} style={{ ...style, ...(shiny ? { boxShadow: `inset 0 0 ${Math.max(0, Math.min(intensity, 3)) * 10}px #ffffff18` } : {}) }} />;
}
