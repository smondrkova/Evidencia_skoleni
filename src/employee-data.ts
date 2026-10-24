import employeeData from './data/employees.json';
import type { Employee } from './types/employee';

export const employees = employeeData as Employee[];
