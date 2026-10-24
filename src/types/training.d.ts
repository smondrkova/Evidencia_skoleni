export type Training = {
    code: string;
    name: string;
    validity: TrainigValidity;
    requirement: TrainingRequirement;
}

export type TrainigValidity = 
    | {type: "months", months: number}
    | {type: "unlimited"}
    | {type: "unknown"};

export type TrainingRequirement = 
    | {type: "everyone"}
    | {type: "departments", department: string[]}
    | {type: "positions", position: string[]}
    | {type: "optional"};

export type TrainingCompletion = {
    id: string;
    employeeId: string;
    trainingCode: string;
    completionDate: string;
    validUntil: string | null;
    provider: string;
    price: number;
    note: string | null;
}

export type TrainingSession = {
    id: string;
    trainingCode: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    capacity: number;
    occupied: number;
    pricePerPerson: number;
    status: TrainingSessionStatus;
}

export type TrainingSessionStatus = 'planned' | 'cancelled';