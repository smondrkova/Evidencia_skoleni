export type Training = {
    code: string;
    name: string;
    validity: TrainingValidity;
    requirement: TrainingRequirement;
}

export type TrainingValidity = 
    | {type: "months", months: number}
    | {type: "unlimited"}
    | {type: "unknown"};

export type TrainingRequirement = 
    | {type: "everyone"}
    | {type: "departments", department: string[]}
    | {type: "positions", position: string[]}
    | {type: "optional"}
    | {type: "unknown"};

export type TrainingCompletion = {
    id: string;
    employeeId: string;
    trainingCode: string;
    completionDate: string | null;
    validUntil: string | null;
    provider: string;
    price: number | null;
    note: string | null;
    sourceRow: number;
    reviewRequired: boolean;
}

export type TrainingSession = {
    id: string;
    trainingCode: string;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    location: string;
    capacity: number | null;
    occupied: number | null;
    pricePerPerson: number | null;
    status: TrainingSessionStatus;
    reviewRequired: boolean;
}

export type TrainingSessionStatus = 'planned' | 'cancelled' | 'unknown';
