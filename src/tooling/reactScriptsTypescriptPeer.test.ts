import fs from 'fs';
import path from 'path';

const repoRoot = path.resolve(__dirname, '../..');

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  overrides?: {
    'react-scripts'?: {
      typescript?: string;
    };
  };
};

function readActiveNpmrcValue(
  contents: string,
  key: string
): string | undefined {
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }
    if (trimmed.slice(0, separator).trim() === key) {
      return trimmed.slice(separator + 1).trim();
    }
  }
  return undefined;
}

/** True when a declared range can install TypeScript 5 and is not CRA's 3/4 peer. */
function allowsTypescript5(range: string): boolean {
  return range.split('||').some((part) => {
    const comparator = part.trim();
    const caretOrTilde = comparator.match(/^[\^~](\d+)\.\d+\.\d+$/);
    if (caretOrTilde) {
      return Number(caretOrTilde[1]) === 5;
    }
    const exact = comparator.match(/^(\d+)\.\d+\.\d+$/);
    if (exact) {
      return Number(exact[1]) === 5;
    }
    const greaterOrEqual = comparator.match(/^>=(\d+)\.\d+\.\d+$/);
    return greaterOrEqual ? Number(greaterOrEqual[1]) <= 5 : false;
  });
}

describe('react-scripts TypeScript peer install', () => {
  it('keeps TypeScript 5 installable beside react-scripts 5.0.1', () => {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8')
    ) as PackageJson;
    const typescriptRange = packageJson.devDependencies?.typescript ?? '';
    const npmrcPath = path.join(repoRoot, '.npmrc');
    const npmrc = fs.existsSync(npmrcPath)
      ? fs.readFileSync(npmrcPath, 'utf8')
      : '';
    const ci = fs.readFileSync(
      path.join(repoRoot, '.github/workflows/ci.yml'),
      'utf8'
    );
    const vercel = fs.readFileSync(path.join(repoRoot, 'vercel.json'), 'utf8');

    expect(packageJson.dependencies?.['react-scripts']).toBe('5.0.1');
    expect(typescriptRange).toBe('^5.9.3');
    expect(allowsTypescript5(typescriptRange)).toBe(true);
    expect(allowsTypescript5('^3.2.1 || ^4')).toBe(false);
    expect(allowsTypescript5('^4.9.5')).toBe(false);
    expect(packageJson.overrides?.['react-scripts']?.typescript).toBe(
      typescriptRange
    );
    expect(readActiveNpmrcValue(npmrc, 'legacy-peer-deps')).toBeUndefined();
    expect(ci).not.toContain('legacy-peer-deps');
    expect(vercel).not.toContain('legacy-peer-deps');
  });
});
