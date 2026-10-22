import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';

export type AnimationSettings = {
    animation_enabled?: boolean;
    animation_opacity?: number;
    animation_scale?: number;
    animation_cycles?: number;
    animation_pointer?: boolean;
    animation_mobile?: boolean;
};

type SceneProps = {
    accent: string;
    isDark: boolean;
    className?: string;
    scale?: number;
    cycles?: number;
    pointerEnabled?: boolean;
};

export function PublicAnimation({
    profile,
    className,
    ...props
}: SceneProps & { profile: AnimationSettings }) {
    const [Scene, setScene] = useState<ComponentType<SceneProps> | null>(null);
    const [mobile, setMobile] = useState(false);
    useEffect(() => {
        const query = matchMedia('(max-width: 767px)');
        const update = () => setMobile(query.matches);
        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);
    const enabled =
        profile.animation_enabled !== false &&
        !(mobile && profile.animation_mobile === false);
    useEffect(() => {
        if (!enabled) {
            return;
        }

        let active = true;
        void import('./three-deconstruction').then((module) => {
            if (active) {
                setScene(() => module.ThreeDeconstruction);
            }
        });

        return () => {
            active = false;
        };
    }, [enabled]);

    if (!enabled || !Scene) {
        return null;
    }

    return (
        <div
            aria-hidden="true"
            className={className ?? 'pointer-events-none fixed inset-0'}
            style={{ opacity: profile.animation_opacity ?? 0.85 }}
        >
            <Scene
                {...props}
                className="size-full"
                scale={profile.animation_scale ?? 1}
                cycles={profile.animation_cycles ?? 3}
                pointerEnabled={profile.animation_pointer ?? true}
            />
        </div>
    );
}
