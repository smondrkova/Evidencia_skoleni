import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Employee } from '../../types/employee';
import type { Training } from '../../types/training';
import type { TrainingPriority } from '../../domain/priorities';
import type { TrainingRecommendation } from '../../domain/recommendations';
import { formatDate } from '../../utils/formatDate';

type TrainingNeedsTableProps = {
    priorities: TrainingPriority[];
    recommendations: TrainingRecommendation[];
    employees: Employee[];
    trainings: Training[];
};

const statuses = {
    missing: { label: 'Missing record', className: 'bg-slate-100 text-slate-700' },
    expired: { label: 'Expired', className: 'bg-red-50 text-red-700' },
    expiringSoon: { label: 'Expiring soon', className: 'bg-amber-50 text-amber-800' },
};

export function TrainingNeedsTable({
    priorities,
    recommendations,
    employees,
    trainings,
}: TrainingNeedsTableProps) {
    const [selectedRecommendation, setSelectedRecommendation] =
        useState<TrainingRecommendation | null>(null);

    return (
        <>
            <div className="max-h-[65vh] overflow-auto">
                <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                        Required training needs ordered by urgency. Suggested training sessions for
                        each prioritized need.
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
                            <th
                                scope="col"
                                className="px-5 py-3.5"
                            >
                                Suggested session
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {priorities.map((item) => {
                            const employee = employees.find(
                                (person) => person.id === item.employeeId,
                            );
                            const training = trainings.find(
                                (course) => course.code === item.trainingCode,
                            );
                            const style = statuses[item.status];
                            const recommendation = recommendations.find(
                                (candidate) =>
                                    candidate.employeeId === item.employeeId &&
                                    candidate.trainingCode === item.trainingCode,
                            );
                            const session = recommendation?.session;
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
                                    <td className="min-w-56 px-5 py-4 text-slate-500">
                                        {recommendation?.reason ?? item.reason}
                                    </td>
                                    <td className="min-w-72 px-5 py-4">
                                        {session ? (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedRecommendation(
                                                        recommendation ?? null,
                                                    )
                                                }
                                                className="rounded text-left font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-blue-600"
                                            >
                                                {formatDate(session.date)} · {session.startTime}–
                                                {session.endTime}
                                                <span className="mt-1 block text-xs text-slate-500">
                                                    {session.location} · View alternatives
                                                </span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setSelectedRecommendation(
                                                        recommendation ?? null,
                                                    )
                                                }
                                                className="rounded text-left text-amber-800 hover:underline focus-visible:outline-2 focus-visible:outline-amber-700"
                                            >
                                                No suitable session
                                                <span className="mt-1 block text-xs text-slate-600">
                                                    View explanation
                                                </span>
                                            </button>
                                        )}
                                    </td>
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
            {selectedRecommendation && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSelectedRecommendation(null);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="suggested-session-title"
                        tabIndex={-1}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') setSelectedRecommendation(null);
                        }}
                        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2
                                    id="suggested-session-title"
                                    className="text-lg font-semibold"
                                >
                                    Suggested sessions
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {selectedRecommendation.trainingCode} for employee{' '}
                                    {selectedRecommendation.employeeId}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedRecommendation(null)}
                                className="rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
                                aria-label="Close suggested sessions"
                            >
                                Close
                            </button>
                        </div>
                        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                            {selectedRecommendation.selectionReason}
                        </p>
                        <div className="mt-5 space-y-3">
                            {selectedRecommendation.alternatives.map((alternative) => {
                                const isSelected =
                                    alternative.id === selectedRecommendation.session?.id;
                                return (
                                    <div
                                        key={alternative.id}
                                        className={`rounded-lg border p-4 ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-slate-200'}`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    {formatDate(alternative.date)} ·{' '}
                                                    {alternative.startTime}–{alternative.endTime}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {alternative.location} · {alternative.id}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                                                    Suggested
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {alternative.occupied} / {alternative.capacity} places
                                            occupied ·{' '}
                                            {alternative.capacity! - alternative.occupied!} places
                                            available
                                        </p>
                                    </div>
                                );
                            })}
                            {selectedRecommendation.alternatives.length === 0 && (
                                <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    {selectedRecommendation.selectionReason}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
