import type { TrainingSession } from '../types/training.js';
import { getReferenceDate } from './validity.ts';

export function getAvailableSessions(
    trainingCode: string,
    sessions: TrainingSession[],
    referenceDate: string,
): TrainingSession[] {
    getReferenceDate(referenceDate);

    return sessions
        .filter((session) => {
            if (
                session.trainingCode !== trainingCode ||
                session.status !== 'planned' ||
                session.reviewRequired
            )
                return false;
            if (!session.id || !session.location.trim()) return false;
            if (!session.date || session.date < referenceDate) return false;
            if (!session.startTime || !session.endTime) return false;
            if (
                session.capacity === null ||
                session.occupied === null ||
                !Number.isSafeInteger(session.capacity) ||
                !Number.isSafeInteger(session.occupied) ||
                session.occupied < 0 ||
                session.capacity <= session.occupied
            )
                return false;
            if (
                session.pricePerPerson !== null &&
                (!Number.isFinite(session.pricePerPerson) || session.pricePerPerson < 0)
            )
                return false;
            return true;
        })
        .sort(
            (a, b) =>
                a.date!.localeCompare(b.date!) ||
                a.startTime!.localeCompare(b.startTime!) ||
                a.id.localeCompare(b.id),
        );
}
