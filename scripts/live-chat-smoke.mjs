// One customer turn and one rubric call. No credentials or model prose printed.
const base = process.argv[2];
if (!base) throw new Error('Provide the live application URL.');
const messages = [{ role: 'customer', text: '기다렸는데 안내를 못 받아서 불편해요.' }, { role: 'manager', text: '기다리시게 해서 죄송합니다. 어떤 도움이 필요하신지 먼저 듣고, 제가 바로 처리할 수 있는지 확인해 드리겠습니다. 바로 어렵다면 담당자에게 연결하고 진행 상황을 안내드릴게요.' }];
for (const action of ['reply', 'finish']) {
  const response = await fetch(`${base.replace(/\/$/, '')}/api/ai/chat-training`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ scenarioId: 'complaint', messages, action }), signal: AbortSignal.timeout(25_000) });
  const reply = await response.json();
  const valid = response.ok && reply.mode === 'live' && (action === 'reply' ? Boolean(reply.message) : reply.feedback?.criteria?.length === 4 && reply.feedback?.score >= 0 && reply.feedback?.score <= 100 && reply.sources?.length > 0);
  console.log(JSON.stringify({ check: `chat-${action}`, status: response.status, mode: reply.mode, liveVerified: valid }));
  if (!valid) process.exitCode = 1;
}
