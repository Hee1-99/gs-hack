// One bounded general Q&A call; logs metadata only.
const base = process.argv[2];
if (!base) throw new Error('Provide the live application URL.');
const response = await fetch(`${base.replace(/\/$/, '')}/api/ai/qa`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: '동료와 친해지는 방법을 알려주세요', rules: [] }), signal: AbortSignal.timeout(25_000) });
const answer = await response.json();
const valid = response.ok && answer.mode === 'live' && answer.answerKind === 'general' && answer.sources?.length === 0 && Boolean(answer.answer);
console.log(JSON.stringify({ check: 'general-qa', status: response.status, mode: answer.mode, answerKind: answer.answerKind, noFabricatedSources: answer.sources?.length === 0, liveVerified: valid }));
if (!valid) process.exitCode = 1;
