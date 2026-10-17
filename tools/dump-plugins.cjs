const fs = require('fs');
const path = require('path');

const HOME = process.env.USERPROFILE;
const profileDir = path.join(HOME, '.dsh', 'profiles', 'desktop');
const nm = path.join(profileDir, 'node_modules');

const profile = JSON.parse(fs.readFileSync(path.join(profileDir, 'package.json'), 'utf8'));
const declared = profile.dependencies || {};
const bundles = (profile.dsh && profile.dsh.profile && profile.dsh.profile.bundles) || [];

function readPkg(name) {
  const p = path.join(nm, name, 'package.json');
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (_) { return null; }
}

const out = [];
const seen = new Set();

function add(name, role, extra) {
  if (seen.has(name)) return;
  seen.add(name);
  const pkg = readPkg(name);
  const dshField = pkg && pkg.dsh ? pkg.dsh : null;
  out.push({
    name,
    role,
    version: pkg ? pkg.version : (declared[name] || '?'),
    desc: pkg ? (pkg.description || '') : '',
    declared: !!declared[name],
    inBundles: bundles.includes(name),
    hasBundlePatch: !!(dshField && dshField.bundle),
    clientInject: dshField && dshField.client && dshField.client.inject ? dshField.client.inject : null,
    permissions: dshField && dshField.permissions ? dshField.permissions.summary || '' : '',
    engines: dshField && dshField.engines ? dshField.engines : null,
    ...(extra || {}),
  });
}

// 1. 声明的 16 个
for (const name of Object.keys(declared)) add(name, 'declared');

// 2. bundles 里但没在 dependencies 的（DSH 核心）
for (const b of bundles) {
  if (!declared[b]) add(b, 'core-bundle');
}

// 3. dsh-web-all 的子插件
let webAll = null;
try { webAll = readPkg('@linxin666/dsh-web-all'); } catch (_) {}
if (webAll) {
  const subNames = new Set();
  // 从 bundle 字段找，或从 node_modules 里 @linxin666 目录
  const lxDir = path.join(nm, '@linxin666');
  if (fs.existsSync(lxDir)) {
    for (const d of fs.readdirSync(lxDir, { withFileTypes: true })) {
      if (d.isDirectory()) subNames.add('@linxin666/' + d.name);
    }
  }
  for (const s of subNames) {
    if (!seen.has(s)) add(s, 'sub-of-web-all');
  }
}

console.log('TOTAL_PLUGINS=' + out.length);
fs.writeFileSync(path.join(process.env.TEMP, 'dsh-plugins.json'), JSON.stringify(out, null, 2), 'utf8');

for (const p of out) {
  console.log('### ' + p.name);
  console.log('ROLE: ' + p.role + '   VER: ' + p.version);
  console.log('DESC: ' + (p.desc || '（无）').slice(0, 200));
  if (p.permissions) console.log('PERM: ' + p.permissions.slice(0, 200));
  console.log('');
}
