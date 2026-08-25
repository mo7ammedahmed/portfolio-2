import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    useEffect(() => {
        const stopFlashListener = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (data) {
                toast[data.type](data.message);

                return;
            }

            if (flash?.success) {
                toast.success(flash.success);
            }
        });

        const stopNavigationListener = router.on('navigate', (event) => {
            const props = event.detail.page.props as {
                flash?: { success?: string | null };
            };

            if (props.flash?.success) {
                toast.success(props.flash.success);
            }
        });

        return () => {
            stopFlashListener();
            stopNavigationListener();
        };
    }, []);
}
