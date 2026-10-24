import type { TrainingSession } from '../../types/training';
import { getAvailableSessions } from '../../domain/planner';
import { formatDate } from '../../utils/formatDate';

type AvailableSessionsProps = {
    trainingCode: string;
    trainingName: string;
    sessions: TrainingSession[];
    referenceDate: string;
};

const priceFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CZK' });

export function AvailableSessions({
    trainingCode,
    trainingName,
    sessions,
    referenceDate,
}: AvailableSessionsProps) {
    const availableSessions = getAvailableSessions(trainingCode, sessions, referenceDate);

    return (
        <details className="rounded-lg border border-slate-200 bg-slate-50/60">
            <summary className="cursor-pointer rounded-lg px-4 py-3 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
                Available sessions ({availableSessions.length})
                <span className="sr-only"> for {trainingName}</span>
            </summary>
            <div className="border-t border-slate-200 p-4">
                {availableSessions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <caption className="sr-only">
                                Available sessions for {trainingName}
                            </caption>
                            <thead className="text-xs text-slate-500">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-3 py-2"
                                    >
                                        Date
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-2"
                                    >
                                        Time
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-2"
                                    >
                                        Location
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-2"
                                    >
                                        Available places
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-3 py-2"
                                    >
                                        Price per person
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {availableSessions.map((session) => (
                                    <tr key={session.id}>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {formatDate(session.date)}
                                            <span className="mt-1 block text-xs text-slate-500">
                                                {session.id}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {session.startTime}–{session.endTime}
                                        </td>
                                        <td className="px-3 py-3">{session.location}</td>
                                        <td className="px-3 py-3">
                                            {session.capacity! - session.occupied!} /{' '}
                                            {session.capacity}
                                        </td>
                                        <td className="px-3 py-3 whitespace-nowrap">
                                            {session.pricePerPerson === null
                                                ? 'Not provided'
                                                : priceFormat.format(session.pricePerPerson)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-slate-600">
                        No available sessions: there are no planned sessions with valid data and
                        free places on or after {formatDate(referenceDate)}.
                    </p>
                )}
            </div>
        </details>
    );
}
