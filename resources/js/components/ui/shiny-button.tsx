import { useMotionValue, useTransform } from 'framer-motion';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { ButtonProps, buttonVariants } from '@/components/ui/button';

const shinyVariants = cva(
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-all',
    'duration-300',
    'hover:shadow-lg',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-offset-2',
    'disabled:opacity-50',
    'disabled:pointer-events-none',
    'overflow-hidden',
  ],
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-sm',
        lg: 'h-10 px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

type ShinyButtonProps = ButtonProps & {
  /**
   * Whether to enable the shiny/magnetic effect
   * @default true
   */
  shiny?: boolean;
  /**
   * Intensity of the magnetic effect
   * @default 1
   */
  intensity?: number;
};

export function ShinyButton({
  className,
  shiny = true,
  intensity = 1,
  ...props
}: ShinyButtonProps) {
  // Motion values for magnetic effect
  const magneticX = useMotionValue(0);
  const magneticY = useMotionValue(0);
  const magneticStrength = 15 * intensity;

  // Transform values for magnetic effect
  const magneticStyle = {
    transform: useTransform([magneticX, magneticY], ([x, y]) =>
      `translate(${x}px, ${y}px)`
    ),
  };

  // Perpetual micro-interaction: subtle pulse
  const pulseScale = useMotionValue(1);
  // In a real implementation, we'd animate this perpetually
  // For now, we'll use hover/tap states

  return (
    <button
      type={props.type}
      className={shinyVariants(props.variant, props.size, { className })}
      disabled={props.disabled}
      // Note: Actual magnetic effect would require mouse move listeners
      // This is a structural implementation showing the concept
      style={{
        ...magneticStyle,
        // Add perpetual pulse animation here
      }}
    >
      {props.children}
      {/* Shiny overlay effect */}
      {shiny && (
        <span
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden="true"
        >
          <span
            className="inset-0 rounded-md border border-white/10 bg-white/5 backdrop-blur-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
          />
        </span>
      )}
    </button>
  );
}