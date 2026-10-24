import type { Employee } from '../types/employee.js';
import type { Training, TrainingCompletion } from '../types/training.js';
import { getTrainingRequirement } from './requirements.ts';
import { getReferenceDate, getTrainingValidity } from './validity.ts';

export type TrainingPriority = {
    employeeId: string;
    trainingCode: string;
    status: 'missing' | 'expired' | 'expiringSoon';
    priority: 1 | 2;
    validUntil: string | null;
    reason: string;
};

export type PriorityReview = {
    employeeId: string;
    trainingCode: string | null;
    reason: string;
};

export function getTrainingPriorities(
    employees: Employee[],
    trainings: Training[],
    completions: TrainingCompletion[],
    referenceDate: string,
): { priorities: TrainingPriority[]; reviews: PriorityReview[] } {
    getReferenceDate(referenceDate);
    const priorities: TrainingPriority[] = [];
    const reviews: PriorityReview[] = [];

    for (const employee of employees) {
        const duplicateId = employees.filter((other) => other.id === employee.id).length > 1;
        if (!employee.id || duplicateId || employee.status === 'unknown' || !employee.startDate) {
            reviews.push({
                employeeId: employee.id,
                trainingCode: null,
                reason: 'Employee ID, employment status or start date needs review before planning.',
            });
            continue;
        }
        if (
            employee.status !== 'active' ||
            employee.startDate > referenceDate ||
            (employee.endDate && employee.endDate < referenceDate)
        )
            continue;

        const records = completions.filter((record) => record.employeeId === employee.id);
        for (const training of trainings) {
            const requirement = getTrainingRequirement(employee, training.requirement);
            if (requirement.status === 'optional') continue;
            if (requirement.status === 'unknown') {
                reviews.push({
                    employeeId: employee.id,
                    trainingCode: training.code,
                    reason: requirement.reason,
                });
                continue;
            }
            const validity = getTrainingValidity(training, records, referenceDate);
            if (validity.status === 'valid') continue;
            if (validity.status === 'uncertain') {
                reviews.push({
                    employeeId: employee.id,
                    trainingCode: training.code,
                    reason: validity.reason,
                });
                continue;
            }
            const validUntil = validity.completion?.validUntil ?? null;
            priorities.push({
                employeeId: employee.id,
                trainingCode: training.code,
                status: validity.status,
                priority: validity.status === 'expiringSoon' ? 2 : 1,
                validUntil,
                reason:
                    validity.status === 'missing'
                        ? 'Required training has no recorded completion.'
                        : validity.status === 'expired'
                          ? `Required training expired on ${validUntil}.`
                          : `Required training expires on ${validUntil}, within 30 days.`,
            });
        }
    }

    priorities.sort(
        (a, b) =>
            a.priority - b.priority ||
            (a.validUntil ?? '').localeCompare(b.validUntil ?? '') ||
            a.employeeId.localeCompare(b.employeeId) ||
            a.trainingCode.localeCompare(b.trainingCode),
    );
    return { priorities, reviews };
}
