import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const names = ['AGENTS.md', 'goal.md', 'prd.md', 'task.md', 'progress.md', 'docs/ralph-long-run-audit.md'];
const documents = Object.fromEntries(names.map(name => [name, readFileSync(resolve(root, name), 'utf8')]));
let failures = 0;
let checks = 0;
function check(condition, description) {
  checks += 1;
  console.log(`${condition ? 'PASS' : 'FAIL'}: ${description}`);
  if (!condition) failures += 1;
}

const tasks = documents['task.md'];
const matches = [...tasks.matchAll(/^## Task (\d+):/gm)];
const ids = matches.map(match => Number(match[1]));
check(ids.join(',') === Array.from({ length: 21 }, (_, i) => i + 1).join(','), 'Tasks 1-21 exist exactly once and in order (including user revisions)');
for (const match of matches) {
  const id = Number(match[1]);
  const tail = tasks.slice(match.index + match[0].length);
  const nextHeading = tail.search(/^## /m);
  const section = nextHeading === -1 ? tail : tail.slice(0, nextHeading);
  const dependencyLine = section.match(/^\*\*Depends on:\*\* ([^\r\n]+)/m);
  const dependencies = [...(dependencyLine?.[1] ?? '').matchAll(/Task (\d+)/g)].map(value => Number(value[1]));
  const valid = id === 1
    ? dependencyLine?.[1] === 'none'
    : dependencies.length > 0 && dependencies.every(dep => ids.includes(dep) && dep < id);
  check(valid, `Task ${id} has existing, earlier dependencies (no cycles)`);
  check([...section.matchAll(/^- \[[ x]\] \*\*Step /gm)].length >= 5, `Task ${id} has concrete verification steps`);
}
for (const name of ['AGENTS.md', 'goal.md', 'prd.md', 'task.md']) {
  check(documents[name].includes('420'), `${name} includes the 420-minute contract`);
}
check(documents['AGENTS.md'].includes('activeWorkMinutes'), 'Agent rules include measured resume timing');
check(documents['AGENTS.md'].includes('completed-before-duration-target'), 'Early completion is reported honestly');
check(documents['goal.md'].includes('AI_DEMO_MODE=true'), 'Goal requires forced demo mode');
check(/Tasks 10.16/.test(documents['goal.md']), 'Goal includes extended P0 scope');
check(!/REQUIRED SUB-SKILL|superpowers:/.test(tasks), 'No unavailable skill is a prerequisite');
check(!tasks.includes('end the Ralph loop only when every criterion is satisfied'), 'Old Task 9 early-stop instruction is removed');
check(tasks.includes('Requires Separate Authorization'), 'P1 expansion requires a separate scope decision');
check(documents['goal.md'].includes('docs/gs25-store-manager-training-map.md'), 'Synthetic seed research reference is preserved');
check(existsSync(resolve(root, 'docs/gs25-store-manager-training-map.md')), 'Referenced research file exists');
check(documents['goal.md'].includes('Host/tool/usage limits override'), 'Host limits have an explicit checkpoint rule');

console.log(`Document checks: ${checks - failures}/${checks} passed. App execution and runtime duration were not tested.`);
process.exitCode = failures > 0 ? 1 : 0;
