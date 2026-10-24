import type { EmployeeStatus } from '../../types/employee';

export type EmployeeFilterValues = {
    department: string;
    position: string;
    status: EmployeeStatus | '';
};

type EmployeeFiltersProps = {
    departments: string[];
    positions: string[];
    values: EmployeeFilterValues;
    onChange: (values: EmployeeFilterValues) => void;
    onClear: () => void;
    hasFilters: boolean;
};

// Keep filter controls separate from the page's employee filtering logic.
export function EmployeeFilters({
    departments,
    positions,
    values,
    onChange,
    onClear,
    hasFilters,
}: EmployeeFiltersProps) {
    return (
        <div className="grid gap-4 border-b border-slate-200 bg-slate-50/50 px-6 py-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="block text-xs font-medium text-slate-600">
                Department
                <select
                    value={values.department}
                    onChange={(event) => onChange({ ...values, department: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-2 focus:outline-blue-500"
                >
                    <option value="">All departments</option>
                    {departments.map((department) => (
                        <option
                            key={department}
                            value={department}
                        >
                            {department}
                        </option>
                    ))}
                </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
                Position
                <select
                    value={values.position}
                    onChange={(event) => onChange({ ...values, position: event.target.value })}
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-2 focus:outline-blue-500"
                >
                    <option value="">All positions</option>
                    {positions.map((position) => (
                        <option
                            key={position}
                            value={position}
                        >
                            {position}
                        </option>
                    ))}
                </select>
            </label>
            <label className="block text-xs font-medium text-slate-600">
                Employment status
                <select
                    value={values.status}
                    onChange={(event) =>
                        onChange({ ...values, status: event.target.value as EmployeeStatus | '' })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-2 focus:outline-blue-500"
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="terminated">Terminated</option>
                    <option value="parentalLeave">Parental leave</option>
                    <option value="unknown">Unknown</option>
                </select>
            </label>
            <button
                type="button"
                onClick={onClear}
                disabled={!hasFilters}
                className="self-end rounded-lg px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent"
            >
                Clear filters
            </button>
        </div>
    );
}
