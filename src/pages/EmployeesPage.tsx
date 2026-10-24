import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { employees } from '../app-data';
import { EmployeeTable } from '../components/employees/EmployeeTable';

function normalizeSearch(value: string): string {
    return value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

export function EmployeesPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const query = normalizeSearch(search.trim());
    const filteredEmployees = employees.filter((employee) =>
        normalizeSearch(
            [
                employee.firstName,
                employee.lastName,
                employee.id,
                employee.department,
                employee.position,
            ].join(' '),
        ).includes(query),
    );

    return (
        <>
            <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
                <div className="mb-8">
                    <p className="mb-2 text-xs font-semibold tracking-widest text-blue-600">
                        PEOPLE
                    </p>
                    <h1 className="text-3xl font-semibold tracking-tight">Employees</h1>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                        Browse the employee directory. Select a row to view contact and employment
                        details.
                    </p>
                </div>
                <section
                    aria-label="Employee directory"
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                    <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h2 className="font-semibold">All employees</h2>
                            <p
                                className="mt-1 text-xs text-slate-500"
                                role="status"
                            >
                                Showing {filteredEmployees.length} of {employees.length} employees
                            </p>
                        </div>
                        <label className="block w-full sm:max-w-xs">
                            <span className="sr-only">
                                Search employees by name, ID, department or position
                            </span>
                            <input
                                type="search"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search employees…"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-2 focus:outline-blue-100"
                            />
                        </label>
                    </div>
                    <EmployeeTable
                        employees={filteredEmployees}
                        onSelect={(employee) =>
                            navigate(`/employees/${encodeURIComponent(employee.id)}`)
                        }
                    />
                </section>
            </main>
        </>
    );
}
