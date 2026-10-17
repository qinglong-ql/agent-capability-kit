const fs = require('fs');
const path = require('path');

const HOME = process.env.USERPROFILE;
const dirs = [
  path.join(HOME, '.dsh', 'skills'),
  path.join(HOME, '.agents', 'skills'),
];

function walk(dir, out) {
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch (_) { return; }
  for (const e of ents) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === 'SKILL.md') out.push(p);
  }
}

const all = [];
for (const d of dirs) walk(d, all);

function parseFrontmatter(txt) {
  const m = txt.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return {};
  const fm = {};
  let key = null;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (kv) { key = kv[1]; fm[key] = kv[2].trim(); }
    else if (key && /^\s+/.test(line)) { fm[key] += ' ' + line.trim(); }
  }
  return fm;
}

const seen = new Map();
for (const f of all) {
  let txt = '';
  try { txt = fs.readFileSync(f, 'utf8'); } catch (_) { continue; }
  const fm = parseFrontmatter(txt);
  const name = (fm.name || path.basename(path.dirname(f))).replace(/^["']|["']$/g, '');
  if (!name || seen.has(name)) continue;
  const desc = (fm.description || '').replace(/^["']|["']$/g, '').replace(/\s+/g, ' ').trim();
  seen.set(name, { name, desc, path: f.replace(HOME + path.sep, '') });
}

const list = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
console.log('UNIQUE_SKILLS=' + list.length);
fs.writeFileSync(
  path.join(process.env.TEMP, 'skills-inventory.json'),
  JSON.stringify(list, null, 2),
  'utf8'
);
console.log('written to %TEMP%\\skills-inventory.json\n');
for (const s of list) {
  console.log('### ' + s.name);
  console.log('DESC: ' + s.desc.slice(0, 220));
}
