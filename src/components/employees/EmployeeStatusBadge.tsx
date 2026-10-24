import type { EmployeeStatus } from '../../types/employee';

const statuses: Record<EmployeeStatus, { label: string; className: string }> = {
    active: { label: 'Active', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' },
    terminated: { label: 'Terminated', className: 'bg-slate-100 text-slate-600 ring-slate-500/15' },
    parentalLeave: {
        label: 'Parental leave',
        className: 'bg-blue-50 text-blue-700 ring-blue-600/15',
    },
    unknown: { label: 'Unknown', className: 'bg-amber-50 text-amber-800 ring-amber-600/15' },
};

// Use consistent labels and colors for employment statuses.
export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
    const style = statuses[status];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ring-1 ring-inset ${style.className}`}
        >
            <span
                className="size-1.5 rounded-full bg-current"
                aria-hidden="true"
            />
            {style.label}
        </span>
    );
}
