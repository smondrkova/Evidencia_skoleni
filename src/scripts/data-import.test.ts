import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDate, conflictingIds, formatName, parseCount, parsePrice, trainingCode } from './utils.ts';
import { processEmployees } from './process-employees.ts';
import { processSessions } from './process-sessions.ts';
import type { Training } from '../types/training.js';

test('employee statuses are mapped and unknown values require review', () => {
    const cases = [
        ['aktivní', 'active'],
        ['ukončen', 'terminated'],
        ['rodičovská', 'parentalLeave'],
        ['neznámy', 'unknown'],
        ['', 'unknown'],
    ];

    for (const [sourceStatus, expectedStatus] of cases) {
        const employeeRow = {
            id_zamestnance: 'E001',
            jmeno: 'Lucie',
            prijmeni: 'Nováková',
            email: 'lucie@example.com',
            utvar: 'Knihovna',
            pozice: 'Knihovník',
            vedouci_email: 'manager@example.com',
            datum_nastupu: '2020-01-01',
            datum_ukonceni: sourceStatus === 'ukončen' ? '2026-09-01' : '',
            stav: sourceStatus,
        };
        const managerRow = {
            ...employeeRow,
            id_zamestnance: 'E002',
            email: 'manager@example.com',
            vedouci_email: 'lucie@example.com',
            datum_ukonceni: '',
            stav: 'aktivní',
        };
        const employees = processEmployees([
            { values: employeeRow, sourceRow: 2 },
            { values: managerRow, sourceRow: 3 },
        ], '2026-10-01');

        assert.equal(employees[0].status, expectedStatus);
        assert.equal(employees[0].reviewRequired, expectedStatus === 'unknown');
    }
});

test('session statuses are mapped and unknown values require review', () => {
    const catalog: Training[] = [{
        code: 'KYBER',
        name: 'Kybernetická bezpečnost',
        validity: { type: 'months', months: 12 },
        requirement: { type: 'everyone' },
    }];
    const cases = [
        ['plánováno', 'planned'],
        ['zrušeno', 'cancelled'],
        ['neznámy', 'unknown'],
        ['', 'unknown'],
    ];

    for (const [sourceStatus, expectedStatus] of cases) {
        const values = {
            id_terminu: 'T001',
            kod_skoleni: 'KYBER',
            datum: '2026-10-15',
            cas: '09:00-12:00',
            misto: 'Aula',
            kapacita: '25',
            obsazeno: '5',
            cena_na_osobu: '800',
            stav: sourceStatus,
        };
        const sessions = processSessions([{ values, sourceRow: 2 }], catalog, '2026-10-01');

        assert.equal(sessions[0].status, expectedStatus);
        assert.equal(sessions[0].reviewRequired, expectedStatus === 'unknown');
    }
});

test('capacity and occupancy accept only whole nonnegative counts', () => {
    assert.equal(parseCount('25'), 25);
    assert.equal(parseCount('0'), 0);
    assert.equal(parseCount('-5'), null);
    assert.equal(parseCount('2.5'), null);
    assert.equal(parseCount(''), null);
    assert.equal(parseCount('abc'), null);
    assert.equal(parseCount('9007199254740992'), null);
});

test('conflicting IDs include repeated IDs but not unique ones', () => {
    const rows = [
        { values: { id: 'E001' }, sourceRow: 2 },
        { values: { id: 'E002' }, sourceRow: 3 },
        { values: { id: 'E001' }, sourceRow: 4 },
        { values: { id: 'E001' }, sourceRow: 5 },
    ];

    assert.deepEqual(conflictingIds(rows, 'id'), new Set(['E001']));
    assert.deepEqual(conflictingIds(rows.slice(0, 2), 'id'), new Set());
    assert.deepEqual(conflictingIds([], 'id'), new Set());
});

test('training codes are trimmed and uppercased without guessing corrections', () => {
    assert.equal(trainingCode(' kyber '), 'KYBER');
    assert.equal(trainingCode(' bozP-z '), 'BOZP-Z');
    assert.equal(trainingCode('KYB3R'), 'KYB3R');
    assert.equal(trainingCode(''), '');
});

test('names use initial capitals and preserve accents and punctuation', () => {
    assert.equal(formatName(' LUCIE '), 'Lucie');
    assert.equal(formatName('ŠŤASTNÁ'), 'Šťastná');
    assert.equal(formatName('ANNA MARIE'), 'Anna Marie');
    assert.equal(formatName('NOVÁKOVÁ-SVOBODOVÁ'), 'Nováková-Svobodová');
    assert.equal(formatName(', LUCIE'), ', Lucie');
    assert.equal(formatName(''), '');
});

test('calendar validation rejects rollover and ambiguous serial dates', () => {
    assert.equal(checkDate('29. 2. 2024'), '2024-02-29');
    for (const value of ['2026-02-29', '31. 9. 2026', '45000', '2026-13-01', '']) assert.equal(checkDate(value), null);
});

test('prices preserve missing values and distinguish free and negative amounts', () => {
    for (const [value, expected] of [['1 150,00', 1150], ['550,- Kč', 550], ['2 100 Kč', 2100], ['zdarma', 0], ['', null], ['-25', -25], ['?', null]] as const) assert.equal(parsePrice(value), expected);
});
