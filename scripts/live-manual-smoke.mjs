// Bounded live verification against a separately configured server. No credentials or answer prose logged.
const base = process.argv[2];
if (!base) throw new Error('Provide the live application base URL.');
const response = await fetch(`${base.replace(/\/$/, '')}/api/ai/qa`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ question: '상품 검수', rules: [] }), signal: AbortSignal.timeout(20_000),
});
const reply = await response.json();
const sourceValid = reply.sources?.some(source => source.url === 'https://youtu.be/frVZswofdA0') === true;
const valid = response.ok && reply.mode === 'live' && reply.status === 'resolved' && sourceValid;
console.log(JSON.stringify({ check: 'manual-qa', status: response.status, mode: reply.mode, sourceValid, liveVerified: valid }));
if (!valid) process.exitCode = 1;
