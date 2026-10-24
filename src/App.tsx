import { EmployeesPage } from './pages/EmployeesPage';
import { EmployeeDetailPage } from './pages/EmployeeDetailPage';
import { HashRouter, Link, Navigate, Route, Routes } from 'react-router-dom';

// Use hash routes so employee detail URLs also work on static hosting.
function App() {
    return (
        <HashRouter>
            <div className="min-h-screen bg-slate-50 text-slate-800">
                <header className="border-b border-slate-200 bg-white">
                    <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-5 sm:px-8">
                        <Link
                            to="/"
                            className="rounded text-sm font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-blue-600"
                        >
                            Employee Training
                        </Link>
                    </div>
                </header>
                <Routes>
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
