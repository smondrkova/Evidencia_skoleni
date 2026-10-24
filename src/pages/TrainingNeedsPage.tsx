import { employees, trainings, completions, sessions } from '../app-data';
import { getTrainingPriorities } from '../domain/priorities';
import { getTrainingRecommendations } from '../domain/recommendations';
import { formatDate } from '../utils/formatDate';
import { TrainingNeedsTable } from '../components/planning/TrainingNeedsTable';
import { PriorityReviewsTable } from '../components/planning/PriorityReviewsTable';

const referenceDate = '2026-10-01';

// Show planning needs separately from cases that cannot yet be handled automatically.
export function TrainingNeedsPage() {
    const planningEmployees = employees.filter((employee) => employee.status !== 'terminated');
    const { priorities, reviews } = getTrainingPriorities(
        planningEmployees,
        trainings,
        completions,
        referenceDate,
    );
    const recommendations = getTrainingRecommendations(
        priorities,
        planningEmployees,
        sessions,
        referenceDate,
    );
    const urgentCount = priorities.filter((item) => item.priority === 1).length;

    return (
        <main className="mx-auto max-w-screen-2xl px-5 py-9 sm:px-8 sm:py-12">
            <p className="mb-2 text-xs font-semibold tracking-widest text-blue-600">PLANNING</p>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-3xl font-semibold tracking-tight">Training needs</h1>
                <p className="text-sm text-slate-500">As of {formatDate(referenceDate)}</p>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500">
                Required training needs for currently active employees. Missing and expired
                trainings come first, followed by trainings expiring within 30 days.
            </p>
            <p className="mt-3 text-xs text-slate-500">
                Terminated employees are excluded from automatic priorities.
            </p>
            <section
                aria-labelledby="training-needs-heading"
                className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
                <div className="border-b border-slate-200 px-6 py-5">
                    <h2
                        id="training-needs-heading"
                        className="text-lg font-semibold"
                    >
                        Prioritized needs ({priorities.length})
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Urgent: {urgentCount} · Expiring soon: {priorities.length - urgentCount}.
                        Missing records come first within the urgent group, then the oldest expiry
                        dates.
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                        Suggested sessions account for available capacity and overlaps for the same
                        employee. They are proposals for review, not confirmed bookings.
                    </p>
                </div>
                <TrainingNeedsTable
                    priorities={priorities}
                    recommendations={recommendations}
                    employees={planningEmployees}
                    trainings={trainings}
                />
            </section>
            <section
                aria-labelledby="priority-reviews-heading"
                className="mt-8 overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm"
            >
                <div className="border-b border-amber-200 bg-amber-50 px-6 py-5">
                    <h2
                        id="priority-reviews-heading"
                        className="text-lg font-semibold text-amber-900"
                    >
                        Needs review ({reviews.length})
                    </h2>
                    <p className="mt-1 text-sm text-amber-800">
                        These cases are excluded from automatic planning until the underlying data
                        is clarified.
                    </p>
                </div>
                <PriorityReviewsTable
                    reviews={reviews}
                    employees={planningEmployees}
                    trainings={trainings}
                />
            </section>
        </main>
    );
}
