import type { Training, TrainingRequirement, TrainingValidity } from '../types/training.js';
import { conflictingIds, normalizeDepartment, parseCount, trainingCode, warn, type CsvRow } from './utils.ts';

// Read training requirements and flag unknown rules.
function parseRequirement(value: string): TrainingRequirement {
    if (value === 'VSICHNI') return { type: 'everyone' };
    if (value === 'NEPOVINNE') return { type: 'optional' };

    const [prefix, list] = value.split(':');
    const items = list?.split(';').map(item => item.trim());
    if (items?.length && items.every(Boolean)) {
        if (prefix === 'UTVAR') {
            const departments = items.map(item => normalizeDepartment(item) ?? item);
            return { type: 'departments', department: [...new Set(departments)] };
        }
        if (prefix === 'POZICE') return { type: 'positions', position: items };
    }
    return {
        type: 'unknown',
    };
}

export function processCatalog(rows: CsvRow[]): Training[] {
    const conflicts = conflictingIds(rows, 'kod');
    const seen = new Set<string>();
    return rows.map(({ values: row }) => {
        const code = trainingCode(row.kod);
        const missingFields = !code || !row.nazev;
        const conflictingCode = conflicts.has(row.kod) || seen.has(code);
        if (missingFields || conflictingCode) {
            throw new Error(`katalog: missing fields or conflicting code ${code}`);
        }
        seen.add(code);

        const months = row.platnost_mesicu === '2 roky' ? 24 : parseCount(row.platnost_mesicu);
        const validity: TrainingValidity = months && months > 0 ? { type: 'months', months } : { type: 'unknown' };
        const requirement = parseRequirement(row.povinne_pro);

        const reasons: string[] = [];
        if (validity.type === 'unknown') {
            reasons.push('unknown validity (including zero)');
        }
        if (requirement.type === 'unknown') {
            reasons.push('unknown requirement');
        }
        warn('katalog', code, reasons);

        return {
            code,
            name: row.nazev,
            validity,
            requirement,
        };
    });
}

