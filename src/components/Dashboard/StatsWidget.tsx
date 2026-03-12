import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Loader from "@/components/ui/Loader";

interface StatsWidgetProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    trendUp?: boolean;
    description?: string;
    isLoading?: boolean;
    className?: string;
}

export function StatsWidget({
    title,
    value,
    icon: Icon,
    trend,
    trendUp,
    description,
    isLoading,
    className,
}: StatsWidgetProps) {
    return (
        <Card className={cn("overflow-hidden", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                    </div>
                </div>
                {isLoading ? (
                    <div className="py-4">
                        <Loader className="p-0 h-8" />
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <div className="text-2xl font-bold">{value}</div>
                        {(trend || description) && (
                            <div className="flex items-center text-xs text-muted-foreground">
                                {trend && (
                                    <span className={cn("mr-2 font-medium", trendUp ? "text-green-600" : "text-red-600")}>
                                        {trend}
                                    </span>
                                )}
                                {description}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
