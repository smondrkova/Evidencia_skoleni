import type { Employee } from '../types/employee.js';
import type { TrainingSession } from '../types/training.js';
import type { TrainingPriority } from './priorities.ts';
import { getAvailableSessions } from './planner.ts';
import { getReferenceDate } from './validity.ts';

export type TrainingRecommendation = {
    employeeId: string;
    trainingCode: string;
    session: TrainingSession | null;
    alternatives: TrainingSession[];
    reason: string;
    selectionReason: string;
    remainingPlaces: number | null;
};

type AssignedSession = Pick<TrainingSession, 'date' | 'startTime' | 'endTime'>;

function sessionsOverlap(first: AssignedSession, second: AssignedSession): boolean {
    return (
        first.date === second.date &&
        first.startTime! < second.endTime! &&
        second.startTime! < first.endTime!
    );
}

function recommendationKey(employeeId: string, trainingCode: string): string {
    return `${employeeId}\u0000${trainingCode}`;
}

export function getTrainingRecommendations(
    priorities: TrainingPriority[],
    employees: Employee[],
    sessions: TrainingSession[],
    referenceDate: string,
): TrainingRecommendation[] {
    getReferenceDate(referenceDate);
    const remainingCapacity = new Map(
        sessions
            .filter(
                (session) =>
                    session.id !== '' && session.capacity !== null && session.occupied !== null,
            )
            .map((session) => [session.id, session.capacity! - session.occupied!]),
    );
    const assignedByEmployee = new Map<string, AssignedSession[]>();
    const recommendations = new Map<string, TrainingRecommendation>();

    for (const priority of priorities) {
        const employee = employees.find((item) => item.id === priority.employeeId);
        const available = getAvailableSessions(
            priority.trainingCode,
            sessions,
            referenceDate,
        ).filter((session) => {
            const capacity = remainingCapacity.get(session.id) ?? 0;
            const beforeEmploymentEnd =
                !employee?.endDate || !session.date || session.date <= employee.endDate;
            const hasNoConflict = !(assignedByEmployee.get(priority.employeeId) ?? []).some(
                (assigned) => sessionsOverlap(assigned, session),
            );
            return capacity > 0 && beforeEmploymentEnd && hasNoConflict;
        });

        const timely = priority.validUntil
            ? available.filter((session) => session.date! <= priority.validUntil!)
            : [];
        const session = timely[0] ?? available[0] ?? null;
        let reason: string;
        let selectionReason: string;
        let remainingPlaces: number | null = null;

        if (!session) {
            reason =
                available.length === 0
                    ? 'No suitable future session has free capacity and no time conflict.'
                    : 'No suitable session could be selected.';
            selectionReason = reason;
        } else {
            const hasGap = Boolean(priority.validUntil && session.date! > priority.validUntil);
            reason = hasGap
                ? `Recommended session is after the validity end (${priority.validUntil}); a gap in validity is possible.`
                : priority.reason;
            remainingPlaces = (remainingCapacity.get(session.id) ?? 1) - 1;
            selectionReason =
                priority.validUntil && session.date! <= priority.validUntil
                    ? `Selected the earliest available session before the validity end (${priority.validUntil}).`
                    : 'Selected the earliest available future session.';
            remainingCapacity.set(session.id, remainingPlaces);
            assignedByEmployee.set(priority.employeeId, [
                ...(assignedByEmployee.get(priority.employeeId) ?? []),
                session,
            ]);
        }

        recommendations.set(recommendationKey(priority.employeeId, priority.trainingCode), {
            employeeId: priority.employeeId,
            trainingCode: priority.trainingCode,
            session,
            alternatives: available,
            reason,
            selectionReason,
            remainingPlaces,
        });
    }

    return priorities.map((priority) => {
        const recommendation = recommendations.get(
            recommendationKey(priority.employeeId, priority.trainingCode),
        );
        if (!recommendation) {
            throw new Error('Training recommendation was not created for a priority.');
        }
        return recommendation;
    });
}
