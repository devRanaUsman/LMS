

export type Status = 'Pending' | 'Active' | 'Inactive' | 'Approved' | 'Rejected';

interface StatusBadgeProps {
    status: Status;
    size?: 'sm' | 'md';
}

const statusConfig: Record<Status, { bg: string; text: string; label: string }> = {
    Pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
    Active: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Active' },
    Inactive: { bg: 'bg-red-100', text: 'text-red-800', label: 'Inactive' },
    Approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
    Rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
};

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span
            className={`inline-flex items-center rounded font-medium ${config.bg} ${config.text} ${size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
                }`}
        >
            {config.label}
        </span>
    );
}
