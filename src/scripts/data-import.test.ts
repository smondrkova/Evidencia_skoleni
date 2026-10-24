import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkDate, conflictingIds, formatName, normalizeDepartment, normalizePosition, parseCount, parsePrice, trainingCode } from './utils.ts';
import { processCatalog } from './process-catalog.ts';
import { processEmployees } from './process-employees.ts';
import { processSessions } from './process-sessions.ts';
import type { Training } from '../types/training.js';

test('session import validates clock times and rejects reversed or empty ranges', () => {
    const catalog: Training[] = [{ code: 'KYBER', name: 'Security', validity: { type: 'months', months: 12 }, requirement: { type: 'everyone' } }];
    const values = { id_terminu: 'T001', kod_skoleni: 'KYBER', datum: '2026-10-15', cas: '', misto: 'Aula', kapacita: '20', obsazeno: '5', cena_na_osobu: '800', stav: 'plánováno' };
    for (const time of ['24:00-25:00', '09:60-12:00', '12:00-09:00', '09:00-09:00', '', '9:00-12:00']) {
        const [session] = processSessions([{ values: { ...values, cas: time }, sourceRow: 2 }], catalog, '2026-10-01');
        assert.equal(session.reviewRequired, true);
        assert.equal(session.startTime, null);
        assert.equal(session.endTime, null);
    }
    const [valid] = processSessions([{ values: { ...values, cas: '09:00-12:00' }, sourceRow: 2 }], catalog, '2026-10-01');
    assert.equal(valid.reviewRequired, false);
    assert.equal(valid.startTime, '09:00');
    assert.equal(valid.endTime, '12:00');
});

test('positions are normalized before being stored in application data', () => {
    assert.equal(normalizePosition(' TECHNIK   ÚDRŽBY '), 'Technik údržby');
    assert.equal(normalizePosition('technik udrzby'), 'Technik údržby');
    assert.equal(normalizePosition('ŘIDIČ'), 'Řidič');
    assert.equal(normalizePosition('Vedoucí'), 'Vedoucí');
    assert.equal(normalizePosition(' Nová   pozice '), 'Nová pozice');
    assert.equal(normalizePosition(' '), '');
});

test('catalog position rules use the same canonical labels as employees', () => {
    const catalog = processCatalog([{
        values: { kod: 'ZDVIH', nazev: 'Equipment operation', platnost_mesicu: '24', povinne_pro: 'POZICE: TECHNIK  ÚDRŽBY;technik udrzby' },
        sourceRow: 2,
    }]);
    assert.deepEqual(catalog[0].requirement, { type: 'positions', position: ['Technik údržby'] });
});

test('department variants use canonical names and unknown labels stay unchanged', () => {
    assert.equal(normalizeDepartment('Laboratore'), 'Laboratoře');
    assert.equal(normalizeDepartment('Laboratoře'), 'Laboratoře');
    assert.equal(normalizeDepartment(' SPRÁVA   BUDOV '), 'Správa budov');
    assert.equal(normalizeDepartment('sprava budov'), 'Správa budov');
    assert.equal(normalizeDepartment('Studijní'), 'Studijní oddělení');
    assert.equal(normalizeDepartment('Studijni oddeleni'), 'Studijní oddělení');
    assert.equal(normalizeDepartment('Personalni oddeleni'), 'Personální oddělení');
    assert.equal(normalizeDepartment('VEDENÍ'), 'Vedení');
    assert.equal(normalizeDepartment(' Nový útvar '), 'Nový útvar');
    assert.equal(normalizeDepartment('  '), null);
});

test('catalog department requirements use the same names and remove repeated variants', () => {
    const catalog = processCatalog([{
        values: { kod: 'PRV-POM', nazev: 'First aid', platnost_mesicu: '36', povinne_pro: 'UTVAR:Laboratore;Laboratoře;SPRAVA BUDOV' },
        sourceRow: 2,
    }]);
    assert.deepEqual(catalog[0].requirement, { type: 'departments', department: ['Laboratoře', 'Správa budov'] });
});

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
        assert.deepEqual(employees[0].reviewReasons, expectedStatus === 'unknown'
            ? ['Employment status is missing or not recognized.']
            : []);
    }
});

test('employee review reasons retain field errors and manager lookup errors together', () => {
    const values = {
        id_zamestnance: 'E001', jmeno: 'Test', prijmeni: 'Employee',
        email: 'invalid email', utvar: '', pozice: 'Specialista',
        vedouci_email: 'missing@example.com', datum_nastupu: '2020-01-01',
        datum_ukonceni: '', stav: 'aktivní',
    };
    const [employee] = processEmployees([{ values, sourceRow: 2 }], '2026-10-01');
    assert.equal(employee.reviewRequired, true);
    assert.deepEqual(employee.reviewReasons, [
        'Department is missing.',
        'Email is missing or has an invalid format.',
        'Manager email does not match any employee.',
    ]);
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
