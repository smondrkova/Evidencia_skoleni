import type { Employee, EmployeeStatus } from '../types/employee.js';
import { checkDate, conflictingIds, formatName, normalizeDepartment, warn, type CsvRow } from './utils.ts';

// Prepare employees and flag data that needs review.
export function processEmployees(rows: CsvRow[], referenceDate: string): Employee[] {
    const conflicts = conflictingIds(rows, 'id_zamestnance');
    const statuses: Record<string, EmployeeStatus> = {
        'aktivní': 'active',
        'ukončen': 'terminated',
        'rodičovská': 'parentalLeave',
    };

    const employees = rows.map(({ values: row }) => {
        const startDate = checkDate(row.datum_nastupu);
        const endDate = checkDate(row.datum_ukonceni);
        const status = statuses[row.stav] ?? 'unknown';

        const missingFields = !row.id_zamestnance || !row.jmeno || !row.prijmeni || !row.pozice;
        const invalidEndDate = row.datum_ukonceni && !endDate;
        const reversedDates = startDate && endDate && endDate < startDate;

        const reasons: string[] = [];
        if (missingFields) reasons.push('missing required fields');
        if (conflicts.has(row.id_zamestnance)) reasons.push('conflicting employee ID');
        if (status === 'unknown') reasons.push('unknown employment status');
        if (!startDate) reasons.push('missing or invalid start date');
        if (invalidEndDate) reasons.push('invalid end date');
        if (reversedDates) reasons.push('end date precedes start date');

        if (!row.utvar) {
            reasons.push('missing department');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            reasons.push('invalid email; preserved for review');
        }
        const startsInFuture = startDate && startDate > referenceDate;
        const terminatedWithoutPastEndDate = status === 'terminated' && (!endDate || endDate > referenceDate);
        const ongoingWithPastEndDate = status !== 'terminated' && endDate && endDate < referenceDate;
        if (startsInFuture || terminatedWithoutPastEndDate || ongoingWithPastEndDate) {
            reasons.push('employment status/date needs review');
        }
        
        warn('zamestnanci', row.id_zamestnance, reasons);

        return {
            id: row.id_zamestnance,
            firstName: formatName(row.jmeno),
            lastName: formatName(row.prijmeni),
            email: row.email.toLowerCase(),
            department: normalizeDepartment(row.utvar),
            position: row.pozice,
            managerEmail: row.vedouci_email.toLowerCase() || null,
            startDate,
            endDate,
            status,
            reviewRequired: reasons.length > 0,
        };
    });

    // Check emails and managers after all employees are available.
    for (const employee of employees) {
        const reasons: string[] = [];
        const emailMatches = employees.filter(other => other.email === employee.email);
        const managerMatches = employees.filter(other => other.email === employee.managerEmail);
        if (emailMatches.length > 1) {
            reasons.push('duplicate email');
        }
        if (!employee.managerEmail || managerMatches.length !== 1) {
            reasons.push('missing, unknown or ambiguous manager');
        }
        if (reasons.length > 0) employee.reviewRequired = true;
        warn('zamestnanci', employee.id, reasons);
    }

    return employees;
}

