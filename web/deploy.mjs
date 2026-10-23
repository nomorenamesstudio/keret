#!/usr/bin/env node
/*
 * deploy.mjs - what a deploy contains, and the stamp on top of it.
 *
 *   node deploy.mjs [outDir]        (default: dist, next to this file)
 *
 * Cloudflare Pages builds this repository with `node deploy.mjs` from `web/`:
 * one command instead of the inline copy list the project used to carry, so the
 * files a deploy ships are reviewable in the repository and testable without
 * Cloudflare (test/web.test.js runs this script and checks the output against
 * what the pages actually reference).
 *
 * The list is explicit rather than a wildcard: a wildcard would also ship
 * build.mjs, this file and package.json. A forgotten entry is the test's job to
 * catch, and it says which file is missing.
 *
 * The stamp comes from CF_PAGES_COMMIT_SHA in a Pages build and is empty
 * locally, where version-assets.mjs leaves the URLs alone.
 */
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const [arg = 'dist'] = process.argv.slice(2);
/* relative to where it is run from, which is `web/` in a Pages build */
const OUT = path.resolve(arg);

/* the two pages, the builder page, and the files they load */
const FILES = [
  'index.html', 'app.css', 'landing.css', 'app.js', 'copy.js',
  'keret-runtime.js', 'canvas-sharp.js', 'zip.js',
  'hosting.html', '404.html', 'robots.txt', 'sitemap.xml', 'llms.txt',
  'og.png', 'apple-touch-icon.png', '_headers',
];
/* everything under them that is referenced by directory */
const DIRS = ['app', 'shots', 'vendor', 'fonts'];

if (OUT === path.resolve(HERE) || OUT === path.resolve(HERE, '..')) {
  console.error('deploy: refusing to write into ' + OUT);
  process.exit(1);
}

/* The committed bundle is for the repository; what ships is rebuilt from src/,
   so a deploy can never carry one older than the commit it came from. */
execFileSync(process.execPath, [path.join(HERE, 'build.mjs')], { stdio: 'inherit' });

if (existsSync(OUT)) rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const name of FILES) cpSync(path.join(HERE, name), path.join(OUT, name));
for (const dir of DIRS) cpSync(path.join(HERE, dir), path.join(OUT, dir), { recursive: true });

execFileSync(process.execPath, [path.join(HERE, 'version-assets.mjs'), OUT, process.env.CF_PAGES_COMMIT_SHA || ''], { stdio: 'inherit' });

const where = path.relative(process.cwd(), OUT) || OUT;
console.log('deploy: ' + FILES.length + ' files and ' + DIRS.length + ' directories in ' + where);
