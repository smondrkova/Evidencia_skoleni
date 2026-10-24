export type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    position: string;
    managerEmail: string;
    startDate: string
    endDate: string | null;
    status: EmployeeStatus;
};

export type EmployeeStatus = 'active' | 'terminated' | 'parentalLeave';
