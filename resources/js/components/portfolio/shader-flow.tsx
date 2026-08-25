import { Mesh, Program, Renderer, Transform, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

export type ShaderFlowProps = {
    className?: string;
    flowSpeed?: [number, number];
    iterations?: number;
    scale?: number;
    brightness?: number;
    colorLow?: [number, number, number];
    colorHigh?: [number, number, number];
    backgroundColor?: [number, number, number];
    fadeRadiusX?: number;
    fadeRadiusY?: number;
    fadeCenterX?: number;
    fadeCenterY?: number;
};

const vertexShader =
    'attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}';

const fragmentShader = `precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uVelocity;
uniform float uScale;
uniform float uBrightness;
uniform int uIterations;
uniform vec3 uColorLow;
uniform vec3 uColorHigh;
uniform vec3 uBackground;
uniform vec4 uFade;

float field(vec2 point) {
  return sin(point.x + sin(point.y + uTime * uVelocity.x))
    * sin(point.y * point.x * 0.1 + uTime * uVelocity.y);
}

float fadeAlpha(float distanceFromCenter) {
  float value = clamp(1.0 - distanceFromCenter, 0.0, 1.0);
  return value * value * (3.0 - 2.0 * value);
}

void main() {
  vec2 fragment = gl_FragCoord.xy / uResolution;
  vec2 point = fragment - 0.5;
  point.x *= uResolution.x / uResolution.y;
  point *= uScale;

  float movement = uTime * 0.25;
  vec2 drift = vec2(sin(movement), cos(movement)) * 0.1;
  vec2 epsilon = vec2(0.05, 0.0);
  vec2 response = vec2(0.0);

  for (int index = 0; index < 24; index++) {
    if (index >= uIterations) break;
    float base = field(point);
    float horizontal = field(point + epsilon.xy);
    float vertical = field(point + epsilon.yx);
    vec2 gradient = vec2(horizontal - base, vertical - base) * 20.0;
    point += vec2(-gradient.y, gradient.x) * 0.5 + gradient * 0.005 + drift;
    response = gradient;
  }

  float mixValue = clamp(length(response) * 0.5, 0.0, 1.0);
  vec3 color = mix(uColorLow, uColorHigh, mixValue) * uBrightness;

  vec2 normalized = vec2(fragment.x, 1.0 - fragment.y);
  float aspect = uResolution.x / uResolution.y;
  float horizontalDistance =
    ((normalized.x - uFade.x) * aspect) / uFade.z;
  float verticalDistance = (normalized.y - uFade.y) / uFade.w;
  float alpha = fadeAlpha(
    sqrt(
      horizontalDistance * horizontalDistance
      + verticalDistance * verticalDistance
    )
  );

  gl_FragColor = vec4(mix(uBackground, color, alpha), 1.0);
}`;

const defaults = {
    flowSpeed: [0.1, 0.2] as [number, number],
    iterations: 14,
    scale: 6,
    brightness: 1,
    colorLow: [0.18, 0.2, 0.3] as [number, number, number],
    colorHigh: [0.55, 0.38, 0.32] as [number, number, number],
    backgroundColor: [0.03, 0.03, 0.03] as [number, number, number],
    fadeRadiusX: 1.4,
    fadeRadiusY: 0.65,
    fadeCenterX: 0.5,
    fadeCenterY: 0,
};

/**
 * Adapted from the ShaderFlow component bundled with the free React Bits Pro
 * portfolio template: https://github.com/DavidHDev/rbp-portfolio
 */
export function ShaderFlow(props: ShaderFlowProps): ReactNode {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const propsRef = useRef(props);

    useEffect(() => {
        propsRef.current = props;
    });

    useEffect(() => {
        const host = hostRef.current;

        if (!host) {
            return;
        }

        const renderer = new Renderer({
            dpr: Math.min(window.devicePixelRatio || 1, 1.25),
            alpha: false,
            antialias: false,
            powerPreference: 'high-performance',
        });
        const gl = renderer.gl;
        gl.canvas.style.width = '100%';
        gl.canvas.style.height = '100%';
        gl.canvas.style.display = 'block';
        host.appendChild(gl.canvas);

        const geometry = new Triangle(gl);
        const program = new Program(gl, {
            vertex: vertexShader,
            fragment: fragmentShader,
            uniforms: {
                uTime: { value: 0 },
                uResolution: { value: [1, 1] },
                uVelocity: { value: [...defaults.flowSpeed] },
                uScale: { value: defaults.scale },
                uBrightness: { value: defaults.brightness },
                uIterations: { value: defaults.iterations },
                uColorLow: { value: [...defaults.colorLow] },
                uColorHigh: { value: [...defaults.colorHigh] },
                uBackground: { value: [...defaults.backgroundColor] },
                uFade: {
                    value: [
                        defaults.fadeCenterX,
                        defaults.fadeCenterY,
                        defaults.fadeRadiusX,
                        defaults.fadeRadiusY,
                    ],
                },
            },
        });

        if (!program.uniformLocations) {
            return;
        }

        const mesh = new Mesh(gl, { geometry, program });
        const scene = new Transform();
        mesh.setParent(scene);

        const syncProps = (): void => {
            const current = propsRef.current;
            program.uniforms.uVelocity.value = [
                ...(current.flowSpeed ?? defaults.flowSpeed),
            ];
            program.uniforms.uScale.value = current.scale ?? defaults.scale;
            program.uniforms.uBrightness.value =
                current.brightness ?? defaults.brightness;
            program.uniforms.uIterations.value =
                current.iterations ?? defaults.iterations;
            program.uniforms.uColorLow.value = [
                ...(current.colorLow ?? defaults.colorLow),
            ];
            program.uniforms.uColorHigh.value = [
                ...(current.colorHigh ?? defaults.colorHigh),
            ];
            program.uniforms.uBackground.value = [
                ...(current.backgroundColor ?? defaults.backgroundColor),
            ];
            program.uniforms.uFade.value = [
                current.fadeCenterX ?? defaults.fadeCenterX,
                current.fadeCenterY ?? defaults.fadeCenterY,
                current.fadeRadiusX ?? defaults.fadeRadiusX,
                current.fadeRadiusY ?? defaults.fadeRadiusY,
            ];
        };

        const resize = (): void => {
            renderer.setSize(host.clientWidth, host.clientHeight);
            program.uniforms.uResolution.value = [
                gl.drawingBufferWidth,
                gl.drawingBufferHeight,
            ];
        };

        resize();
        syncProps();

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(host);

        const reducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        );
        let frame = 0;
        let isDocumentVisible = document.visibilityState === 'visible';
        let isOnScreen = true;
        const startedAt = performance.now();

        const renderFrame = (): void => {
            if (isDocumentVisible && isOnScreen) {
                program.uniforms.uTime.value = reducedMotion.matches
                    ? 0
                    : (performance.now() - startedAt) / 1000;
                syncProps();
                renderer.render({ scene });
            }

            if (!reducedMotion.matches) {
                frame = requestAnimationFrame(renderFrame);
            }
        };

        const handleVisibility = (): void => {
            isDocumentVisible = document.visibilityState === 'visible';
        };
        document.addEventListener('visibilitychange', handleVisibility);

        const intersectionObserver = new IntersectionObserver(
            (entries) => {
                isOnScreen = entries.some((entry) => entry.isIntersecting);
            },
            { rootMargin: '100px' },
        );
        intersectionObserver.observe(host);
        renderFrame();

        return () => {
            cancelAnimationFrame(frame);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            document.removeEventListener('visibilitychange', handleVisibility);

            if (gl.canvas.parentElement === host) {
                host.removeChild(gl.canvas);
            }

            gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
    }, []);

    return (
        <div
            ref={hostRef}
            aria-hidden="true"
            className={props.className ?? 'absolute inset-0 size-full'}
        />
    );
}
