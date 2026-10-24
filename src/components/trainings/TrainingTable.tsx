import { Link } from 'react-router-dom';
import type { Training } from '../../types/training';
import { formatTrainingRequirement, formatTrainingValidity } from '../../utils/formatTraining';

type TrainingTableProps = {
    trainings: Training[];
    onSelect: (training: Training) => void;
};

export function TrainingTable({ trainings, onSelect }: TrainingTableProps) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <caption className="sr-only">
                    Training catalog. Select a row to view training details and upcoming sessions.
                </caption>
                <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                        <th
                            scope="col"
                            className="px-6 py-3.5"
                        >
                            Training
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Validity period
                        </th>
                        <th
                            scope="col"
                            className="px-5 py-3.5"
                        >
                            Required for
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {trainings.map((training) => (
                        <tr
                            key={training.code}
                            className="group cursor-pointer hover:bg-blue-50/60 focus-within:bg-blue-50/60"
                            onClick={(event) => {
                                if (
                                    event.defaultPrevented ||
                                    event.metaKey ||
                                    event.ctrlKey ||
                                    event.shiftKey ||
                                    event.altKey ||
                                    (event.target as HTMLElement).closest('a')
                                )
                                    return;
                                onSelect(training);
                            }}
                        >
                            <td className="min-w-64 px-6 py-4">
                                <Link
                                    to={`/trainings/${encodeURIComponent(training.code)}`}
                                    className="block rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
                                >
                                    <span className="block font-semibold group-hover:text-blue-700 group-hover:underline">
                                        {training.name}
                                    </span>
                                    <span className="mt-1 block text-xs text-slate-500">
                                        {training.code}
                                    </span>
                                </Link>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                                {formatTrainingValidity(training.validity)}
                            </td>
                            <td className="min-w-56 px-5 py-4 text-slate-600">
                                {formatTrainingRequirement(training.requirement)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {trainings.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-500">No trainings found.</p>
            )}
        </div>
    );
}
