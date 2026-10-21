// data/ngsl.csv → public/ngsl.json (predev·prebuild에서 실행)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseNgslCsv } from '../src/lib/ngsl-csv.ts';

const csv = readFileSync(new URL('../data/ngsl.csv', import.meta.url), 'utf8');
const words = parseNgslCsv(csv);

mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/ngsl.json', import.meta.url), JSON.stringify(words));
console.log(`public/ngsl.json: ${words.length}개 단어`);
