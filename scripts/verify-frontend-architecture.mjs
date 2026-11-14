import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const apps = ['FE_TemplateLandingPage', 'FE_Quoting', 'FE_Tenant'];
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory() ? walk(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
}
const failures = [];
for (const app of apps) {
  const files = (await walk(path.join(root, app, 'src'))).filter(file => /\.[jt]sx?$/.test(file));
  for (const file of files) {
    const content = await readFile(file, 'utf8');
    if (/(?:from\s*|import\s*\()['"](?:[^'"]*\.\.\/)+(?:FE_TemplateLandingPage|FE_Quoting|FE_Tenant)\//.test(content)) failures.push(`${app}: cross-app source import in ${path.relative(root, file)}`);
    if (/src[\\/]components[\\/](WorkspaceGate|WorkspaceMembers|MemberPanel)/.test(file) && /\b(?:fetch|axios)\s*\(/.test(content)) failures.push(`${app}: component bypasses API layer in ${path.relative(root, file)}`);
  }
  const client = await readFile(path.join(root, app, 'src/api', app === 'FE_Tenant' ? 'client.js' : 'axios.js'), 'utf8');
  if (app !== 'FE_Tenant' && (!client.includes('scopeRequest') || !client.includes('assertCurrentScope'))) failures.push(`${app}: missing scoped request/response boundary`);
  const manifest = JSON.parse(await readFile(path.join(root, app, 'package.json'), 'utf8'));
  if (!manifest.scripts.test || !manifest.scripts.build) failures.push(`${app}: missing verification command`);
}
if (failures.length) { process.stderr.write(failures.join('\n') + '\n'); process.exitCode = 1; }
else process.stdout.write(`Frontend architecture verified: ${apps.join(', ')}\n`);
