import { useEffect, useRef } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { trainings, sessions } from '../app-data';
import { formatDate } from '../utils/formatDate';
import { formatTrainingRequirement, formatTrainingValidity } from '../utils/formatTraining';
import { TrainingSessionsTable } from '../components/trainings/TrainingSessionsTable';

const referenceDate = '2026-10-01';

export function TrainingDetailPage() {
    const { trainingCode } = useParams();
    const location = useLocation();
    const employeeId =
        typeof location.state?.employeeId === 'string' ? location.state.employeeId : null;
    const backPath = employeeId ? `/employees/${encodeURIComponent(employeeId)}` : '/trainings';
    const training = trainings.find((item) => item.code === trainingCode);
    const mainRef = useRef<HTMLElement>(null);
    const trainingSessions = sessions.filter((session) => session.trainingCode === trainingCode);
    const upcomingSessions = trainingSessions
        .filter((session) => session.date && session.date >= referenceDate)
        .sort(
            (a, b) =>
                a.date!.localeCompare(b.date!) ||
                (a.startTime ?? '').localeCompare(b.startTime ?? '') ||
                a.id.localeCompare(b.id),
        );
    const missingDateCount = trainingSessions.filter((session) => !session.date).length;

    useEffect(() => {
        mainRef.current?.focus();
    }, [trainingCode]);

    return (
        <main
            ref={mainRef}
            tabIndex={-1}
            className="mx-auto max-w-6xl px-5 py-9 focus:outline-none sm:px-8 sm:py-12"
        >
            <Link
                to={backPath}
                className="mb-6 inline-block rounded text-sm font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
                <span aria-hidden="true">← </span>
                {employeeId ? 'Back to employee' : 'Back to trainings'}
            </Link>
            <h1 className="mb-6 text-3xl font-semibold tracking-tight">Training details</h1>
            {training ? (
                <>
                    <section
                        aria-labelledby="training-title"
                        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
                    >
                        <p className="mb-2 text-xs font-semibold tracking-wider text-blue-600">
                            {training.code}
                        </p>
                        <h2
                            id="training-title"
                            className="text-2xl font-semibold tracking-tight"
                        >
                            {training.name}
                        </h2>
                        <dl className="mt-6 grid gap-6 sm:grid-cols-2">
                            <div>
                                <dt className="text-xs text-slate-500">Validity period</dt>
                                <dd className="mt-1 text-sm font-medium">
                                    {formatTrainingValidity(training.validity)}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-500">Required for</dt>
                                <dd className="mt-1 text-sm font-medium">
                                    {formatTrainingRequirement(training.requirement)}
                                </dd>
                            </div>
                        </dl>
                        {training.validity.type === 'unknown' && (
                            <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                                The catalog validity needs review. Missing or zero validity does not
                                mean unlimited validity.
                            </p>
                        )}
                    </section>
                    <section
                        aria-labelledby="upcoming-sessions-heading"
                        className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                        <div className="border-b border-slate-200 px-6 py-5">
                            <h2
                                id="upcoming-sessions-heading"
                                className="text-lg font-semibold"
                            >
                                Upcoming sessions
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Sessions on or after {formatDate(referenceDate)}, including full,
                                cancelled and flagged records. This is a catalog overview, not a
                                booking.
                            </p>
                        </div>
                        <TrainingSessionsTable sessions={upcomingSessions} />
                    </section>
                    {missingDateCount > 0 && (
                        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                            Sessions without a valid date: {missingDateCount}. They need review and
                            cannot be listed as upcoming.
                        </p>
                    )}
                </>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="font-semibold">Training not found</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        No catalog training matches this address. Return to the catalog and choose a
                        training.
                    </p>
                </div>
            )}
        </main>
    );
}
