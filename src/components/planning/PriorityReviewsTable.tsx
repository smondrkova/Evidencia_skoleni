import { Link } from 'react-router-dom';
import type { Employee } from '../../types/employee';
import type { Training } from '../../types/training';
import type { PriorityReview } from '../../domain/priorities';

type PriorityReviewsTableProps = {
    reviews: PriorityReview[];
    employees: Employee[];
    trainings: Training[];
};

export function PriorityReviewsTable({ reviews, employees, trainings }: PriorityReviewsTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <caption className="sr-only">
                    Records needing review before training can be planned.
                </caption>
                <thead className="bg-slate-50 text-xs text-slate-500">
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
                            Training
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
                    {reviews.map((item, index) => {
                        const matches = employees.filter((person) => person.id === item.employeeId);
                        const employee = matches.length === 1 ? matches[0] : null;
                        const training = trainings.find(
                            (course) => course.code === item.trainingCode,
                        );
                        return (
                            <tr key={`${item.employeeId}-${item.trainingCode}-${index}`}>
                                <td className="px-6 py-4">
                                    {employee && employee.id ? (
                                        <Link
                                            to={`/employees/${encodeURIComponent(employee.id)}`}
                                            className="rounded font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                                        >
                                            {employee.firstName} {employee.lastName}
                                        </Link>
                                    ) : (
                                        <span className="text-amber-800">
                                            Employee identity needs review
                                        </span>
                                    )}
                                    <span className="mt-1 block text-xs text-slate-500">
                                        {item.employeeId || 'No ID'}
                                    </span>
                                </td>
                                <td className="px-5 py-4">
                                    {training ? (
                                        <Link
                                            to={`/trainings/${encodeURIComponent(training.code)}`}
                                            className="rounded text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                                        >
                                            {training.name}
                                        </Link>
                                    ) : (
                                        (item.trainingCode ?? 'Employment data')
                                    )}
                                </td>
                                <td className="min-w-64 px-5 py-4 text-slate-600">{item.reason}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {reviews.length === 0 && (
                <p className="px-6 py-10 text-sm text-slate-500">
                    No uncertain cases were identified for planning.
                </p>
            )}
        </div>
    );
}
