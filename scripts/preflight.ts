#!/usr/bin/env tsx
/**
 * preflight — the standard project contract gate.
 *
 * Run before pushing (and in CI's lint step). It verifies two things:
 *
 *  1. CONTRACT: every file the agency system depends on is present, so a site
 *     can't silently drift out of the system (graphify graph, CLAUDE.md,
 *     LEARNINGS.md, the reusable CI call, the CSS-var theme contract).
 *
 *  2. QUALITY FLOOR: the motion-lint rule (anticipatePin / will-change) runs over
 *     local source — the same rule @vinny/ui enforces, vendored here so the
 *     lesson is enforced in client repos too.
 *
 * It also prints the GraphRAG reuse reminder: before building a new section,
 * check the catalog + global graph so we reuse instead of re-inventing.
 *
 *   pnpm preflight              # full check
 *   pnpm preflight --lint-only  # just the quality floor (used by `lint`)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';

const lintOnly = process.argv.includes('--lint-only');
const root = process.cwd();
const problems: string[] = [];

/** 1. Contract files that MUST exist. */
const REQUIRED = [
  '.graphifyignore',
  'graphify-out',
  'CLAUDE.md',
  'LEARNINGS.md',
  '.github/workflows/ci.yml',
  'src/app/globals.css',
];

if (!lintOnly) {
  for (const rel of REQUIRED) {
    if (!existsSync(join(root, rel))) problems.push(`missing contract file/dir: ${rel}`);
  }
  // CI must delegate to the reusable workflow, not reimplement it.
  const ci = safeRead('.github/workflows/ci.yml');
  if (ci && !/GENIEMARKETING\/\.github\/\.github\/workflows\/ci\.yml/.test(ci)) {
    problems.push('.github/workflows/ci.yml does not call the shared reusable workflow');
  }
  // The CSS-var theme contract @vinny/ui depends on.
  const css = safeRead('src/app/globals.css');
  for (const v of ['--brand', '--brand-fg', '--surface', '--fg']) {
    if (css && !css.includes(v)) problems.push(`globals.css is missing the ${v} theme token`);
  }
}

/** 2. Quality floor — the vendored motion-lint rule. */
lintMotion(join(root, 'src'));

if (problems.length > 0) {
  console.error('✖ preflight failed:');
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

if (!lintOnly) {
  console.log('\n📚 Reuse before you build: check the catalog (Storybook on Amplify) + the');
  console.log('   global graph, then `npx @vinny/blocks add <name>` or install @vinny/ui.\n');
}
console.log('✓ preflight passed');

// ---- helpers ----------------------------------------------------------------

function safeRead(rel: string): string | null {
  try {
    return readFileSync(join(root, rel), 'utf8');
  } catch {
    return null;
  }
}

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1');
}

function lintMotion(dir: string): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.next') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      lintMotion(full);
      continue;
    }
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry))) continue;
    const src = stripComments(readFileSync(full, 'utf8'));

    const pinRe = /pin\s*:\s*true/g;
    for (let m = pinRe.exec(src); m !== null; m = pinRe.exec(src)) {
      const window = src.slice(Math.max(0, m.index - 400), m.index + 400);
      if (!/anticipatePin\s*:/.test(window)) {
        problems.push(`${full}: \`pin: true\` without \`anticipatePin\` (mobile pin-jump risk)`);
      }
    }
    const sets = /willChange\s*:\s*['"`](?!auto)/.test(src);
    const clears = /willChange\s*:\s*['"`]auto/.test(src);
    if (sets && !clears) {
      problems.push(
        `${full}: sets \`will-change\` but never clears it to \`auto\` (INP budget risk)`,
      );
    }
  }
}
