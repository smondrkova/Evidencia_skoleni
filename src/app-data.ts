import employeeData from './data/employees.json';
import trainingData from './data/trainings.json';
import completionData from './data/completions.json';
import sessionData from './data/sessions.json';
import type { Employee } from './types/employee';
import type { Training, TrainingCompletion, TrainingSession } from './types/training';

export const employees = employeeData as Employee[];
export const trainings = trainingData as Training[];
export const completions = completionData as TrainingCompletion[];
export const sessions = sessionData as TrainingSession[];
