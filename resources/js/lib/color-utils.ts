import type { Gradient } from '@/types';

/**
 * Compute a solid color from a value that is either a hex string or a Gradient object.
 * For gradients, returns the average of the stop colors (simple arithmetic mean of RGB).
 */
export function getSolidColor(value: string | Gradient): string {
    if (typeof value === 'string') {
        return value;
    }

    const stops = value.stops;

    if (stops.length === 0) {
        return '#000000';
    }

    let r = 0,
        g = 0,
        b = 0;

    for (const stop of stops) {
        const hex = stop.color.replace('#', '');
        r += parseInt(hex.substring(0, 2), 16);
        g += parseInt(hex.substring(2, 4), 16);
        b += parseInt(hex.substring(4, 6), 16);
    }

    const count = stops.length;
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);
    const toHex = (n: number) => n.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Convert a Gradient object to a CSS gradient string.
 */
export function gradientToCss(grad: Gradient): string {
    if (grad.type === 'linear') {
        return `linear-gradient(${grad.angle}deg, ${grad.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;
    }

    return `radial-gradient(${grad.stops.map((s) => `${s.color} ${s.position}%`).join(', ')})`;
}
