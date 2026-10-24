import { addDays, format, isValid, parseISO } from 'date-fns';
import type { Training, TrainingCompletion, TrainingStatus } from '../types/training.js';

type ValidityResult = {
    status: TrainingStatus;
    completion: TrainingCompletion | null;
    reason: string;
    reviewCount: number;
};

export const EXPIRING_SOON_DAYS = 30;

export function getReferenceDate(referenceDate: string): Date {
    const date = parseISO(referenceDate);
    if (!isValid(date) || format(date, 'yyyy-MM-dd') !== referenceDate) {
        throw new Error('Reference date must be a valid date in YYYY-MM-DD format.');
    }
    return date;
}

export function getTrainingValidity(
    training: Training,
    records: TrainingCompletion[],
    referenceDate: string,
): ValidityResult {
    const reference = getReferenceDate(referenceDate);
    const matchingRecords = records.filter((record) => record.trainingCode === training.code);
    const reliableRecords = matchingRecords.filter(
        (record) =>
            !record.reviewRequired &&
            record.completionDate &&
            record.completionDate >= '1901-01-01' &&
            record.completionDate <= referenceDate &&
            record.validUntil &&
            record.validUntil >= record.completionDate,
    );
    const reviewCount = matchingRecords.length - reliableRecords.length;

    if (matchingRecords.length === 0) {
        return {
            status: 'missing',
            completion: null,
            reason: 'No completion is recorded for this training.',
            reviewCount,
        };
    }
    if (training.validity.type === 'unknown') {
        return {
            status: 'uncertain',
            completion: null,
            reason: 'The catalog does not specify a clear validity period. Validity cannot be confirmed.',
            reviewCount,
        };
    }

    // Select the longest reliable validity
    const completion = [...reliableRecords].sort((a, b) =>
        b.validUntil!.localeCompare(a.validUntil!),
    )[0];
    if (completion && completion.validUntil! >= referenceDate) {
        const soon = addDays(reference, EXPIRING_SOON_DAYS);
        const expiringSoon = completion.validUntil! <= format(soon, 'yyyy-MM-dd');
        return {
            status: expiringSoon ? 'expiringSoon' : 'valid',
            completion,
            reason: expiringSoon
                ? 'Training expires today or within the next 30 days.'
                : 'Validity is confirmed by a reliable completion record.',
            reviewCount,
        };
    }
    if (reviewCount > 0) {
        return {
            status: 'uncertain',
            completion: completion ?? null,
            reason: 'Validity cannot be confirmed. Some completion records need review.',
            reviewCount,
        };
    }
    return {
        status: 'expired',
        completion,
        reason: 'The latest reliable validity period ended before the reference date.',
        reviewCount,
    };
}
