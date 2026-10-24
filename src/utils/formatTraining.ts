import type { TrainingRequirement, TrainingValidity } from '../types/training';

export function formatTrainingValidity(validity: TrainingValidity): string {
    return validity.type === 'months'
        ? `${validity.months} ${validity.months === 1 ? 'month' : 'months'}`
        : 'Unknown validity';
}

export function formatTrainingRequirement(requirement: TrainingRequirement): string {
    switch (requirement.type) {
        case 'everyone':
            return 'Required for all employees';
        case 'departments':
            return `Departments: ${requirement.department.join(', ')}`;
        case 'positions':
            return `Positions: ${requirement.position.join(', ')}`;
        case 'optional':
            return 'Optional training';
        case 'unknown':
            return 'Requirement needs review';
    }
}
