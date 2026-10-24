export type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string | null;
    position: string;
    managerEmail: string | null;
    startDate: string | null;
    endDate: string | null;
    status: EmployeeStatus;
    reviewRequired: boolean;
    reviewReasons: string[];
};

export type EmployeeStatus = 'active' | 'terminated' | 'parentalLeave' | 'unknown';
