import { Breadcrumb, type BreadcrumbItem } from './Breadcrumb';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
    breadcrumb?: BreadcrumbItem[];
    title: string | React.ReactNode;
    description?: string | React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export function PageHeader({
    breadcrumb,
    title,
    description,
    actions,
    className
}: PageHeaderProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {/* Breadcrumb Navigation */}
            {breadcrumb && <Breadcrumb items={breadcrumb} />}

            {/* Page Title & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        {title}
                    </h1>
                    {description && (
                        <p className="text-sm text-slate-500 mt-1">
                            {description}
                        </p>
                    )}
                </div>

                {actions && (
                    <div className="flex items-center gap-3">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
