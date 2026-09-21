// Run only against a separately started live-mode server. Never prints credentials/provider text.
import { createSeed } from '../src/domain/seed.ts';
const base = process.argv[2] || 'http://127.0.0.1:3101';
const seed = createSeed();
const at = new Date().toISOString();
const session = { id: crypto.randomUUID(), previousAttemptId: null, scenario: seed.scenarios[0], snapshot: { rules: seed.rules, products: seed.products, promotions: seed.promotions }, events: [{ id: crypto.randomUUID(), at, type: 'customer', text: seed.scenarios[0].customerQuestion }], status: 'active', createdAt: at, results: null };
for (const role of ['customer', 'coach']) {
  const response = await fetch(`${base}/api/ai/${role}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(session), signal: AbortSignal.timeout(15_000) });
  const reply = await response.json();
  const valid = response.ok && reply.mode === 'gemini' && reply.groundingRuleIds?.includes('promotion-response');
  console.log(JSON.stringify({ role, status: response.status, mode: reply.mode, fallbackReason: reply.fallbackReason, groundingValid: reply.groundingRuleIds?.includes('promotion-response'), liveVerified: valid }));
  if (!valid) process.exitCode = 1;
}
const response = await fetch(`${base}/api/ai/qa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: seed.rules[0].title, rules: seed.rules }), signal: AbortSignal.timeout(20_000) });
const reply = await response.json();
const valid = response.ok && reply.mode === 'live' && reply.ruleIds?.includes('promotion-response') && reply.answer?.includes('3,000원');
console.log(JSON.stringify({ role: 'qa', status: response.status, mode: reply.mode, groundingValid: reply.ruleIds?.includes('promotion-response'), fixedPriceValid: reply.answer?.includes('3,000원'), liveVerified: valid }));
if (!valid) process.exitCode = 1;
