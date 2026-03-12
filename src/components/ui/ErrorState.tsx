import React, { useState } from 'react';
import { AlertTriangle, RefreshCcw, WifiOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ErrorStateProps {
    title?: string;
    message?: string;
    variant?: 'inline' | 'page';
    onRetry?: () => void;
    retryLabel?: string;
    showRefreshPage?: boolean;
    onRefreshPage?: () => void;
    details?: any;
    isOffline?: boolean;
    icon?: React.ReactNode;
}

export function ErrorState({
    title = "Unable to load data",
    message = "We couldn’t fetch data from the API. Please try again.",
    variant = "inline",
    onRetry,
    retryLabel = "Retry",
    showRefreshPage = true,
    onRefreshPage,
    details,
    isOffline = false,
    icon
}: ErrorStateProps) {
    const [showDetails, setShowDetails] = useState(false);

    const handleRefresh = () => {
        if (onRefreshPage) {
            onRefreshPage();
        } else {
            window.location.reload();
        }
    };

    const isPageLevel = variant === 'page';
    const containerClasses = isPageLevel
        ? "flex flex-col items-center justify-center min-h-[50vh] p-8 text-center"
        : "flex flex-col items-center justify-center py-12 px-4 text-center border rounded-xl bg-slate-50/50 border-slate-200";

    const IconComponent = icon || (isOffline ? <WifiOff className="h-10 w-10 text-slate-400" /> : <AlertTriangle className="h-10 w-10 text-red-500" />);

    return (
        <div className={containerClasses} role="alert" aria-live="assertive">
            <div className={`mb-4 flex items-center justify-center ${isOffline ? 'bg-slate-100' : 'bg-red-50'} p-4 rounded-full`}>
                {IconComponent}
            </div>

            <h3 className="text-xl font-bold text-slate-900 mb-2">
                {isOffline ? "You appear offline" : title}
            </h3>

            <p className="text-slate-600 max-w-md mb-6 leading-relaxed">
                {isOffline ? "Please check your internet connection and try again." : message}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
                {onRetry && (
                    <Button
                        onClick={onRetry}
                        variant="default"
                        size="sm"
                        className="gap-2 min-w-[100px]"
                    >
                        <RefreshCcw className="h-4 w-4" />
                        {retryLabel}
                    </Button>
                )}

                {showRefreshPage && (
                    <Button
                        onClick={handleRefresh}
                        variant={onRetry ? "outline" : "default"}
                        size="sm"
                        className="gap-2 min-w-[120px]"
                    >
                        Refresh Page
                    </Button>
                )}
            </div>

            {/* Error Details (Collapsible, helpful for development or advanced users) */}
            {details && (
                <div className="mt-8 w-full max-w-2xl text-left">
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 font-medium transition-colors"
                    >
                        {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {showDetails ? "Hide technical details" : "Show technical details"}
                    </button>

                    {showDetails && (
                        <div className="mt-3 p-4 bg-slate-900 text-slate-300 rounded-lg overflow-auto max-h-64 text-xs font-mono">
                            {typeof details === 'string' ? details : JSON.stringify(details, null, 2)}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
