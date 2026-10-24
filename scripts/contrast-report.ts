// Prints the contrast of every token pair in both themes as a markdown table.
// Usage: pnpm contrast
import { readFileSync } from 'node:fs';
import { contrastRatio } from '../src/lib/contrast';
import { parseTokens, TOKEN_PAIRS } from '../src/lib/tokens';

const themes = parseTokens(readFileSync('src/styles/tokens.css', 'utf8'));
const rows = (['dark', 'light'] as const).flatMap((theme) =>
  TOKEN_PAIRS.map(({ fg, bg, min, use }) => {
    const ratio = contrastRatio(themes[theme][fg]!, themes[theme][bg]!);
    const result = ratio >= min ? 'PASS' : 'FAIL';
    return `| ${theme} | ${fg} ${themes[theme][fg]} | ${bg} ${themes[theme][bg]} | ${ratio.toFixed(2)}:1 | ${min}:1 | ${result} | ${use} |`;
  }),
);

console.log('| Theme | Foreground | Background | Ratio | Min | Result | Use |');
console.log('| --- | --- | --- | --- | --- | --- | --- |');
console.log(rows.join('\n'));
