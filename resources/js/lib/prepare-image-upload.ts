const MAX_UPLOAD_BYTES = 1_800_000;
const SUPPORTED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
]);

const OUTPUT_QUALITIES = [0.86, 0.78, 0.7, 0.62, 0.54];
const MAX_DIMENSIONS = [2000, 1600, 1280, 1024];

type DecodedImage = {
    source: CanvasImageSource;
    width: number;
    height: number;
    dispose: () => void;
};

export async function prepareImageUpload(file: File): Promise<File> {
    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
        throw new Error('Choose a JPG, PNG, or WebP image.');
    }

    if (file.size <= MAX_UPLOAD_BYTES) {
        return file;
    }

    const image = await decodeImage(file);

    try {
        for (const maxDimension of MAX_DIMENSIONS) {
            const { width, height } = fitWithin(
                image.width,
                image.height,
                maxDimension,
            );
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
                throw new Error('This browser cannot prepare the image.');
            }

            canvas.width = width;
            canvas.height = height;
            context.drawImage(image.source, 0, 0, width, height);

            for (const quality of OUTPUT_QUALITIES) {
                const blob = await canvasToBlob(canvas, quality);

                if (blob.size <= MAX_UPLOAD_BYTES) {
                    return new File([blob], webpFilename(file.name), {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });
                }
            }
        }
    } finally {
        image.dispose();
    }

    throw new Error(
        'This image is too large to prepare. Choose a smaller photo.',
    );
}

async function decodeImage(file: File): Promise<DecodedImage> {
    if (typeof createImageBitmap === 'function') {
        const bitmap = await createImageBitmap(file, {
            imageOrientation: 'from-image',
        });

        return {
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            dispose: () => bitmap.close(),
        };
    }

    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    try {
        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve();
            image.onerror = () =>
                reject(new Error('The image cannot be read.'));
            image.src = objectUrl;
        });

        return {
            source: image,
            width: image.naturalWidth,
            height: image.naturalHeight,
            dispose: () => URL.revokeObjectURL(objectUrl),
        };
    } catch (error) {
        URL.revokeObjectURL(objectUrl);

        throw error;
    }
}

function fitWithin(width: number, height: number, maxDimension: number) {
    const scale = Math.min(1, maxDimension / Math.max(width, height));

    return {
        width: Math.max(1, Math.round(width * scale)),
        height: Math.max(1, Math.round(height * scale)),
    };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(
                        new Error('The optimized image could not be created.'),
                    );

                    return;
                }

                resolve(blob);
            },
            'image/webp',
            quality,
        );
    });
}

function webpFilename(filename: string) {
    const basename = filename.replace(/\.[^.]+$/, '') || 'portrait';

    return `${basename}.webp`;
}
