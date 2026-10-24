import type { Employee } from '../types/employee.js';
import type { Training, TrainingCompletion } from '../types/training.js';
import { checkDate, conflictingIds, parsePrice, trainingCode, warn, type CsvRow } from './utils.ts';

export function processCompletions(
    rows: CsvRow[],
    employees: Employee[],
    catalog: Training[],
    referenceDate: string,
): TrainingCompletion[] {
    const conflicts = conflictingIds(rows, 'id_zaznamu');
    const employeeIds = new Set(employees
        .filter(employee => employee.id && employees.filter(other => other.id === employee.id).length === 1)
        .map(employee => employee.id));
    return rows.map(({ values: row, sourceRow }) => {
        const reasons: string[] = [];
        const code = trainingCode(row.kod_skoleni);
        const training = catalog.find(item => item.code === code);
        const completionDate = checkDate(row.datum_absolvovani);
        const validUntil = checkDate(row.platnost_do);
        const price = parsePrice(row.cena_kc);

        if (!row.id_zaznamu || conflicts.has(row.id_zaznamu)) {
            reasons.push('missing or conflicting ID');
        }
        if (!employeeIds.has(row.id_zamestnance)) {
            reasons.push('unknown or ambiguous employee');
        }
        if (!training) {
            reasons.push('unknown training code');
        }

        if (!completionDate || completionDate < '1901-01-01' || completionDate > referenceDate) {
            reasons.push('invalid, suspicious or future completion date');
        }
        if (!validUntil || (completionDate && validUntil < completionDate)) {
            reasons.push('missing, invalid or reversed validity date');
        }
        if (training?.validity.type === 'unknown') {
            reasons.push('unknown catalog validity');
        }

        if ((row.cena_kc && price === null) || (price !== null && price < 0)) {
            reasons.push('invalid or negative price');
        }
        
        warn('absolvovana_skoleni', `${row.id_zaznamu} (record ${sourceRow})`, reasons);

        return {
            id: row.id_zaznamu,
            employeeId: row.id_zamestnance,
            trainingCode: code,
            completionDate,
            validUntil,
            provider: row.poskytovatel,
            price,
            note: row.poznamka || null,
            sourceRow,
            reviewRequired: reasons.length > 0,
        };
    });
}

