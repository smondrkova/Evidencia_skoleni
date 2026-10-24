import { Link } from 'react-router-dom';
import type { Employee } from '../../types/employee';
import type { Training } from '../../types/training';
import type { TrainingPriority } from '../../domain/priorities';
import { formatDate } from '../../utils/formatDate';

type TrainingNeedsTableProps = {
    priorities: TrainingPriority[];
    employees: Employee[];
    trainings: Training[];
};

const statuses = {
    missing: { label: 'Missing record', className: 'bg-slate-100 text-slate-700' },
    expired: { label: 'Expired', className: 'bg-red-50 text-red-700' },
    expiringSoon: { label: 'Expiring soon', className: 'bg-amber-50 text-amber-800' },
};

// Preserve the domain priority order while linking each need to its employee and training.
export function TrainingNeedsTable({ priorities, employees, trainings }: TrainingNeedsTableProps) {
    return (
        <div className="max-h-[65vh] overflow-auto">
            <table className="w-full text-left text-sm">
                <caption className="sr-only">
                    Required training needs ordered by urgency. Sessions have not been assigned.
                </caption>
                <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3.5"
                        >
                            Priority
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Employee
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Training
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Validity
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Valid until
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Reason
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {priorities.map((item) => {
                        const employee = employees.find((person) => person.id === item.employeeId);
                        const training = trainings.find(
                            (course) => course.code === item.trainingCode,
                        );
                        const style = statuses[item.status];
                        return (
                            <tr key={`${item.employeeId}-${item.trainingCode}`}>
                                <td className="px-6 py-4 whitespace-nowrap font-medium">
                                    {item.priority === 1 ? '1 · Urgent' : '2 · Expiring soon'}
                                </td>
                                <td className="min-w-44 px-5 py-4">
                                    <Link
                                        to={`/employees/${encodeURIComponent(item.employeeId)}`}
                                        className="rounded font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                                    >
                                        {employee
                                            ? `${employee.firstName} ${employee.lastName}`
                                            : item.employeeId}
                                    </Link>
                                    <span className="mt-1 block text-xs text-slate-500">
                                        {item.employeeId}
                                    </span>
                                </td>
                                <td className="min-w-48 px-5 py-4">
                                    <Link
                                        to={`/trainings/${encodeURIComponent(item.trainingCode)}`}
                                        state={{ employeeId: item.employeeId }}
                                        className="rounded font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                                    >
                                        {training?.name ?? item.trainingCode}
                                    </Link>
                                    <span className="mt-1 block text-xs text-slate-500">
                                        {item.trainingCode}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style.className}`}
                                    >
                                        {style.label}
                                    </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    {formatDate(item.validUntil)}
                                </td>
                                <td className="min-w-56 px-5 py-4 text-slate-500">{item.reason}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {priorities.length === 0 && (
                <p className="px-6 py-10 text-sm text-slate-500">
                    No missing, expired or soon-expiring required trainings need planning.
                </p>
            )}
        </div>
    );
}
