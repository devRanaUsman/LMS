import React from 'react';

interface SchoolKPICardProps {
    title: string;
    value: number | string | null | undefined;
    icon: React.ReactNode;
    emptyMessage?: string;
    suffix?: string;
    gradient?: string;
}

export function SchoolKPICard({
    title,
    value,
    icon,
    emptyMessage = 'Principal not assigned',
    suffix,
    gradient = 'from-blue-500 to-blue-600',
}: SchoolKPICardProps) {
    const isEmpty = value === null || value === undefined;

    return (
        <div className={`bg-gradient-to-br ${gradient} rounded-lg p-4 text-white`}>
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <p className="text-white/90 text-sm font-medium mb-1">{title}</p>
                    {isEmpty ? (
                        <>
                            <h3 className="text-3xl font-bold text-white/50 mb-1">—</h3>
                            <p className="text-xs text-white/60">{emptyMessage}</p>
                        </>
                    ) : (
                        <h3 className="text-3xl font-bold">
                            {value}
                            {suffix && <span className="text-base font-normal ml-1">{suffix}</span>}
                        </h3>
                    )}
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    {icon}
                </div>
            </div>
        </div>
    );
}
