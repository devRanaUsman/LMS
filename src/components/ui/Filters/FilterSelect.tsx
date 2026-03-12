import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FilterSelectProps {
    value: string;
    onChange: (value: string) => void;
    options: { label: string; value: string }[];
    label?: string;
    className?: string;
    disabled?: boolean;
}

export function FilterSelect({
    value,
    onChange,
    options,
    label,
    className,
    disabled
}: FilterSelectProps) {
    // Find the label for the current value to display in trigger if needed
    // The SelectValue component inside select-custom handles display, but we need to ensure value matches

    return (
        <div className={cn("flex items-center gap-2", className)}>
            {label && <span className="text-sm font-medium text-muted-foreground">{label}:</span>}
            <div className="w-[150px]">
                <Select value={value} onValueChange={onChange} disabled={disabled}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
