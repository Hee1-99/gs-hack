import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
const source = readFileSync(new URL('../docs/gs25-store-manager-training-map.md', import.meta.url), 'utf8');
const passages = [];
for (const match of source.matchAll(/^#### \[([^\]]+)\]\((https?:\/\/[^\s]+)\)\r?\n([\s\S]*?)(?=^#{2,4} |$(?![\s\S]))/gm)) {
  const [, title, url, body] = match;
  if (!body.includes('**본문 요약 확보**')) continue;
  const excerpt = body.match(/^- 내용: (.+)$/m)?.[1]?.trim();
  if (!excerpt) throw new Error(`Missing summary: ${title}`);
  passages.push({ id: `manual-${createHash('sha256').update(url).digest('hex').slice(0, 12)}`, title, url, excerpt, status: '본문 요약 확보', origin: 'bundled' });
}
if (passages.length !== 58) throw new Error(`Expected 58 confirmed summaries, got ${passages.length}`);
mkdirSync(new URL('../src/features/manual-reference/', import.meta.url), { recursive: true });
writeFileSync(new URL('../src/features/manual-reference/passages.json', import.meta.url), `${JSON.stringify(passages, null, 2)}\n`);
console.log(`Generated ${passages.length} confirmed manual summaries; pending content excluded.`);
