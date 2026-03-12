import { cn } from "@/lib/utils";
import { LogoLoader } from "./LogoLoader";

interface PageLoaderProps {
    className?: string;
    text?: string;
    overlay?: boolean;
}

export function PageLoader({ className, text = "Loading...", overlay = false }: PageLoaderProps) {
    if (overlay) {
        return (
            <div
                className={cn(
                    "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm",
                    className
                )}
                aria-label="Loading"
                aria-busy="true"
            >
                <LogoLoader size="lg" />
                {text && <p className="mt-6 text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
            </div>
        );
    }

    return (
        <div
            className={cn("flex flex-col items-center justify-center min-h-[400px] w-full", className)}
            aria-label="Loading"
            aria-busy="true"
        >
            <LogoLoader size="md" />
            {text && <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
        </div>
    );
}
