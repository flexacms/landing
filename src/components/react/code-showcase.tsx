import { CODE_SAMPLES } from '@/lib/site';
import type { MouseEvent } from 'react';
import { useState } from 'react';

export default function CodeShowcase() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const sample = CODE_SAMPLES[activeIndex];

    const handlePointerMove = (event: MouseEvent<HTMLDivElement>) => {
        const bounds = event.currentTarget.getBoundingClientRect();

        setTilt({
            x: ((event.clientY - bounds.top) / bounds.height - 0.5) * -4,
            y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 4,
        });
    };

    return (
        <div
            className="relative transition-transform duration-300 ease-out will-change-transform motion-reduce:transform-none"
            style={{
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
            onMouseMove={handlePointerMove}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        >
            <div
                aria-hidden
                className="absolute -inset-8 rounded-[2.5rem] bg-gradient-to-b from-indigo-500/25 via-fuchsia-500/10 to-transparent blur-3xl"
            />
            <div
                aria-hidden
                className="glow-border absolute -inset-px rounded-2xl opacity-80"
            />
            <div className="relative overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl ring-1 shadow-indigo-950/30 ring-white/10">
                <div className="flex items-center justify-between gap-4 border-b border-white/10 bg-white/[0.02] px-4">
                    <div className="flex items-center gap-2 py-3">
                        <span className="size-3 rounded-full bg-white/15" />
                        <span className="size-3 rounded-full bg-white/15" />
                        <span className="size-3 rounded-full bg-white/15" />
                        <span
                            key={sample.file + activeIndex}
                            className="ms-3 hidden animate-code-in font-mono text-xs text-zinc-500 sm:inline"
                        >
                            {sample.file}
                        </span>
                    </div>
                    <div
                        role="tablist"
                        className="flex gap-1 overflow-x-auto overflow-y-hidden py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {CODE_SAMPLES.map(({ label }, index) => (
                            <button
                                key={label}
                                type="button"
                                role="tab"
                                aria-selected={index === activeIndex}
                                onClick={() => setActiveIndex(index)}
                                className={`relative rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition duration-300 ${
                                    index === activeIndex
                                        ? 'bg-white/10 text-white'
                                        : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                            >
                                {label}
                                {index === activeIndex && (
                                    <span
                                        aria-hidden
                                        className="absolute inset-x-2 -bottom-2 h-px animate-code-in bg-gradient-to-r from-transparent via-indigo-400 to-transparent"
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <pre className="h-[22rem] overflow-auto p-6 text-left font-mono text-[13px] leading-relaxed text-zinc-300">
                    <code key={activeIndex} className="block animate-code-in">
                        {sample.code}
                    </code>
                </pre>
            </div>
        </div>
    );
}
