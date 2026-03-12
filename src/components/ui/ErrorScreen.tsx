import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorScreenProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export default function ErrorScreen({
    title = "Something went wrong",
    message = "An error occurred while loading the data. Please try again.",
    onRetry,
}: ErrorScreenProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6">{message}</p>
            {onRetry && (
                <Button onClick={onRetry} variant="outline" className="gap-2">
                    <RefreshCcw className="h-4 w-4" />
                    Retry
                </Button>
            )}
        </div>
    );
}
