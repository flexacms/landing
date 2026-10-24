import {
    ContactShadows,
    Environment,
    Float,
    Lightformer,
    RoundedBox,
} from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Color, MathUtils, Object3D, Vector3 } from 'three';
import type { Group, InstancedMesh } from 'three';

type LabelRefs = RefObject<(HTMLDivElement | null)[]>;

type PointerRef = RefObject<{ x: number; y: number }>;

type Layer = {
    key: 'models' | 'api' | 'channels';
    color: string;
    title: string;
    detail: string;
};

const LAYERS: Layer[] = [
    {
        key: 'models',
        color: '#6366f1',
        title: 'Edit text & images',
        detail: 'No code needed',
    },
    {
        key: 'api',
        color: '#8b5cf6',
        title: 'Saved with history',
        detail: 'Undo any change',
    },
    {
        key: 'channels',
        color: '#d946ef',
        title: 'Your site updates',
        detail: 'Web, app or AI',
    },
];

const LAYER_SIZE = { width: 3.4, depth: 2.4, height: 0.14 };
const COLLAPSED_GAP = 1.05;
const EXPANDED_GAP = 1.45;
const PARTICLE_COUNT = 28;

/** Nudges the stack towards the left of the frame to leave room for labels. */
const STACK_OFFSET: [number, number, number] = [-0.75, 0, 0.75];

/**
 * Isometric WebGL scene of the CMS as three stacked glass layers — models,
 * API and delivery channels — with content particles flowing up through them.
 * The stack follows the pointer and spreads apart while hovered.
 *
 * The canvas bleeds past its layout box so rotation and the contact shadow
 * are never clipped; it ignores pointer events so it never covers the copy
 * next to it, and the pointer is tracked on the window instead.
 */
export default function CmsStackScene() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isOnScreen, setIsOnScreen] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
    const pointerRef = useRef({ x: 0, y: 0 });
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        const trackPointer = (event: PointerEvent) => {
            const bounds = containerRef.current?.getBoundingClientRect();

            if (!bounds) {
                return;
            }

            pointerRef.current = {
                x: MathUtils.clamp(
                    ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
                    -1,
                    1,
                ),
                y: MathUtils.clamp(
                    -((event.clientY - bounds.top) / bounds.height) * 2 + 1,
                    -1,
                    1,
                ),
            };
        };

        window.addEventListener('pointermove', trackPointer, { passive: true });

        return () => window.removeEventListener('pointermove', trackPointer);
    }, []);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) =>
            setIsOnScreen(entry.isIntersecting),
        );

        observer.observe(container);

        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative size-full"
            onPointerEnter={() => setIsHovered(true)}
            onPointerLeave={() => setIsHovered(false)}
        >
            <div
                className={`pointer-events-none absolute -inset-x-24 -inset-y-20 transition-opacity duration-1000 ${
                    isReady ? 'opacity-100' : 'opacity-0'
                }`}
            >
                <Canvas
                    dpr={[1, 1.5]}
                    frameloop={isReady && isOnScreen ? 'always' : 'never'}
                    camera={{ position: [6.8, 5, 6.8], fov: 38 }}
                    gl={{ alpha: true, antialias: true }}
                    style={{ pointerEvents: 'none' }}
                >
                    <ambientLight intensity={0.6} />
                    <directionalLight position={[5, 8, 4]} intensity={1.6} />
                    <pointLight
                        position={[-4, 1, -2]}
                        intensity={12}
                        color="#a855f7"
                    />

                    <Environment resolution={256}>
                        <Lightformer
                            form="rect"
                            intensity={3}
                            position={[0, 5, -6]}
                            scale={[12, 4, 1]}
                        />
                        <Lightformer
                            form="rect"
                            intensity={2}
                            color="#818cf8"
                            position={[-6, 2, 2]}
                            rotation-y={Math.PI / 2}
                            scale={[8, 3, 1]}
                        />
                        <Lightformer
                            form="ring"
                            intensity={2}
                            color="#f0abfc"
                            position={[6, 3, 2]}
                            rotation-y={-Math.PI / 2}
                            scale={3}
                        />
                    </Environment>

                    <Stack
                        isExpanded={isHovered}
                        isAnimated={!prefersReducedMotion}
                        labelRefs={labelRefs}
                        pointerRef={pointerRef}
                    />

                    <ShaderWarmup onReady={setIsReady} />

                    <ContactShadows
                        frames={1}
                        position={[0, -2.3, 0]}
                        opacity={0.35}
                        scale={12}
                        blur={2.6}
                        far={4}
                        color="#312e81"
                    />
                </Canvas>

                {LAYERS.map((layer, index) => (
                    <div
                        key={layer.key}
                        ref={(label) => {
                            labelRefs.current[index] = label;
                        }}
                        className="pointer-events-none absolute top-0 left-0 opacity-0 transition-opacity duration-700 select-none"
                    >
                        <LayerLabel color={layer.color} title={layer.title}>
                            {layer.detail}
                        </LayerLabel>
                    </div>
                ))}
            </div>
        </div>
    );
}

/** Where each layer's label is pinned: the corner furthest right on screen. */
const LABEL_ANCHOR = new Vector3(
    LAYER_SIZE.width / 2,
    0,
    -LAYER_SIZE.depth / 2,
);

/**
 * Compiles every shader in parallel (KHR_parallel_shader_compile) before the
 * first frame, so the main thread never blocks on it and the scene can fade
 * in fully formed instead of stuttering through its first frames.
 */
function ShaderWarmup({ onReady }: { onReady: (isReady: boolean) => void }) {
    const gl = useThree((state) => state.gl);
    const scene = useThree((state) => state.scene);
    const camera = useThree((state) => state.camera);

    useEffect(() => {
        let isCancelled = false;

        gl.compileAsync(scene, camera)
            .catch(() => undefined)
            .finally(() => {
                if (!isCancelled) {
                    onReady(true);
                }
            });

        return () => {
            isCancelled = true;
        };
    }, [gl, scene, camera, onReady]);

    return null;
}

function Stack({
    isExpanded,
    isAnimated,
    labelRefs,
    pointerRef,
}: {
    isExpanded: boolean;
    isAnimated: boolean;
    labelRefs: LabelRefs;
    pointerRef: PointerRef;
}) {
    const stackRef = useRef<Group>(null);
    const layerRefs = useRef<(Group | null)[]>([]);
    const gap = useRef(COLLAPSED_GAP);
    const projected = useMemo(() => new Vector3(), []);

    useFrame((state, delta) => {
        const stack = stackRef.current;

        if (!stack) {
            return;
        }

        gap.current = MathUtils.damp(
            gap.current,
            isExpanded ? EXPANDED_GAP : COLLAPSED_GAP,
            4,
            delta,
        );

        layerRefs.current.forEach((layer, index) => {
            if (layer) {
                layer.position.y = (index - 1) * gap.current;
            }
        });

        if (isAnimated) {
            stack.rotation.y = MathUtils.damp(
                stack.rotation.y,
                pointerRef.current.x * 0.35,
                3,
                delta,
            );
            stack.rotation.x = MathUtils.damp(
                stack.rotation.x,
                -pointerRef.current.y * 0.12,
                3,
                delta,
            );
        }

        layerRefs.current.forEach((layer, index) => {
            const label = labelRefs.current[index];

            if (!layer || !label) {
                return;
            }

            projected.copy(LABEL_ANCHOR);
            layer.localToWorld(projected).project(state.camera);

            const x = (projected.x * 0.5 + 0.5) * state.size.width;
            const y = (-projected.y * 0.5 + 0.5) * state.size.height;

            label.style.transform = `translate(${x}px, ${y}px)`;
            label.style.opacity = '1';
        });
    });

    return (
        <Float
            enabled={isAnimated}
            speed={1.4}
            rotationIntensity={0.15}
            floatIntensity={0.5}
        >
            <group ref={stackRef} position={STACK_OFFSET}>
                {LAYERS.map((layer, index) => (
                    <group
                        key={layer.key}
                        ref={(group) => {
                            layerRefs.current[index] = group;
                        }}
                        position={[0, (index - 1) * COLLAPSED_GAP, 0]}
                    >
                        <GlassLayer layer={layer} />
                    </group>
                ))}
                <Pillars gap={gap} />
                <DataFlow gap={gap} isAnimated={isAnimated} />
            </group>
        </Float>
    );
}

function GlassLayer({ layer }: { layer: Layer }) {
    return (
        <>
            <RoundedBox
                args={[LAYER_SIZE.width, LAYER_SIZE.height, LAYER_SIZE.depth]}
                radius={0.06}
                smoothness={4}
            >
                <meshPhysicalMaterial
                    color={layer.color}
                    roughness={0.18}
                    metalness={0.15}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    iridescence={0.7}
                    iridescenceIOR={1.3}
                    transparent
                    opacity={0.82}
                    emissive={layer.color}
                    emissiveIntensity={0.18}
                />
            </RoundedBox>

            <group position={[0, LAYER_SIZE.height / 2, 0]}>
                {layer.key === 'models' && <FieldBlocks />}
                {layer.key === 'api' && <EndpointRails />}
                {layer.key === 'channels' && <ChannelTiles />}
            </group>
        </>
    );
}

function LayerLabel({
    color,
    title,
    children,
}: {
    color: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="ms-3 flex w-max -translate-y-1/2 items-center gap-2.5 rounded-xl bg-white/80 py-1.5 ps-2.5 pe-3 shadow-lg ring-1 shadow-indigo-950/10 ring-zinc-950/5 backdrop-blur dark:bg-zinc-900/80 dark:ring-white/10">
            <span
                className="size-2 rounded-full"
                style={{
                    backgroundColor: color,
                    boxShadow: `0 0 12px ${color}`,
                }}
            />
            <span className="flex flex-col leading-tight">
                <span className="text-xs font-semibold whitespace-nowrap text-zinc-900 dark:text-white">
                    {title}
                </span>
                <span className="font-mono text-[10px] whitespace-nowrap text-zinc-500">
                    {children}
                </span>
            </span>
        </div>
    );
}

/** A grid of raised blocks standing in for the fields of a content model. */
function FieldBlocks() {
    const blocks = useMemo(
        () =>
            Array.from({ length: 12 }, (_, index) => {
                const column = index % 4;
                const row = Math.floor(index / 4);

                return {
                    position: [-1.2 + column * 0.8, 0, -0.65 + row * 0.65] as [
                        number,
                        number,
                        number,
                    ],
                    height: 0.06 + ((index * 7) % 5) * 0.035,
                    isAccent: index % 5 === 0,
                };
            }),
        [],
    );

    return (
        <>
            {blocks.map(({ position, height, isAccent }, index) => (
                <RoundedBox
                    key={index}
                    args={[0.62, height, 0.48]}
                    radius={0.03}
                    position={[position[0], height / 2, position[2]]}
                >
                    <meshStandardMaterial
                        color={isAccent ? '#a5b4fc' : '#f8fafc'}
                        roughness={0.35}
                        metalness={0.1}
                        emissive={isAccent ? '#6366f1' : '#000000'}
                        emissiveIntensity={isAccent ? 0.6 : 0}
                    />
                </RoundedBox>
            ))}
        </>
    );
}

/** Glowing rails standing in for the API endpoints. */
function EndpointRails() {
    return (
        <>
            {[-0.7, 0, 0.7].map((z, index) => (
                <group key={z} position={[0, 0.03, z]}>
                    <RoundedBox args={[2.9, 0.05, 0.32]} radius={0.02}>
                        <meshStandardMaterial
                            color="#0f0a1e"
                            roughness={0.4}
                            transparent
                            opacity={0.75}
                        />
                    </RoundedBox>
                    <mesh position={[-1.15, 0.03, 0]}>
                        <boxGeometry args={[0.4, 0.02, 0.16]} />
                        <meshBasicMaterial
                            color={index === 1 ? '#f0abfc' : '#a5b4fc'}
                            toneMapped={false}
                        />
                    </mesh>
                    <mesh position={[0.25, 0.03, 0]}>
                        <boxGeometry args={[2.1 - index * 0.4, 0.015, 0.05]} />
                        <meshBasicMaterial
                            color="#c4b5fd"
                            toneMapped={false}
                            transparent
                            opacity={0.55}
                        />
                    </mesh>
                </group>
            ))}
        </>
    );
}

/** Floating app tiles standing in for the frontends and AI clients. */
function ChannelTiles() {
    const tiles: { position: [number, number, number]; color: string }[] = [
        { position: [-1.1, 0.3, -0.5], color: '#ffffff' },
        { position: [0.1, 0.42, -0.6], color: '#e0e7ff' },
        { position: [1.15, 0.32, -0.3], color: '#fae8ff' },
        { position: [-0.5, 0.36, 0.55], color: '#ede9fe' },
        { position: [0.75, 0.28, 0.6], color: '#ffffff' },
    ];

    return (
        <>
            {tiles.map(({ position, color }, index) => (
                <Float
                    key={index}
                    speed={2 + index * 0.3}
                    rotationIntensity={0.4}
                    floatIntensity={0.4}
                >
                    <RoundedBox
                        args={[0.5, 0.5, 0.5]}
                        radius={0.1}
                        smoothness={4}
                        position={position}
                    >
                        <meshStandardMaterial
                            color={color}
                            roughness={0.2}
                            metalness={0.1}
                        />
                    </RoundedBox>
                </Float>
            ))}
        </>
    );
}

/** Thin glowing pillars at the corners that tie the layers together. */
function Pillars({ gap }: { gap: { current: number } }) {
    const pillarsRef = useRef<Group>(null);
    const corners = [
        [-1.6, -1.1],
        [1.6, -1.1],
        [-1.6, 1.1],
        [1.6, 1.1],
    ];

    useFrame(() => {
        pillarsRef.current?.scale.set(1, gap.current / COLLAPSED_GAP, 1);
    });

    return (
        <group ref={pillarsRef}>
            {corners.map(([x, z]) => (
                <mesh key={`${x}${z}`} position={[x, 0, z]}>
                    <cylinderGeometry
                        args={[0.012, 0.012, COLLAPSED_GAP * 2]}
                    />
                    <meshBasicMaterial
                        color="#a5b4fc"
                        transparent
                        opacity={0.45}
                        toneMapped={false}
                    />
                </mesh>
            ))}
        </group>
    );
}

/** Content particles rising from the models layer to the delivery layer. */
function DataFlow({
    gap,
    isAnimated,
}: {
    gap: { current: number };
    isAnimated: boolean;
}) {
    const meshRef = useRef<InstancedMesh>(null);
    const dummy = useMemo(() => new Object3D(), []);
    const particles = useMemo(
        () =>
            Array.from({ length: PARTICLE_COUNT }, (_, index) => ({
                x: Math.sin(index * 12.9898) * 1.3,
                z: Math.cos(index * 78.233) * 0.9,
                offset: index / PARTICLE_COUNT,
                speed: 0.12 + (index % 5) * 0.03,
            })),
        [],
    );
    const colors = useMemo(() => {
        const palette = ['#c7d2fe', '#f0abfc', '#ffffff'].map(
            (hex) => new Color(hex),
        );

        return particles.map((_, index) => palette[index % palette.length]);
    }, [particles]);

    useEffect(() => {
        colors.forEach((color, index) =>
            meshRef.current?.setColorAt(index, color),
        );
    }, [colors]);

    useFrame((state) => {
        const mesh = meshRef.current;

        if (!mesh) {
            return;
        }

        const elapsed = isAnimated ? state.clock.elapsedTime : 0;
        const span = gap.current * 2;

        particles.forEach(({ x, z, offset, speed }, index) => {
            const progress = (offset + elapsed * speed) % 1;
            const fade = Math.sin(progress * Math.PI);

            dummy.position.set(x, -gap.current + progress * span, z);
            dummy.scale.setScalar(0.35 + fade * 0.65);
            dummy.updateMatrix();
            mesh.setMatrixAt(index, dummy.matrix);
        });

        mesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh
            ref={meshRef}
            args={[undefined, undefined, PARTICLE_COUNT]}
        >
            <sphereGeometry args={[0.035, 12, 12]} />
            <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
    );
}

function usePrefersReducedMotion(): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setPrefersReducedMotion(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return prefersReducedMotion;
}
