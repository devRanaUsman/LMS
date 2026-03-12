import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/**
 * Loader Standard Rules:
 * - variant="page": For full page loads or critical route fetches. Uses a backdrop or large display.
 * - variant="section": (Default) For specific sections, tables, or lists.
 * - variant="inline": For inside buttons or inline with text.
 */

export interface LoaderProps {
    className?: string;
    variant?: "page" | "section" | "inline";
    size?: "sm" | "md" | "lg";
    text?: string;
    fullScreen?: boolean;
}

export default function Loader({ className, variant = "section", size = "md", text, fullScreen }: LoaderProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-10 w-10",
    };

    const spinner = <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />;

    if (variant === "page" || fullScreen) {
        return (
            <div
                className={cn("flex flex-col items-center justify-center min-h-[400px] w-full", fullScreen && "fixed inset-0 z-50 bg-white/80 backdrop-blur-sm", className)}
                aria-label="Loading"
                aria-busy="true"
            >
                {spinner}
                {text && <p className="mt-4 text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
            </div>
        );
    }

    if (variant === "inline") {
        return (
            <div className={cn("inline-flex items-center gap-2", className)} aria-label="Loading" aria-busy="true">
                {spinner}
                {text && <span className="text-sm font-medium">{text}</span>}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col items-center justify-center p-4 w-full h-full min-h-[100px]", className)} aria-label="Loading" aria-busy="true">
            {spinner}
            {text && <p className="mt-2 text-sm text-slate-500 font-medium animate-pulse">{text}</p>}
        </div>
    );
}
