import type { Employee } from '../types/employee.js';
import type { TrainingRequirement } from '../types/training.js';

export type RequirementResult = {
    status: 'required' | 'optional' | 'unknown';
    reason: string;
};

export function getTrainingRequirement(
    employee: Employee,
    requirement: TrainingRequirement,
): RequirementResult {
    switch (requirement.type) {
        case 'everyone':
            return { status: 'required', reason: 'Required for all employees.' };

        case 'optional':
            return { status: 'optional', reason: 'Optional training.' };

        case 'departments': {
            if (!employee.department?.trim()) {
                return {
                    status: 'unknown',
                    reason: 'Department is missing. The training requirement needs review.',
                };
            }
            if (
                requirement.department.length === 0 ||
                requirement.department.some((department) => !department.trim())
            ) {
                return {
                    status: 'unknown',
                    reason: 'The department rule is incomplete and needs review.',
                };
            }
            const matches = requirement.department.includes(employee.department);
            return matches
                ? { status: 'required', reason: `Required for department: ${employee.department}.` }
                : { status: 'optional', reason: 'Not required for this department.' };
        }

        case 'positions': {
            if (!employee.position.trim()) {
                return {
                    status: 'unknown',
                    reason: 'Position is missing. The training requirement needs review.',
                };
            }
            if (
                requirement.position.length === 0 ||
                requirement.position.some((position) => !position.trim())
            ) {
                return {
                    status: 'unknown',
                    reason: 'The position rule is incomplete and needs review.',
                };
            }
            const matches = requirement.position.includes(employee.position);
            return matches
                ? { status: 'required', reason: `Required for position: ${employee.position}.` }
                : { status: 'optional', reason: 'Not required for this position.' };
        }

        case 'unknown':
            return { status: 'unknown', reason: 'The catalog training requirement is unknown.' };
    }
}
