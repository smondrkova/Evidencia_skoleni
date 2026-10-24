import { EmployeesPage } from './pages/EmployeesPage';

// Render the employee directory as the app's first page.
function App() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-5 sm:px-8">
                    <span className="text-sm font-semibold tracking-tight">Employee Training</span>
                </div>
            </header>
            <EmployeesPage />
        </div>
    );
}

export default App;
