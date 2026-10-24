import { format, isValid, parseISO } from 'date-fns';

// Use one display format for dates and a dash for missing or invalid values.
export function formatDate(value: string | null | undefined): string {
    if (!value) return '—';
    const date = parseISO(value);
    return isValid(date) ? format(date, 'dd. MM. yyyy') : '—';
}
