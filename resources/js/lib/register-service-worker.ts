export function registerServiceWorker(): void {
    if (
        !import.meta.env.PROD ||
        !('serviceWorker' in navigator) ||
        (window.location.protocol === 'http:' &&
            window.location.hostname !== 'localhost' &&
            window.location.hostname !== '127.0.0.1')
    ) {
        return;
    }

    window.addEventListener('load', () => {
        void navigator.serviceWorker.register('/sw.js').then((registration) => {
            window.setInterval(
                () => void registration.update(),
                60 * 60 * 1000,
            );
        });
    });
}
