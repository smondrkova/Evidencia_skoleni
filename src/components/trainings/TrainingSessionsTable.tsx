import type { TrainingSession } from '../../types/training';
import { formatDate } from '../../utils/formatDate';

const priceFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CZK' });
const statusLabels = { planned: 'Planned', cancelled: 'Cancelled', unknown: 'Unknown status' };

// Show upcoming sessions with status and review flags, including those without available places.
export function TrainingSessionsTable({ sessions }: { sessions: TrainingSession[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <caption className="sr-only">
                    Upcoming training sessions, including cancelled sessions and records needing
                    review.
                </caption>
                <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3.5"
                        >
                            Date
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Time
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Location
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Status
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Registered / capacity
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Price per person
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sessions.map((session) => {
                        return (
                            <tr key={session.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {formatDate(session.date)}
                                    <span className="mt-1 block text-xs text-slate-500">
                                        {session.id}
                                    </span>
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    {session.startTime && session.endTime
                                        ? `${session.startTime}–${session.endTime}`
                                        : 'Not provided'}
                                </td>
                                <td className="px-5 py-4">{session.location || 'Not provided'}</td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${session.status === 'planned' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                                    >
                                        {statusLabels[session.status]}
                                    </span>
                                    {session.reviewRequired && (
                                        <span className="mt-2 block text-xs font-medium text-amber-800">
                                            Needs review · not usable for recommendations
                                        </span>
                                    )}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    {session.occupied ?? '—'} / {session.capacity ?? '—'}
                                </td>
                                <td className="px-5 py-4 whitespace-nowrap">
                                    {session.pricePerPerson === null
                                        ? 'Not provided'
                                        : priceFormat.format(session.pricePerPerson)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {sessions.length === 0 && (
                <p className="px-6 py-8 text-sm text-slate-500">
                    No upcoming sessions are listed for this training.
                </p>
            )}
        </div>
    );
}
