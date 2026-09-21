import 'server-only';
import passages from './passages.json';
import type { ManualSource } from '@/domain/types';
import type { UploadedManual } from './upload';
export const manualPassages = passages as ManualSource[];
const ignored = new Set(['어떻게', '무엇', '알려줘', '알려주세요', '하나요', '해야', '해야해요', '되나요', '문의', '방법', '보내요', '질문', '궁금해요', '매뉴얼', '주세요', '하죠', '처리', '합니다', '해요', '해야하나요']);
function terms(text: string) {
  return text.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}/]+/gu, ' ').split(/\s+/).filter(term => !ignored.has(term)).map(term => term.replace(/(해주세요|하나요|인가요|에서는|에서|에게|으로|에는|해요|은|는|을|를|이|가|에|와|과)$/u, '')).filter(term => term.length >= 2 && !ignored.has(term));
}
export function parseUploadedManual(upload: UploadedManual): ManualSource[] {
  // Uploaded content is untrusted reference text, never a prompt or app instruction.
  const sections = upload.text.replace(/\r/g, '').split(/(?=^#{1,4} )/m).flatMap(section => {
    const lines = section.trim().split('\n');
    const heading = lines[0]?.startsWith('#') ? lines.shift()!.replace(/^#+\s*/, '').slice(0, 100) : upload.name;
    const text = lines.join('\n').trim();
    const chunks = text.match(/[\s\S]{1,1500}/g) ?? [];
    return chunks.map(excerpt => ({ title: heading, excerpt }));
  });
  return sections.map((section, index) => ({ ...section, id: `upload-${index}`, status: '사용자 업로드 · 최신성 미검증', origin: 'upload' }));
}
export function searchManual(question: string, upload?: UploadedManual): ManualSource[] {
  const query = terms(question);
  if (!query.length) return [];
  const candidates = upload ? parseUploadedManual(upload) : manualPassages;
  const ranked = candidates.map(source => {
    const title = source.title.normalize('NFKC').toLowerCase();
    const corpus = `${title} ${source.excerpt}`.normalize('NFKC').toLowerCase();
    const matches = query.filter(term => corpus.includes(term));
    const titleMatches = query.filter(term => title.includes(term));
    // A topical overlap alone must not answer unrelated compound questions.
    const eligible = matches.length === query.length && (titleMatches.length > 0 || matches.length >= 2 || query[0].length >= 3);
    return { source, score: eligible ? matches.length + titleMatches.length * 3 : 0 };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
  // A direct topic hit should not bury the useful answer under broad introductory passages.
  return ranked.filter(item => item.score >= (ranked[0]?.score ?? 0) - 1).slice(0, 3).map(item => item.source);
}
