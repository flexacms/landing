import { lazy, Suspense, useEffect, useState } from 'react';

const loadCmsStackScene = () => import('@/components/react/landing/cms-stack-scene');

/** Starts downloading the 3D scene as soon as the island script runs. */
if (typeof window !== 'undefined') {
    void loadCmsStackScene();
}

const CmsStackScene = lazy(loadCmsStackScene);

/**
 * Mounts the WebGL scene on the client only, after hydration, so SSR and the
 * initial bundle stay free of three.js.
 */
export default function HeroScene() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => setIsMounted(true), []);

    const placeholder = (
        <div className="absolute inset-[18%] animate-pulse rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.18),transparent)]" />
    );

    return isMounted ? (
        <Suspense fallback={placeholder}>
            <CmsStackScene />
        </Suspense>
    ) : (
        placeholder
    );
}
