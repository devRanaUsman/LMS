import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DashboardLayout() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Wrapper */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 md:sticky md:top-0 md:h-screen transition-transform duration-300 ease-in-out flex-shrink-0",
                    isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="h-full">
                    <Sidebar />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-0 min-w-0 overflow-y-auto">
                <div className="md:hidden sticky top-0 z-30 flex items-center px-4 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setIsMobileOpen(true)}
                                    className="p-2 -ml-2 rounded-lg hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    <Menu className="w-6 h-6 text-gray-600" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                <p>Open mobile menu</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    <span className="ml-3 text-lg font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
                        EduFlow
                    </span>
                </div>

                <div className="p-4 md:pt-6 md:px-8 md:pb-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
