import type { Training, TrainingSession, TrainingSessionStatus } from '../types/training.js';
import { checkDate, conflictingIds, parseCount, parsePrice, trainingCode, warn, type CsvRow } from './utils.ts';

// Prepare sessions and flag records that need review.
export function processSessions(rows: CsvRow[], catalog: Training[], referenceDate: string): TrainingSession[] {
    const conflicts = conflictingIds(rows, 'id_terminu');
    const signatures = rows.map(({ values: row }) => JSON.stringify([
        trainingCode(row.kod_skoleni),
        checkDate(row.datum) ?? row.datum,
        row.cas,
        row.misto.toLowerCase(),
    ]));

    const statuses: Record<string, TrainingSessionStatus> = {
        'plánováno': 'planned',
        'zrušeno': 'cancelled',
    };

    return rows.map(({ values: row }, index) => {
        const reasons: string[] = [];

        const code = trainingCode(row.kod_skoleni);
        const date = checkDate(row.datum);

        const times = /^(\d{2}:\d{2})-(\d{2}:\d{2})$/.exec(row.cas);
        const timeFormat = /^([01]\d|2[0-3]):[0-5]\d$/;
        const validTimes = times
            && timeFormat.test(times[1])
            && timeFormat.test(times[2])
            && times[1] < times[2];

        const capacity = parseCount(row.kapacita);
        const occupied = parseCount(row.obsazeno);
        const pricePerPerson = parsePrice(row.cena_na_osobu);
        const status = statuses[row.stav] ?? 'unknown';

        if (!row.id_terminu || conflicts.has(row.id_terminu)) {
            reasons.push('missing or conflicting ID');
        }
        if (!catalog.some(training => training.code === code)) {
            reasons.push('unknown training code');
        }

        if (!date) {
            reasons.push('invalid date');
        } else if (date < referenceDate) {
            reasons.push('past session');
        }
        if (!validTimes) {
            reasons.push('invalid time range');
        }
        if (!row.misto) {
            reasons.push('missing location');
        }

        if (capacity === null || occupied === null || capacity === 0 || occupied > capacity) {
            reasons.push('invalid capacity or occupancy');
        }
        if ((row.cena_na_osobu && pricePerPerson === null) || (pricePerPerson !== null && pricePerPerson < 0)) {
            reasons.push('invalid or negative price');
        }

        if (status === 'unknown') {
            reasons.push('unknown status');
        }
        const matchingSessions = signatures.filter(signature => signature === signatures[index]);
        if (matchingSessions.length > 1) {
            reasons.push('possible duplicate session; capacity needs review');
        }

        warn('terminy_skoleni', row.id_terminu, reasons);
        
        return {
            id: row.id_terminu,
            trainingCode: code,
            date,
            startTime: validTimes ? times[1] : null,
            endTime: validTimes ? times[2] : null,
            location: row.misto,
            capacity,
            occupied,
            pricePerPerson,
            status,
            reviewRequired: reasons.length > 0,
        };
    });
}

