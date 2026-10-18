import AppearanceToggle from '@/components/react/appearance-toggle';
import Logo from '@/components/react/logo';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from '@/components/react/ui/sheet';
import { appUrl, NAV_LINKS } from '@/lib/site';
import { ArrowRight, Menu } from 'lucide-react';
import type { MouseEvent } from 'react';
import { useState } from 'react';

/**
 * Floating menu button for small screens, where the header navigation is hidden.
 */
export default function MobileMenu({
    name,
    isAuthEnabled = true,
}: {
    name: string;
    isAuthEnabled?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const goToSection = (
        event: MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        event.preventDefault();
        setIsOpen(false);

        window.setTimeout(() => {
            document
                .querySelector(href)
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.replaceState(null, '', href);
        }, 300);
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button
                    type="button"
                    aria-label="Open menu"
                    className="fixed right-5 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] z-40 flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-xl ring-1 shadow-indigo-500/30 ring-white/20 transition duration-300 active:scale-95 md:hidden"
                >
                    <Menu className="size-6" />
                </button>
            </SheetTrigger>
            <SheetContent
                side="bottom"
                onCloseAutoFocus={(event) => event.preventDefault()}
                className="gap-0 rounded-t-3xl border-zinc-950/5 bg-white px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-zinc-950 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            >
                <div className="flex items-center justify-between pe-8">
                    <SheetTitle asChild>
                        <div>
                            <Logo name={name} />
                        </div>
                    </SheetTitle>
                    <AppearanceToggle />
                </div>
                <SheetDescription className="sr-only">
                    Site navigation
                </SheetDescription>

                <nav className="mt-6 grid gap-1">
                    {NAV_LINKS.map(({ label, href }) => (
                        <a
                            key={href}
                            href={href}
                            onClick={(event) => goToSection(event, href)}
                            className="flex items-center justify-between rounded-xl px-3 py-3 text-base font-medium text-zinc-700 transition hover:bg-zinc-950/[0.03] dark:text-zinc-200 dark:hover:bg-white/5"
                        >
                            {label}
                            <ArrowRight className="size-4 text-zinc-400" />
                        </a>
                    ))}
                </nav>

                {isAuthEnabled && (
                    <div className="mt-6 grid gap-2 border-t border-zinc-950/5 pt-6 dark:border-white/10">
                        <a
                            href={appUrl('/app/register')}
                            className="flex h-11 items-center justify-center rounded-full bg-zinc-950 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
                        >
                            Start free
                        </a>
                        <a
                            href={appUrl('/app/login')}
                            className="flex h-11 items-center justify-center rounded-full text-sm font-medium text-zinc-700 ring-1 ring-zinc-950/10 dark:text-zinc-200 dark:ring-white/15"
                        >
                            Sign in
                        </a>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
