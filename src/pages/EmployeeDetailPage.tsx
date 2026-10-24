import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { employees } from '../employee-data';
import { trainings, completions } from '../training-data';
import { EmployeeDetail } from '../components/employees/EmployeeDetail';
import { EmployeeTrainingTable } from '../components/employees/EmployeeTrainingTable';

const referenceDate = '2026-10-01';

// Resolve the employee from the URL and handle missing or ambiguous identifiers.
export function EmployeeDetailPage() {
    const { employeeId } = useParams();
    const matches = employees.filter((employee) => employee.id === employeeId);
    const employee = matches.length === 1 ? matches[0] : null;
    const employeeRecords = employee
        ? completions.filter((record) => record.employeeId === employee.id)
        : [];
    const mainRef = useRef<HTMLElement>(null);

    useEffect(() => {
        mainRef.current?.focus();
    }, [employeeId]);

    return (
        <main
            ref={mainRef}
            tabIndex={-1}
            className="mx-auto max-w-6xl px-5 py-9 focus:outline-none sm:px-8 sm:py-12"
        >
            <Link
                to="/"
                className="mb-6 inline-block rounded text-sm font-medium text-blue-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
                <span aria-hidden="true">← </span>Back to employees
            </Link>
            <h1 className="mb-6 text-3xl font-semibold tracking-tight">Employee details</h1>
            {employee ? (
                <>
                    <EmployeeDetail employee={employee} />
                    <EmployeeTrainingTable
                        trainings={trainings}
                        records={employeeRecords}
                        referenceDate={referenceDate}
                    />
                </>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-6">
                    <h2 className="font-semibold">
                        {matches.length > 1 ? 'Employee ID needs review' : 'Employee not found'}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {matches.length > 1
                            ? 'More than one employee has this ID. The details cannot be identified reliably.'
                            : 'No employee matches this address. Return to the directory and choose an employee.'}
                    </p>
                </div>
            )}
        </main>
    );
}
