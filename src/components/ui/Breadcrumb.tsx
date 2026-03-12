import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    to?: string; // If omitted, renders as text (for current page)
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
    showHome?: boolean;
}

export function Breadcrumb({ items, showHome = true }: BreadcrumbProps) {
    const allItems = showHome
        ? [{ label: 'Home', to: '/' }, ...items]
        : items;
    console.log(allItems);
    return (
        <nav className="mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 text-sm">
                {allItems.map((item, index) => {
                    const isLast = index === allItems.length - 1;
                    const isFirst = index === 0 && showHome;

                    return (
                        <li key={index} className="flex items-center gap-2">
                            {item.to && !isLast ? (
                                <Link
                                    to={item.to}
                                    className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    {isFirst && <Home className="w-3.5 h-3.5" />}
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={`flex items-center gap-1.5 ${isLast ? 'text-slate-900 font-medium' : 'text-slate-600'
                                        }`}
                                >
                                    {isFirst && <Home className="w-3.5 h-3.5" />}
                                    {item.label}
                                </span>
                            )}
                            {!isLast && <ChevronRight className="w-4 h-4 text-slate-400" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
