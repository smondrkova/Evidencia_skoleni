import { readFile } from 'node:fs/promises';
import { parse } from 'csv-parse/sync';

export type CsvRow = { values: Record<string, string>; sourceRow: number };

const departmentNames: Record<string, string> = {
    studijni: 'Studijní oddělení',
    'studijni oddeleni': 'Studijní oddělení',
    'ekonomicke oddeleni': 'Ekonomické oddělení',
    'it oddeleni': 'IT oddělení',
    knihovna: 'Knihovna',
    'sprava budov': 'Správa budov',
    laboratore: 'Laboratoře',
    'personalni oddeleni': 'Personální oddělení',
    vedeni: 'Vedení',
    marketing: 'Marketing',
};

// Unify known department variants.
export function normalizeDepartment(value: string): string | null {
    const department = value.trim().replace(/\s+/g, ' ');
    if (!department) return null;
    const key = department
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/\s+/g, ' ');
    return departmentNames[key] ?? department;
}

const positionNames: Record<string, string> = {
    vedouci: 'Vedoucí',
    specialista: 'Specialista',
    asistent: 'Asistent',
    referent: 'Referent',
    ucetni: 'Účetní',
    vyvojar: 'Vývojář',
    technik: 'Technik',
    knihovnik: 'Knihovník',
    'technik udrzby': 'Technik údržby',
    ridic: 'Řidič',
    laborant: 'Laborant',
};

// Store known positions consistently.
export function normalizePosition(value: string): string {
    const position = value.trim().replace(/\s+/g, ' ');
    const key = position.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
    return positionNames[key] ?? position;
}

// Read CSV using its source encoding, check columns and remove helper rows and duplicates.
export async function readCsv(
    path: string,
    delimiter: string,
    encoding: string,
    required: string[],
): Promise<CsvRow[]> {
    const text = new TextDecoder(encoding, { fatal: true }).decode(await readFile(path));
    const records: string[][] = parse(text, { delimiter, bom: true, skip_empty_lines: true });

    const headers = records.shift() ?? [];
    if (
        new Set(headers).size !== headers.length ||
        required.some((header) => !headers.includes(header))
    ) {
        throw new Error(`${path}: missing or duplicate headers`);
    }
    const seen = new Set<string>();
    const rows: CsvRow[] = [];
    for (const [index, cells] of records.entries()) {
        const first = cells[0]?.trim() ?? '';
        if (
            !first ||
            first.startsWith('#') ||
            first === headers[0] ||
            first.toLowerCase() === 'celkem'
        )
            continue;
        if (cells.length !== headers.length)
            throw new Error(`${path}: invalid record ${index + 2}`);

        const key = JSON.stringify(cells);
        if (seen.has(key)) {
            console.warn(`${path}: removed duplicate record ${index + 2}`);
            continue;
        }
        seen.add(key);
        rows.push({
            values: Object.fromEntries(headers.map((header, i) => [header, cells[i].trim()])),
            sourceRow: index + 2,
        });
    }
    return rows;
}

// Check and format dates to reject invalid days.
export function checkDate(value: string): string | null {
    const match =
        /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) ??
        /^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})$/.exec(value);
    if (!match) return null;
    const iso = value.includes('-');
    const year = Number(match[iso ? 1 : 3]);
    const month = Number(match[2]);
    const day = Number(match[iso ? 3 : 1]);
    const date = new Date(0);
    date.setUTCFullYear(year, month - 1, day);
    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    )
        return null;
    return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Parse prices without turning missing values into zero.
export function parsePrice(value: string): number | null {
    if (!value) return null;
    if (value.toLowerCase() === 'zdarma') return 0;
    const cleaned = value
        .replace(/\s/g, '')
        .replace(/Kč$/i, '')
        .replace(/,-$/, '')
        .replace(',', '.');
    if (!/^-?\d+(\.\d{1,2})?$/.test(cleaned)) return null;
    const price = Number(cleaned);
    return Number.isFinite(price) ? price : null;
}

// Parse whole nonnegative counts for capacity and occupancy.
export function parseCount(value: string): number | null {
    return /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) ? Number(value) : null;
}

// Find repeated IDs so all conflicting records can be flagged.
export function conflictingIds(rows: CsvRow[], field: string): Set<string> {
    const seen = new Set<string>();
    const conflicts = new Set<string>();
    for (const { values } of rows) {
        const id = values[field];
        if (seen.has(id)) conflicts.add(id);
        seen.add(id);
    }
    return conflicts;
}

// Report missing or invalid data.
export function warn(file: string, id: string, reasons: string[]): void {
    if (reasons.length) console.warn(`${file} ${id}: ${reasons.join('; ')}`);
}

// Trim and uppercase codes without fixing possible typos.
export function trainingCode(value: string): string {
    return value.trim().toUpperCase();
}

// Capitalize each name part for consistent display.
export function formatName(value: string): string {
    return value
        .trim()
        .toLowerCase()
        .replace(/\p{L}+/gu, (part) => part.charAt(0).toUpperCase() + part.slice(1));
}
