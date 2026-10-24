import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { processEmployees } from './process-employees.ts';
import { processCatalog } from './process-catalog.ts';
import { processCompletions } from './process-completions.ts';
import { processSessions } from './process-sessions.ts';
import { readCsv } from './utils.ts';

const employeeColumns: string[] = [
    'id_zamestnance',
    'jmeno',
    'prijmeni',
    'email',
    'utvar',
    'pozice',
    'vedouci_email',
    'datum_nastupu',
    'datum_ukonceni',
    'stav',
];

const catalogColumns: string[] = [
    'kod',
    'nazev',
    'platnost_mesicu',
    'povinne_pro',
];

const completionColumns: string[] = [
    'id_zaznamu',
    'id_zamestnance',
    'kod_skoleni',
    'datum_absolvovani',
    'platnost_do',
    'poskytovatel',
    'cena_kc',
    'poznamka',
];

const sessionColumns: string[] = [
    'id_terminu',
    'kod_skoleni',
    'datum',
    'cas',
    'misto',
    'kapacita',
    'obsazeno',
    'cena_na_osobu',
    'stav',
];

async function importData(): Promise<void> {
    const root = new URL('../../', import.meta.url);
    const referenceDate = '2026-10-01';
    const employeeRows = await readCsv(
        fileURLToPath(new URL('data/zamestnanci.csv', root)),
        ',', 'utf-8', employeeColumns,
    );
    const catalogRows = await readCsv(
        fileURLToPath(new URL('data/katalog_skoleni.csv', root)),
        ',', 'utf-8', catalogColumns,
    );
    const completionRows = await readCsv(
        fileURLToPath(new URL('data/absolvovana_skoleni.csv', root)),
        ';', 'windows-1250', completionColumns,
    );
    const sessionRows = await readCsv(
        fileURLToPath(new URL('data/terminy_skoleni.csv', root)),
        ';', 'utf-8', sessionColumns,
    );
    const employees = processEmployees(employeeRows, referenceDate);
    const trainings = processCatalog(catalogRows);
    const completions = processCompletions(completionRows, employees, trainings, referenceDate);
    const sessions = processSessions(sessionRows, trainings, referenceDate);
    const output = new URL('src/data/', root);
    await mkdir(output, { recursive: true });
    for (const [name, records] of Object.entries({ employees, trainings, completions, sessions })) {
        await writeFile(new URL(`${name}.json`, output), JSON.stringify(records, null, 2) + '\n', 'utf8');
        console.log(`${name}.json: ${records.length} records`);
    }
}

importData().catch(error => {
    console.error(error instanceof Error ? error.message : 'Import failed');
    process.exitCode = 1;
});
