import { useEffect, useRef } from 'react';
import {
    ACESFilmicToneMapping,
    AmbientLight,
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    Color,
    DirectionalLight,
    Euler,
    Group,
    IcosahedronGeometry,
    MathUtils,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    PointLight,
    Points,
    PointsMaterial,
    Scene,
    SRGBColorSpace,
    TorusGeometry,
    Vector3,
    WebGLRenderer,
} from 'three';

type ThreeDeconstructionProps = {
    accent: string;
    className?: string;
    isDark: boolean;
};

type ScenePart = {
    mesh: Mesh;
    origin: Vector3;
    destination: Vector3;
    originRotation: Euler;
    destinationRotation: Euler;
    drift: number;
};

const clamp = (value: number, minimum = 0, maximum = 1): number =>
    Math.min(maximum, Math.max(minimum, value));

const easeInOutCubic = (value: number): number =>
    value < 0.5
        ? 4 * value * value * value
        : 1 - Math.pow(-2 * value + 2, 3) / 2;

/**
 * A procedural Three.js sculpture whose parts transform across the whole page.
 * Everything is generated in code so the scene remains responsive and lightweight.
 */
export function ThreeDeconstruction({
    accent,
    className = '',
    isDark,
}: ThreeDeconstructionProps) {
    const hostRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = hostRef.current;

        if (!host) {
            return;
        }

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        const scene = new Scene();
        const camera = new PerspectiveCamera(38, 1, 0.1, 100);
        const renderer = new WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
        });

        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = SRGBColorSpace;
        renderer.toneMapping = ACESFilmicToneMapping;
        renderer.toneMappingExposure = isDark ? 1.1 : 0.92;
        host.appendChild(renderer.domElement);

        const sculpture = new Group();
        sculpture.rotation.z = -0.12;
        scene.add(sculpture);

        const accentColor = new Color(accent);
        const neutralColor = new Color(isDark ? '#f5f4ee' : '#242720');
        const mutedColor = new Color(isDark ? '#74786f' : '#8e9488');
        const partMaterial = new MeshStandardMaterial({
            color: neutralColor,
            roughness: 0.42,
            metalness: 0.58,
            transparent: true,
            opacity: isDark ? 0.62 : 0.34,
        });
        const accentMaterial = new MeshStandardMaterial({
            color: accentColor,
            emissive: accentColor,
            emissiveIntensity: isDark ? 0.24 : 0.08,
            roughness: 0.35,
            metalness: 0.4,
            transparent: true,
            opacity: 0.82,
        });
        const lineMaterial = new MeshBasicMaterial({
            color: accentColor,
            wireframe: true,
            transparent: true,
            opacity: isDark ? 0.28 : 0.18,
        });

        const parts: ScenePart[] = [];
        const partCount = window.innerWidth < 640 ? 7 : 12;

        for (let index = 0; index < partCount; index += 1) {
            const angle = (index / partCount) * Math.PI * 2;
            const radius = index % 3 === 0 ? 1.7 : 2.15;
            const height = 0.18 + (index % 4) * 0.08;
            const width = 0.78 + (index % 3) * 0.24;
            const depth = 0.06 + (index % 2) * 0.05;
            const geometry = new BoxGeometry(width, height, depth);
            const mesh = new Mesh(
                geometry,
                index % 5 === 0 ? accentMaterial : partMaterial,
            );
            const origin = new Vector3(
                Math.cos(angle) * radius,
                Math.sin(angle) * radius * 0.74,
                -0.7 + (index % 4) * 0.34,
            );
            const radialForce = 1.2 + (index % 4) * 0.38;
            const destination = origin
                .clone()
                .add(
                    new Vector3(
                        Math.cos(angle) * radialForce,
                        Math.sin(angle) * radialForce +
                            (index % 2 === 0 ? 0.5 : -0.45),
                        ((index % 3) - 1) * 1.15,
                    ),
                );
            const originRotation = new Euler(
                angle * 0.08,
                angle * 0.18,
                angle + Math.PI / 2,
            );
            const destinationRotation = new Euler(
                originRotation.x + (index % 2 === 0 ? 1.1 : -0.85),
                originRotation.y + 0.65 + index * 0.07,
                originRotation.z + (index % 2 === 0 ? 0.9 : -1.2),
            );

            mesh.position.copy(origin);
            mesh.rotation.copy(originRotation);
            sculpture.add(mesh);
            parts.push({
                mesh,
                origin,
                destination,
                originRotation,
                destinationRotation,
                drift: 0.25 + index * 0.045,
            });
        }

        const core = new Mesh(new IcosahedronGeometry(1.05, 1), lineMaterial);
        core.scale.set(0.85, 1.25, 0.85);
        sculpture.add(core);

        const orbitMaterial = new MeshBasicMaterial({
            color: mutedColor,
            wireframe: true,
            transparent: true,
            opacity: isDark ? 0.2 : 0.14,
        });
        const orbit = new Mesh(
            new TorusGeometry(2.8, 0.012, 4, 160),
            orbitMaterial,
        );
        orbit.rotation.x = Math.PI * 0.57;
        orbit.rotation.y = 0.4;
        sculpture.add(orbit);

        const pointCount = window.innerWidth < 640 ? 70 : 150;
        const pointPositions = new Float32Array(pointCount * 3);
        const pointOrigins = new Float32Array(pointCount * 3);

        for (let index = 0; index < pointCount; index += 1) {
            const stride = index * 3;
            const angle = index * 2.399963;
            const radius = 2.6 + ((index * 17) % 31) * 0.105;

            pointOrigins[stride] = Math.cos(angle) * radius;
            pointOrigins[stride + 1] =
                Math.sin(angle) * radius * 0.62 +
                (((index * 13) % 19) / 19 - 0.5);
            pointOrigins[stride + 2] = ((index * 29) % 41) / 8 - 2.5;
            pointPositions[stride] = pointOrigins[stride];
            pointPositions[stride + 1] = pointOrigins[stride + 1];
            pointPositions[stride + 2] = pointOrigins[stride + 2];
        }

        const pointGeometry = new BufferGeometry();
        pointGeometry.setAttribute(
            'position',
            new BufferAttribute(pointPositions, 3),
        );
        const pointMaterial = new PointsMaterial({
            color: accentColor,
            size: window.innerWidth < 640 ? 0.025 : 0.032,
            sizeAttenuation: true,
            transparent: true,
            opacity: isDark ? 0.58 : 0.38,
        });
        const points = new Points(pointGeometry, pointMaterial);
        scene.add(points);

        scene.add(new AmbientLight(0xffffff, isDark ? 0.9 : 1.35));
        const keyLight = new DirectionalLight(
            isDark ? 0xffffff : 0xdfe6d8,
            isDark ? 3.2 : 2.4,
        );
        keyLight.position.set(-3, 5, 6);
        scene.add(keyLight);
        const accentLight = new PointLight(accentColor, 7, 14, 2);
        accentLight.position.set(3.5, -1, 3);
        scene.add(accentLight);

        let targetProgress = 0;
        let currentProgress = 0;
        let frameId = 0;
        let visible = true;
        let pageVisible = !document.hidden;
        let elapsed = 0;
        let previousTime = performance.now();

        const updateScrollProgress = () => {
            if (reducedMotion.matches) {
                targetProgress = 0;

                return;
            }

            const travel = Math.max(
                document.documentElement.scrollHeight - window.innerHeight,
                1,
            );
            targetProgress = clamp(window.scrollY / travel);
        };

        const resize = () => {
            const { width, height } = host.getBoundingClientRect();

            if (width === 0 || height === 0) {
                return;
            }

            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.position.set(width < 720 ? 0 : 0.65, 0.05, 8.5);
            camera.updateProjectionMatrix();
        };

        const renderFrame = (time: number) => {
            const delta = Math.min((time - previousTime) / 1000, 0.05);
            previousTime = time;
            elapsed += delta;
            currentProgress +=
                (targetProgress - currentProgress) *
                (reducedMotion.matches ? 1 : 0.075);

            const deconstruction = Math.sin(currentProgress * Math.PI);
            const progress = easeInOutCubic(deconstruction);
            const idle = reducedMotion.matches ? 0 : elapsed;

            parts.forEach((part, index) => {
                part.mesh.position.lerpVectors(
                    part.origin,
                    part.destination,
                    progress,
                );
                part.mesh.position.y +=
                    Math.sin(idle * 0.45 + index) *
                    part.drift *
                    (1 - progress * 0.55);
                part.mesh.rotation.set(
                    MathUtils.lerp(
                        part.originRotation.x,
                        part.destinationRotation.x,
                        progress,
                    ),
                    MathUtils.lerp(
                        part.originRotation.y,
                        part.destinationRotation.y,
                        progress,
                    ),
                    MathUtils.lerp(
                        part.originRotation.z,
                        part.destinationRotation.z,
                        progress,
                    ),
                );
            });

            core.rotation.x = idle * 0.08 + progress * 1.25;
            core.rotation.y = idle * 0.12 + progress * 1.8;
            core.scale.setScalar(1 - progress * 0.26);
            core.scale.y *= 1.35;
            orbit.rotation.z = idle * -0.035 + progress * 0.9;
            orbit.scale.setScalar(1 + progress * 0.18);
            sculpture.rotation.y =
                Math.sin(idle * 0.18) * 0.08 -
                progress * 0.32 +
                currentProgress * Math.PI * 0.55;
            sculpture.rotation.x =
                Math.sin(currentProgress * Math.PI * 2) * 0.18;
            sculpture.position.y =
                Math.sin(currentProgress * Math.PI * 2) * 0.42;
            sculpture.position.x =
                Math.sin(currentProgress * Math.PI * 3) * 0.28;

            const positionAttribute = pointGeometry.getAttribute(
                'position',
            ) as BufferAttribute;
            const positions = positionAttribute.array as Float32Array;

            for (let index = 0; index < pointCount; index += 1) {
                const stride = index * 3;
                const spread = 1 + progress * (0.24 + (index % 7) * 0.018);

                positions[stride] = pointOrigins[stride] * spread;
                positions[stride + 1] =
                    pointOrigins[stride + 1] * spread +
                    Math.sin(idle * 0.22 + index) * 0.025;
                positions[stride + 2] =
                    pointOrigins[stride + 2] +
                    progress * ((index % 5) - 2) * 0.12;
            }

            positionAttribute.needsUpdate = true;
            points.rotation.z =
                idle * 0.012 -
                progress * 0.08 +
                currentProgress * Math.PI * 0.16;
            renderer.render(scene, camera);

            if (visible && pageVisible && !reducedMotion.matches) {
                frameId = window.requestAnimationFrame(renderFrame);
            }
        };

        const startRendering = () => {
            window.cancelAnimationFrame(frameId);
            previousTime = performance.now();
            frameId = window.requestAnimationFrame(renderFrame);
        };

        const handleVisibility = () => {
            pageVisible = !document.hidden;

            if (pageVisible && visible) {
                startRendering();
            } else {
                window.cancelAnimationFrame(frameId);
            }
        };

        const handleMotionPreference = () => {
            updateScrollProgress();
            startRendering();
        };

        const visibilityObserver = new IntersectionObserver(
            ([entry]) => {
                visible = entry.isIntersecting;

                if (visible && pageVisible) {
                    startRendering();
                } else {
                    window.cancelAnimationFrame(frameId);
                }
            },
            { rootMargin: '120px' },
        );
        const resizeObserver = new ResizeObserver(resize);

        visibilityObserver.observe(host);
        resizeObserver.observe(host);
        window.addEventListener('scroll', updateScrollProgress, {
            passive: true,
        });
        document.addEventListener('visibilitychange', handleVisibility);
        reducedMotion.addEventListener('change', handleMotionPreference);
        resize();
        updateScrollProgress();
        startRendering();

        return () => {
            window.cancelAnimationFrame(frameId);
            visibilityObserver.disconnect();
            resizeObserver.disconnect();
            window.removeEventListener('scroll', updateScrollProgress);
            document.removeEventListener('visibilitychange', handleVisibility);
            reducedMotion.removeEventListener('change', handleMotionPreference);

            scene.traverse((object) => {
                if (!(object instanceof Mesh)) {
                    return;
                }

                object.geometry.dispose();
            });
            partMaterial.dispose();
            accentMaterial.dispose();
            lineMaterial.dispose();
            orbitMaterial.dispose();
            pointGeometry.dispose();
            pointMaterial.dispose();
            renderer.dispose();
            renderer.forceContextLoss();
            renderer.domElement.remove();
        };
    }, [accent, isDark]);

    return (
        <div
            ref={hostRef}
            aria-hidden="true"
            className={`portfolio-three-stage ${className}`}
        />
    );
}
