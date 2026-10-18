import AppLogoIcon from '@/components/react/app-logo-icon';

export default function Logo({ name }: { name: string }) {
    return (
        <a
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
        >
            <span className="flex size-8 items-center justify-center rounded-[0.6rem] bg-gradient-to-br from-indigo-400 to-indigo-600 shadow-lg shadow-indigo-500/30">
                <AppLogoIcon className="size-4 fill-current text-white" />
            </span>
            {name}
        </a>
    );
}
