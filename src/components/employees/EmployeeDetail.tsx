import { format, parseISO } from 'date-fns';
import type { Employee } from '../../types/employee';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';

type EmployeeDetailProps = {
    employee: Employee;
};

// Format imported calendar dates for the English employee detail.
function formatDate(value: string | null): string {
    return value ? format(parseISO(value), 'd MMM yyyy') : 'Not provided';
}

// Present employee fields independently of page navigation.
export function EmployeeDetail({ employee }: EmployeeDetailProps) {
    return (
        <section
            aria-labelledby="employee-detail-title"
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <p className="text-sm font-medium text-slate-500">Employee details</p>
            </div>
            <div className="p-6 sm:p-8">
                <p className="mb-2 text-xs font-semibold tracking-wider text-blue-600">
                    {employee.id || 'NO EMPLOYEE ID'}
                </p>
                <h2
                    id="employee-detail-title"
                    className="mb-3 text-2xl font-semibold tracking-tight"
                >
                    {employee.firstName} {employee.lastName}
                </h2>
                <EmployeeStatusBadge status={employee.status} />

                {employee.reviewRequired && (
                    <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-relaxed text-amber-900">
                        This employee record contains data that needs review. Check the source data
                        before relying on incomplete or inconsistent details.
                    </p>
                )}

                <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs text-slate-500">Department</dt>
                        <dd className="mt-1 text-sm font-medium">
                            {employee.department || 'Not provided'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500">Position</dt>
                        <dd className="mt-1 text-sm font-medium">
                            {employee.position || 'Not provided'}
                        </dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500">Email</dt>
                        <dd className="mt-1 text-sm font-medium break-words">
                            {employee.email || 'Not provided'}
                        </dd>
                    </div>
                    <div className="sm:col-span-2">
                        <dt className="text-xs text-slate-500">Manager email</dt>
                        <dd className="mt-1 text-sm font-medium break-words">
                            {employee.managerEmail || 'Not provided'}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500">Start date</dt>
                        <dd className="mt-1 text-sm font-medium">
                            {formatDate(employee.startDate)}
                        </dd>
                    </div>
                    <div>
                        <dt className="text-xs text-slate-500">End date</dt>
                        <dd className="mt-1 text-sm font-medium">{formatDate(employee.endDate)}</dd>
                    </div>
                </dl>
            </div>
        </section>
    );
}
