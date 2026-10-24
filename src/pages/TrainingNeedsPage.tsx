import { useState } from 'react';
import { employees, trainings, completions, sessions } from '../app-data';
import type { TrainingPriority } from '../domain/priorities';
import { getTrainingPriorities } from '../domain/priorities';
import { getTrainingRecommendations } from '../domain/recommendations';
import { formatDate } from '../utils/formatDate';
import { TrainingNeedsTable } from '../components/planning/TrainingNeedsTable';
import { PriorityReviewsTable } from '../components/planning/PriorityReviewsTable';

const referenceDate = '2026-10-01';

type PriorityStatus = TrainingPriority['status'] | '';

const emptyFilters = {
    employee: '',
    trainingCode: '',
    status: '' as PriorityStatus,
    priority: '' as '' | '1' | '2',
};

export function TrainingNeedsPage() {
    const [filters, setFilters] = useState(emptyFilters);
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
    const filteredPriorities = priorities.filter((item) => {
        const employee = planningEmployees.find((person) => person.id === item.employeeId);
        const employeeQuery = filters.employee.trim().toLocaleLowerCase();
        const employeeText = employee
            ? `${employee.firstName} ${employee.lastName} ${employee.id}`.toLocaleLowerCase()
            : item.employeeId.toLocaleLowerCase();
        return (
            (!employeeQuery || employeeText.includes(employeeQuery)) &&
            (!filters.trainingCode || item.trainingCode === filters.trainingCode) &&
            (!filters.status || item.status === filters.status) &&
            (!filters.priority || String(item.priority) === filters.priority)
        );
    });
    const filteredRecommendations = recommendations.filter((recommendation) =>
        filteredPriorities.some(
            (item) =>
                item.employeeId === recommendation.employeeId &&
                item.trainingCode === recommendation.trainingCode,
        ),
    );
    const urgentCount = filteredPriorities.filter((item) => item.priority === 1).length;
    const hasFilters = Boolean(
        filters.employee || filters.trainingCode || filters.status || filters.priority,
    );

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
                        Prioritized needs ({filteredPriorities.length})
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Urgent: {urgentCount} · Expiring soon:{' '}
                        {filteredPriorities.length - urgentCount}. Missing records come first within
                        the urgent group, then the oldest expiry dates.
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                        Suggested sessions account for available capacity and overlaps for the same
                        employee. They are proposals for review, not confirmed bookings.
                    </p>
                </div>
                <div className="grid gap-4 border-b border-slate-200 bg-slate-50/50 px-6 py-4 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                    <label className="block text-xs font-medium text-slate-600">
                        Employee
                        <input
                            type="search"
                            value={filters.employee}
                            onChange={(event) =>
                                setFilters({ ...filters, employee: event.target.value })
                            }
                            placeholder="Search name or ID"
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-2 focus:outline-blue-500"
                        />
                    </label>
                    <label className="block text-xs font-medium text-slate-600">
                        Training
                        <select
                            value={filters.trainingCode}
                            onChange={(event) =>
                                setFilters({ ...filters, trainingCode: event.target.value })
                            }
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-2 focus:outline-blue-500"
                        >
                            <option value="">All trainings</option>
                            {trainings.map((training) => (
                                <option
                                    key={training.code}
                                    value={training.code}
                                >
                                    {training.name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="block text-xs font-medium text-slate-600">
                        Validity
                        <select
                            value={filters.status}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    status: event.target.value as PriorityStatus,
                                })
                            }
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-2 focus:outline-blue-500"
                        >
                            <option value="">All validity states</option>
                            <option value="missing">Missing record</option>
                            <option value="expired">Expired</option>
                            <option value="expiringSoon">Expiring soon</option>
                        </select>
                    </label>
                    <label className="block text-xs font-medium text-slate-600">
                        Priority
                        <select
                            value={filters.priority}
                            onChange={(event) =>
                                setFilters({
                                    ...filters,
                                    priority: event.target.value as '' | '1' | '2',
                                })
                            }
                            className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-2 focus:outline-blue-500"
                        >
                            <option value="">All priorities</option>
                            <option value="1">1 · Urgent</option>
                            <option value="2">2 · Expiring soon</option>
                        </select>
                    </label>
                    <button
                        type="button"
                        onClick={() => setFilters(emptyFilters)}
                        disabled={!hasFilters}
                        className="self-end rounded-lg px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-default disabled:text-slate-400 disabled:hover:bg-transparent"
                    >
                        Clear filters
                    </button>
                </div>
                <TrainingNeedsTable
                    priorities={filteredPriorities}
                    recommendations={filteredRecommendations}
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
