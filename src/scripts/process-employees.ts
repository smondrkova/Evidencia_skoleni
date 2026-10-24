import type { Employee, EmployeeStatus } from '../types/employee.js';
import { checkDate, conflictingIds, formatName, normalizeDepartment, normalizePosition, warn, type CsvRow } from './utils.ts';

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

        const invalidEndDate = row.datum_ukonceni && !endDate;
        const reversedDates = startDate && endDate && endDate < startDate;

        const reasons: string[] = [];
        if (!row.id_zamestnance) reasons.push('Employee ID is missing.');
        if (!row.jmeno) reasons.push('First name is missing.');
        if (!row.prijmeni) reasons.push('Last name is missing.');
        if (!row.pozice) reasons.push('Position is missing.');
        if (conflicts.has(row.id_zamestnance)) reasons.push('Employee ID is shared by conflicting records.');
        if (status === 'unknown') reasons.push('Employment status is missing or not recognized.');
        if (!startDate) reasons.push(row.datum_nastupu ? 'Start date is invalid.' : 'Start date is missing.');
        if (invalidEndDate) reasons.push('End date is invalid.');
        if (reversedDates) reasons.push('End date is earlier than start date.');

        if (!row.utvar) {
            reasons.push('Department is missing.');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
            reasons.push('Email is missing or has an invalid format.');
        }
        const startsInFuture = startDate && startDate > referenceDate;
        const terminatedWithoutPastEndDate = status === 'terminated' && (!endDate || endDate > referenceDate);
        const ongoingWithPastEndDate = status !== 'terminated' && endDate && endDate < referenceDate;
        if (startsInFuture) reasons.push(`Start date is after the reference date (${referenceDate}).`);
        if (terminatedWithoutPastEndDate) reasons.push(`Employment is marked as terminated, but the end date is missing or after ${referenceDate}.`);
        if (ongoingWithPastEndDate) reasons.push(`Employment is not marked as terminated, but the end date is before ${referenceDate}.`);
        
        warn('zamestnanci', row.id_zamestnance, reasons);

        return {
            id: row.id_zamestnance,
            firstName: formatName(row.jmeno),
            lastName: formatName(row.prijmeni),
            email: row.email.toLowerCase(),
            department: normalizeDepartment(row.utvar),
            position: normalizePosition(row.pozice),
            managerEmail: row.vedouci_email.toLowerCase() || null,
            startDate,
            endDate,
            status,
            reviewRequired: reasons.length > 0,
            reviewReasons: reasons,
        };
    });

    // Check emails and managers after all employees are available.
    for (const employee of employees) {
        const reasons: string[] = [];
        const emailMatches = employees.filter(other => other.email === employee.email);
        const managerMatches = employees.filter(other => other.email === employee.managerEmail);
        if (emailMatches.length > 1) {
            reasons.push('Email is shared by more than one employee.');
        }
        if (!employee.managerEmail) reasons.push('Manager email is missing.');
        else if (managerMatches.length === 0) reasons.push('Manager email does not match any employee.');
        else if (managerMatches.length > 1) reasons.push('Manager email matches multiple employees.');
        employee.reviewReasons.push(...reasons);
        employee.reviewRequired = employee.reviewReasons.length > 0;
        warn('zamestnanci', employee.id, reasons);
    }

    return employees;
}

