import type { Employee } from '../../types/employee';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';

type EmployeeTableProps = {
    employees: Employee[];
};

// Display employee information and data quality flags.
export function EmployeeTable({ employees }: EmployeeTableProps) {
    return (
        <div className="max-h-[65vh] overflow-auto">
            <table className="w-full text-left text-sm">
                <caption className="sr-only">Employees and their employment details.</caption>
                <thead className="sticky top-0 z-10 bg-slate-50 text-xs font-semibold text-slate-500">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3.5"
                        >
                            Employee
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Department
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Position
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Employment status
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Data quality
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {employees.map((employee, index) => (
                        <tr
                            key={`${employee.id}-${index}`}
                            className="group transition-colors hover:bg-blue-50/60 focus-within:bg-blue-50/60"
                        >
                            <td className="px-6 py-4">
                                <div className="group flex items-center gap-3 rounded text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600">
                                    <span
                                        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-700"
                                        aria-hidden="true"
                                    >
                                        {employee.firstName.charAt(0)}
                                        {employee.lastName.charAt(0)}
                                    </span>
                                    <span>
                                        <span className="block font-semibold whitespace-nowrap text-slate-800 ">
                                            {employee.firstName} {employee.lastName}
                                        </span>
                                        <span className="mt-0.5 block text-xs text-slate-500">
                                            {employee.id || 'No ID'}
                                        </span>
                                    </span>
                                </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                                {employee.department || 'Not provided'}
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                                {employee.position || 'Not provided'}
                            </td>
                            <td className="px-5 py-4">
                                <EmployeeStatusBadge status={employee.status} />
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-xs">
                                {employee.reviewRequired ? (
                                    <span className="rounded bg-amber-50 px-2 py-1 font-medium text-amber-800">
                                        Needs review
                                    </span>
                                ) : (
                                    <span className="text-slate-400">No flags</span>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {employees.length === 0 && (
                <p
                    className="px-6 py-16 text-center text-sm text-slate-500"
                    role="status"
                >
                    No employees found. Try a different search.
                </p>
            )}
        </div>
    );
}
