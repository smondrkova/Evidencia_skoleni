import trainingData from './data/trainings.json';
import completionData from './data/completions.json';
import type { Training, TrainingCompletion } from './types/training';

export const trainings = trainingData as Training[];
export const completions = completionData as TrainingCompletion[];
