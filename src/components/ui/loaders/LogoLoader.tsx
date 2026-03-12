import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LogoLoaderProps {
    className?: string;
    size?: "sm" | "md" | "lg" | "xl";
}

export function LogoLoader({ className, size = "md" }: LogoLoaderProps) {
    const sizeClasses = {
        sm: "w-8 h-8 text-lg",
        md: "w-12 h-12 text-2xl",
        lg: "w-16 h-16 text-3xl",
        xl: "w-24 h-24 text-4xl",
    };

    return (
        <div className={cn("flex items-center justify-center", className)} aria-label="Loading" aria-busy="true">
            <motion.div
                className={cn(
                    "rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20",
                    sizeClasses[size]
                )}
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 90, 180, 270, 360],
                    borderRadius: ["20%", "40%", "20%"]
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                }}
            >
                <svg viewBox="0 0 24 24" fill="none" className="w-1/2 h-1/2">
                    <path d="M12 3L2 8l10 5 10-5-10-5z" fill="white" opacity="0.95" />
                    <path d="M6 10.5v5c0 1.66 2.69 3 6 3s6-1.34 6-3v-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M20 8v5" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </motion.div>
        </div>
    );
}
