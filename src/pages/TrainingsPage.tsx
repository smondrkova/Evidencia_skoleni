import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { trainings } from '../app-data';
import { TrainingTable } from '../components/trainings/TrainingTable';

export function TrainingsPage() {
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const query = search.trim().toLowerCase();
    const filteredTrainings = trainings.filter((training) =>
        `${training.code} ${training.name}`.toLowerCase().includes(query),
    );

    return (
        <main className="mx-auto max-w-6xl px-5 py-9 sm:px-8 sm:py-12">
            <p className="mb-2 text-xs font-semibold tracking-widest text-blue-600">CATALOG</p>
            <h1 className="text-3xl font-semibold tracking-tight">Trainings</h1>
            <p className="mt-2 text-sm text-slate-500">
                Browse training types, validity periods and requirements. Select a row to see
                upcoming sessions.
            </p>
            <section
                aria-label="Training catalog"
                className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
                <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold">All trainings</h2>
                        <p
                            className="mt-1 text-xs text-slate-500"
                            role="status"
                        >
                            Showing {filteredTrainings.length} of {trainings.length} trainings
                        </p>
                    </div>
                    <label className="w-full sm:max-w-xs">
                        <span className="sr-only">Search trainings by name or code</span>
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search trainings…"
                            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-2 focus:outline-blue-100"
                        />
                    </label>
                </div>
                <TrainingTable
                    trainings={filteredTrainings}
                    onSelect={(training) =>
                        navigate(`/trainings/${encodeURIComponent(training.code)}`)
                    }
                />
            </section>
        </main>
    );
}
