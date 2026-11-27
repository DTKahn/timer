import pkg from '../../package.json';
import vercel from '../../vercel.json';

// The project has no Node type definitions, so type the fs calls used here.
const { readFileSync, existsSync } = jest.requireActual<{
  readFileSync(path: string, encoding: 'utf8'): string;
  existsSync(path: string): boolean;
}>('fs');

// Jest runs from the project root.
const scripts = (pkg as { scripts: Record<string, string> }).scripts;

describe('checks before anything goes live', () => {
  it('has Vercel run the full check before building the site', () => {
    const build = vercel.buildCommand;
    expect(build).toMatch(/^npm run check && /);
    expect(build.indexOf('npm run check')).toBeLessThan(build.indexOf('expo export'));
  });

  it('checks lint, types and tests', () => {
    expect(scripts.check).toContain('expo lint');
    expect(scripts.check).toContain('tsc --noEmit');
    expect(scripts.check).toContain('jest');
  });

  it('uses one package manager, npm', () => {
    expect(existsSync('package-lock.json')).toBe(true);
    for (const other of ['bun.lock', 'bun.lockb', 'yarn.lock', 'pnpm-lock.yaml']) {
      expect(existsSync(other)).toBe(false);
    }
  });
});

describe('the dated update reminder in AGENTS.md', () => {
  const agents = readFileSync('AGENTS.md', 'utf8');
  const date = (label: string) => {
    const match = agents.match(new RegExp(`\\*\\*${label}:\\*\\* (\\d{4}-\\d{2}-\\d{2})`));
    if (!match) throw new Error(`AGENTS.md is missing "**${label}:** YYYY-MM-DD"`);
    return new Date(`${match[1]}T00:00:00Z`);
  };

  it('is due 30 days after the last update', () => {
    const days = (date('Next due').getTime() - date('Last update').getTime()) / 86_400_000;
    expect(days).toBe(30);
  });
});
