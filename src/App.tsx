import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { TrainingsPage } from './pages/TrainingsPage';
import { TrainingDetailPage } from './pages/TrainingDetailPage';
import { HashRouter, Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';

// Use hash routes so employee detail URLs also work on static hosting.
function App() {
    return (
        <HashRouter>
            <div className="min-h-screen bg-slate-50 text-slate-800">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-8">
                        <Link
                            to="/"
                            className="rounded text-sm font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                            Employee Training
                        </Link>
                        <nav
                            aria-label="Main navigation"
                            className="flex gap-2 text-sm"
                        >
                            <NavLink
                                to="/"
                                className={({ isActive }) =>
                                    `rounded-lg px-3 py-2 font-medium focus-visible:outline-2 focus-visible:outline-blue-600 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`
                                }
                            >
                                Employees
                            </NavLink>
                            <NavLink
                                to="/trainings"
                                className={({ isActive }) =>
                                    `rounded-lg px-3 py-2 font-medium focus-visible:outline-2 focus-visible:outline-blue-600 ${isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`
                                }
                            >
                                Trainings
                            </NavLink>
                        </nav>
                    </div>
                </header>
                <Routes>
                    <Route
                        path="/trainings"
                        element={<TrainingsPage />}
                    />
                    <Route
                        path="/trainings/:trainingCode"
                        element={<TrainingDetailPage />}
                    />
                    <Route
                        path="/"
                        element={<EmployeesPage />}
                    />
                    <Route
                        path="/employees/:employeeId"
                        element={<EmployeeDetailPage />}
                    />
                    <Route
                        path="*"
                        element={
                            <Navigate
                                to="/"
                                replace
                            />
                        }
                    />
                </Routes>
            </div>
        </HashRouter>
    );
}

export default App;
