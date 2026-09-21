import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { parseEnv } from 'node:util';

// Never report values or matching source text. Only this local file supplies a real secret.
const local = fs.existsSync('.env.local') ? parseEnv(fs.readFileSync('.env.local', 'utf8')) : {};
const values = [local.GEMINI_API_KEY, process.env.TEST_SECRET_CANARY].filter(value => value && value.length >= 8);
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
function files(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const name = path.join(directory, entry.name);
    return entry.isDirectory() ? files(name) : [name];
  });
}
const candidates = [...new Set([...tracked, ...files('src'), ...files('.firstday-build')])].filter(file => fs.existsSync(file) && fs.statSync(file).isFile());
const leaked = candidates.filter(file => values.some(value => fs.readFileSync(file).includes(Buffer.from(value))));
const trackedEnv = tracked.some(file => /^\.env(?:\.|$)/.test(file) && file !== '.env.example');
console.log(JSON.stringify({ inspectedFiles: candidates.length, secretPresent: !!local.GEMINI_API_KEY, canaryPresent: !!process.env.TEST_SECRET_CANARY, leakedPaths: leaked, trackedSecretFile: trackedEnv }));
if (leaked.length || trackedEnv) process.exitCode = 1;
