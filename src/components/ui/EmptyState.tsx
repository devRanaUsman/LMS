import React from 'react';

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    size = 'md',
}: EmptyStateProps) {
    const sizeClasses = {
        sm: 'py-6',
        md: 'py-12',
        lg: 'py-16',
    };

    return (
        <div className={`flex flex-col items-center justify-center text-center ${sizeClasses[size]}`}>
            {icon && (
                <div className="mb-4 text-slate-400">
                    {icon}
                </div>
            )}
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{title}</h3>
            {description && (
                <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>
            )}
            {action && (
                <div className="mt-2">
                    {action}
                </div>
            )}
        </div>
    );
}
