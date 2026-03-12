import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/ui/date-picker";

interface FilterDateRangeProps {
    startDate: Date | null;
    endDate: Date | null;
    onStartChange: (date: Date | null) => void;
    onEndChange: (date: Date | null) => void;
    className?: string;
}

export function FilterDateRange({
    startDate,
    endDate,
    onStartChange,
    onEndChange,
    className,
}: FilterDateRangeProps) {
    return (
        <div className={cn("flex items-center gap-2", className)}>
            <div className="flex items-center gap-2">
                <DatePicker
                    date={startDate || undefined}
                    setDate={(date) => onStartChange(date || null)}
                    className="w-[140px]"
                    placeholder="Start Date"
                />
                <span className="text-muted-foreground">-</span>
                <DatePicker
                    date={endDate || undefined}
                    setDate={(date) => onEndChange(date || null)}
                    className="w-[140px]"
                    placeholder="End Date"
                />
            </div>
        </div>
    );
}
