import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The Netlify function cannot `require()` an ES module: it fails with
 * ERR_REQUIRE_ESM, also on Node 24. A CommonJS package that starts to depend
 * on an ESM-only package then takes its whole endpoint down with a 500, and
 * only on Netlify. Node gives the same failure with require(esm) turned off.
 *
 * This happened two times to /api/feeds through sanitize-html: from 2.17.6 it
 * needs htmlparser2 12, which is ESM-only.
 */
const SERVER_CODE = ['src/pages', 'src/lib'];

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(ts|astro)$/.test(entry.name) ? [path] : [];
  });

/** The name of the package of an import: "date-fns/locale" is "date-fns". */
const packageOf = (specifier: string) =>
  specifier.split('/').slice(0, specifier.startsWith('@') ? 2 : 1).join('/');

const importedPackages = (): string[] => {
  const packages = new Set<string>();

  for (const file of SERVER_CODE.flatMap(sourceFiles)) {
    // Code that is commented out imports nothing.
    const code = readFileSync(file, 'utf8').replace(/^\s*\/\/.*$/gm, '');

    for (const [, isType, specifier] of code.matchAll(/^\s*import\s+(type\s+)?[^'"]*?from\s+['"]([^'"]+)['"]/gm)) {
      const isPackage = !specifier.startsWith('.') && !specifier.startsWith('astro');
      if (!isType && isPackage) packages.add(packageOf(specifier));
    }
  }

  return [...packages].sort();
};

describe('packages that the server code imports', () => {
  const packages = importedPackages();

  it('finds the imports', () => {
    expect(packages).toContain('date-fns');
    expect(packages).toContain('@aws-sdk/client-cloudwatch');
  });

  for (const name of packages) {
    it(`${name} loads in a runtime that cannot require an ES module`, () => {
      const { status, stderr } = spawnSync(
        process.execPath,
        ['--no-experimental-require-module', '--input-type=module', '-e', `await import('${name}')`],
        { encoding: 'utf8' },
      );

      expect(stderr.split('\n').find((line) => line.includes('Error')) ?? '').toBe('');
      expect(status).toBe(0);
    });
  }
});
