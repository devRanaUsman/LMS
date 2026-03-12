import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSearchProps {
    value: string;
    onChange: (value: string) => void;
    currentType?: string;
    onTypeChange?: (value: string) => void;
    types?: { label: string; value: string; description?: string }[];
    placeholder?: string;
    className?: string;
}

export function FilterSearch({
    value,
    onChange,
    currentType,
    onTypeChange,
    types,
    placeholder = "Search...",
    className,
}: FilterSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedType = types?.find(t => t.value === currentType);

    return (
        <div
            className={cn(
                "flex items-center w-full max-w-full border border-slate-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-blue-500/10 focus-within:border-blue-500/50 transition-all",
                className
            )}
        >
            {/* Custom Type Selector Dropdown */}
            {types && onTypeChange && (
                <div className="relative border-r border-slate-200" ref={containerRef}>
                    <button
                        type="button"
                        onClick={() => setIsOpen(!isOpen)}
                        className="h-10 px-3 bg-slate-50 hover:bg-slate-100 flex items-center gap-2 text-sm transition-colors rounded-l-lg"
                    >
                        <span className="text-slate-500 font-medium">Search By</span>
                        <span className="font-semibold text-slate-800">{selectedType?.label || "Type"}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {isOpen && (
                        <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                            <div className="p-1">
                                {types.map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => {
                                            onTypeChange(type.value);
                                            setIsOpen(false);
                                        }}
                                        className={cn(
                                            "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3",
                                            currentType === type.value
                                                ? "bg-blue-50 text-blue-700"
                                                : "hover:bg-slate-50 text-slate-700"
                                        )}
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold">{type.label}</div>
                                            {type.description && (
                                                <div className={cn("text-xs mt-0.5", currentType === type.value ? "text-blue-500" : "text-slate-400")}>
                                                    {type.description}
                                                </div>
                                            )}
                                        </div>
                                        {currentType === type.value && <Check className="w-4 h-4 text-blue-600 mt-0.5" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search Input */}
            <div className="flex-1 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                    type="search"
                    placeholder={placeholder}
                    className="w-full h-10 pl-10 pr-4 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
