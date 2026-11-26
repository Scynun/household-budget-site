// Household budget site — make.fun bounty entry (best-household-budget-site-20261126-1457).
//
// What this is: a small static web app that helps one household plan a month's money. The
// household types in its income, adds the expenses it expects (rent, groceries, transport,
// bills, savings and the rest), and the app shows, live, how much is left over, how the
// spending splits across categories, monthly budgets, bills and savings goals.
// Everything runs in the browser with no account and no server: figures are saved in the
// browser's own local storage, so the household can close the tab and come back to the same
// numbers, and the page works fully offline once it has loaded.
//
// What lives beside this file:
//   app/         — the site itself: index.html plus its CSS and JavaScript (no build step).
//   screenshots/ — three or four JPEG captures of the site running, taken in a real browser;
//                  the first one alphabetically is the cover the judge sees, and one is a
//                  phone-sized 390 x 844 view (see shots.json for which views were taken).
//   serve.ts     — a tiny local server for previewing the site during development.
//   vendor/      — the make.fun library this entrypoint uses to build the dossier; do not edit.
//
// How to try it: run `node serve.ts` and open http://localhost:8080 in a browser, or just
// open app/index.html directly. How the entry is assembled: running this file copies app/
// and screenshots/ into the output directory and writes dossier.json there — the summary
// the judge reads, built by the vendored library from the copied files. Outside the grader's
// container, point MAKEFUN_OUTPUT_DIR at a local folder, e.g. `MAKEFUN_OUTPUT_DIR=out node main.ts`.
//
// A working best-site-01 entry (Node 22, standard library only): the site is this directory's app/ folder, plain
// static files a browser opens at app/index.html (ES modules, CSS, no build step), its content held in its own files:
// nothing it runs, styles or shows loads over the network. The program hands it in: it copies app/ and screenshots/
// from beside this file to /output and writes /output/dossier.json, the summary the judge reads (your screenshots, the
// first load's files and bytes, and your source), with the vendored make.fun library. Leave vendor/makefun-frontend.ts
// as it is: the scorer requires dossier.json to be byte for byte what its own copy writes.
//
// A starting point, not a winner: a plain recipe collection, a list of recipes and a page for each. Build the site the
// brief asks for in app/ (its content, ease of use, a phone layout, its look), put 3 or 4 PNG or JPEG screenshots of
// it running in screenshots/ (the first by name is the cover; one may be a 390 x 844 phone view; shots.json says which
// views this starter's were taken of), and run it.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the bytes; the others refuse an entry the
// scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993 files and directories in app/ or
// 16 MiB of app files: app/ counts beside /output's own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 16777216 }),
);
