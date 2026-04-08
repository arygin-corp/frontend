const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const replaceFile = require('replace-in-file');

// -------- Config
const TIMEZONE = process.env.BUILD_TZ || 'America/Chicago';
const TZ_LABEL = process.env.BUILD_TZ_LABEL || 'CT';

// -------- Load package.json
const packageJsonPath = path.resolve(__dirname, './../package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// -------- Date + Time (12‑hour + AM/PM + TZ)
const now = new Date();

const dateParts = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE,
  year: '2-digit',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true
}).formatToParts(now);

const get = t => dateParts.find(p => p.type === t)?.value;

const yy = get('year');
const mm = get('month');
const dd = get('day');
const hh = String(get('hour')).padStart(2, '0');
const mi = get('minute');
const ss = get('second');
const ampm = get('dayPeriod').toUpperCase();

// const buildTime = `${hh}:${mi}:${ss}${ampm}-${TZ_LABEL}`;
const buildTime = `${hh}:${mi}:${ss}${ampm}`;
const baseVersion = `${yy}.${mm}.${dd}.${buildTime}`;

// -------- Branch detection
let branch = process.env.GIT_BRANCH;
if (!branch) {
  branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
}

// -------- Pre‑release mapping
let prerelease = null;
if (/^develop$/.test(branch)) prerelease = 'beta';
else if (/^feature\//.test(branch)) prerelease = 'alpha';
else if (/^release\//.test(branch)) prerelease = 'rc';
else if (/^hotfix\//.test(branch)) prerelease = 'rc';

// -------- Prerelease counter
const counterFile = path.resolve(__dirname, '../.prerelease-counter.json');
let counter = { version: baseVersion, count: 0 };

if (fs.existsSync(counterFile)) {
  const prev = JSON.parse(fs.readFileSync(counterFile, 'utf8'));
  if (prev.version === baseVersion && prerelease) {
    counter.count = prev.count + 1;
  }
}

let finalVersion = baseVersion;
if (prerelease) {
  finalVersion = `${baseVersion}-${prerelease}.${counter.count + 1}`;
}

// -------- Persist version
pkg.version = finalVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n');
fs.writeFileSync(
  counterFile,
  JSON.stringify({ version: baseVersion, count: counter.count + 1 }, null, 2)
);

// -------- Inject into Angular env files
replaceFile.sync({
  files: [
    'src/environments/environment.ts',
    'src/environments/environment.local.ts',
    'src/environments/environment.demo.ts',
    'src/environments/environment.dev.ts',
    'src/environments/environment.qa.ts',
    'src/environments/environment.stage.ts',
    'src/environments/environment.prod.ts'
  ],
  from: /version: '(.*)'/g,
  to: `version: '${finalVersion}'`
});

// -------- Git tag (main only)
if (!prerelease && branch === 'main') {
  try {
    execSync(`git tag -a v${finalVersion} -m "Release ${finalVersion}"`);
    console.log(`🏷 Tag created: v${finalVersion}`);
  } catch {
    console.log('ℹ Tag skipped');
  }
}

console.log(`✅ Version generated: ${finalVersion}`);