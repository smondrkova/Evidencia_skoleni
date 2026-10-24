import { useState } from 'react';
import type { TrainingRecommendation } from '../../domain/recommendations';
import { formatDate } from '../../utils/formatDate';

type SuggestedSessionsDialogProps = {
    recommendation: TrainingRecommendation;
    trainingName: string;
};

export function SuggestedSessionsDialog({
    recommendation,
    trainingName,
}: SuggestedSessionsDialogProps) {
    const [open, setOpen] = useState(false);
    const selectedSession = recommendation.session;

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={`rounded text-left font-medium hover:underline focus-visible:outline-2 focus-visible:outline-blue-600 ${
                    selectedSession ? 'text-blue-700' : 'text-amber-800'
                }`}
            >
                {selectedSession
                    ? `${formatDate(selectedSession.date)} · ${selectedSession.startTime}–${selectedSession.endTime}`
                    : 'No suitable session'}
                <span className="mt-1 block text-xs font-normal text-slate-500">
                    {selectedSession ? 'View alternatives' : 'View explanation'}
                </span>
            </button>
            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
                    role="presentation"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setOpen(false);
                    }}
                >
                    <section
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="suggested-session-title"
                        tabIndex={-1}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') setOpen(false);
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
                                    {trainingName} · employee {recommendation.employeeId}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded px-2 py-1 text-sm text-slate-500 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-600"
                            >
                                Close
                            </button>
                        </div>
                        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
                            {recommendation.selectionReason}
                        </p>
                        <div className="mt-5 space-y-3">
                            {recommendation.alternatives.map((session) => {
                                const isSelected = session.id === selectedSession?.id;
                                return (
                                    <div
                                        key={session.id}
                                        className={`rounded-lg border p-4 ${
                                            isSelected
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-slate-200'
                                        }`}
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div>
                                                <p className="font-medium">
                                                    {formatDate(session.date)} · {session.startTime}
                                                    –{session.endTime}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-600">
                                                    {session.location} · {session.id}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800">
                                                    Suggested
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-2 text-xs text-slate-500">
                                            {session.occupied} / {session.capacity} places occupied
                                            · {session.capacity! - session.occupied!} places
                                            available
                                        </p>
                                    </div>
                                );
                            })}
                            {recommendation.alternatives.length === 0 && (
                                <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                                    {recommendation.selectionReason}
                                </p>
                            )}
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
