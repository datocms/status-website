/**
 * Gets the browser when it is missing, writes the fixture data, and builds
 * the site from it into `e2e/.dist`.
 */
import { spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildManifest } from './fixtures.ts';

const root = join(import.meta.dirname, '..');
const dataDir = join(root, 'e2e/.data');

// A no-op when the browser is present: it needs no network then. The first
// run on a machine downloads it.
const install = spawnSync('npx', ['playwright', 'install', 'chromium'], {
  cwd: root,
  stdio: 'inherit',
});

if (install.status !== 0) {
  console.error(
    'e2e: could not install the browser for the end-to-end tests.\n' +
      'Connect to the network and try again, or use `git commit --no-verify`.',
  );
  process.exit(install.status ?? 1);
}

rmSync(dataDir, { recursive: true, force: true });
mkdirSync(join(dataDir, 'incidents'), { recursive: true });
mkdirSync(join(dataDir, 'maintenances'), { recursive: true });

const manifest = buildManifest();

for (const { kind, slug, file } of Object.values(manifest.items)) {
  writeFileSync(join(dataDir, kind, `${slug}.json`), `${JSON.stringify(file, null, 2)}\n`);
}

writeFileSync(join(dataDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

// `--force` clears the content cache, which holds the real data files.
const { status } = spawnSync('npx', ['astro', 'build', '--outDir', 'e2e/.dist', '--force', '--silent'], {
  cwd: root,
  stdio: 'inherit',
  // Not UTC, on purpose: the mirror gets its build on the laptop of the person
  // who pushes. The page must say the same UTC times there.
  env: { ...process.env, STATUS_DATA_DIR: './e2e/.data', TZ: 'America/Los_Angeles' },
});

process.exit(status ?? 1);
