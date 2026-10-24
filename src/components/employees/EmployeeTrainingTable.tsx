import { formatDate } from '../../utils/formatDate';
import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import type {
    Training,
    TrainingCompletion,
    TrainingSession,
    TrainingStatus,
} from '../../types/training';
import { getTrainingValidity } from '../../domain/validity';
import { getTrainingRequirement } from '../../domain/requirements';
import type { Employee } from '../../types/employee';
import { AvailableSessions } from './AvailableSessions';

type EmployeeTrainingTableProps = {
    employee: Employee;
    trainings: Training[];
    records: TrainingCompletion[];
    sessions: TrainingSession[];
    referenceDate: string;
};

const statuses: Record<TrainingStatus, { label: string; className: string }> = {
    valid: { label: 'Valid', className: 'bg-emerald-50 text-emerald-700' },
    expiringSoon: { label: 'Expiring soon', className: 'bg-amber-50 text-amber-800' },
    expired: { label: 'Expired', className: 'bg-red-50 text-red-700' },
    missing: { label: 'Missing record', className: 'bg-slate-100 text-slate-600' },
    uncertain: { label: 'Uncertain', className: 'bg-violet-50 text-violet-700' },
};

const requirementLabels = {
    required: 'Required',
    optional: 'Not required',
    unknown: 'Needs review',
};

export function EmployeeTrainingTable({
    employee,
    trainings,
    records,
    sessions,
    referenceDate,
}: EmployeeTrainingTableProps) {
    const visibleTrainings = trainings
        .map((training) => ({
            training,
            requirement: getTrainingRequirement(employee, training.requirement),
        }))
        .filter(
            ({ training, requirement }) =>
                requirement.status !== 'optional' ||
                records.some((record) => record.trainingCode === training.code),
        );
    const unknownCodes = [
        ...new Set(
            records
                .filter(
                    (record) =>
                        !trainings.some((training) => training.code === record.trainingCode),
                )
                .map((record) => record.trainingCode),
        ),
    ];

    return (
        <section
            aria-labelledby="employee-training-heading"
            className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="border-b border-slate-200 px-6 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2
                        id="employee-training-heading"
                        className="text-lg font-semibold"
                    >
                        Training overview
                    </h2>
                    <p className="text-xs text-slate-500">As of {formatDate(referenceDate)}</p>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                    Required trainings and requirements needing review are shown. Other trainings
                    appear only if this employee has a completion record.
                </p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                        Training requirements and validity for this employee.
                    </caption>
                    <thead className="bg-slate-50 text-xs text-slate-500">
                        <tr>
                            <th
                                scope="col"
                                className="px-6 py-3.5"
                            >
                                Training
                            </th>
                            <th
                                scope="col"
                                className="px-5 py-3.5"
                            >
                                Requirement
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
                                Completed on
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
                                Explanation
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {visibleTrainings.map(({ training, requirement }) => {
                            const result = getTrainingValidity(training, records, referenceDate);
                            const style = statuses[result.status];
                            return (
                                <Fragment key={training.code}>
                                    <tr>
                                        <td className="min-w-48 px-6 py-4">
                                            <Link
                                                to={`/trainings/${encodeURIComponent(training.code)}`}
                                                state={{ employeeId: employee.id }}
                                                className="block rounded font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                            >
                                                {training.name}
                                            </Link>
                                            <span className="mt-1 block text-xs text-slate-500">
                                                {training.code}
                                            </span>
                                        </td>
                                        <td className="min-w-48 px-5 py-4">
                                            <span
                                                className={`text-xs font-semibold ${requirement.status === 'unknown' ? 'text-amber-800' : 'text-slate-700'}`}
                                            >
                                                {requirementLabels[requirement.status]}
                                            </span>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {requirement.reason}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${style.className}`}
                                            >
                                                {style.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                                            {formatDate(result.completion?.completionDate)}
                                        </td>
                                        <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                                            {formatDate(result.completion?.validUntil)}
                                        </td>
                                        <td className="min-w-64 px-5 py-4 text-sm text-slate-500">
                                            {result.reason}
                                            {result.reviewCount > 0 && (
                                                <p className="mt-2 text-xs text-amber-800">
                                                    Records needing review: {result.reviewCount}.
                                                    These do not confirm validity.
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 pb-4 pt-2"
                                        >
                                            <AvailableSessions
                                                trainingCode={training.code}
                                                trainingName={training.name}
                                                sessions={sessions}
                                                referenceDate={referenceDate}
                                            />
                                        </td>
                                    </tr>
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
                {visibleTrainings.length === 0 && (
                    <p className="px-6 py-8 text-sm text-slate-500">
                        No required trainings or recorded completions to display.
                    </p>
                )}
            </div>
            <div className="border-t border-slate-100 px-6 py-4 text-xs leading-relaxed text-slate-500">
                <p>
                    Expiring soon means today or within the next 30 days. Training remains valid on
                    its expiry date.
                </p>
                {unknownCodes.length > 0 && (
                    <p className="mt-2 text-amber-800">
                        Unrecognized training codes: {unknownCodes.join(', ')}. These records need
                        review and are not assigned to catalog trainings.
                    </p>
                )}
            </div>
        </section>
    );
}
