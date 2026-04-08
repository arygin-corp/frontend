const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT = process.env.PROJECT || 'root';
const PKG_PATH =
  process.env.PACKAGE_JSON ||
  path.resolve(__dirname, '../package.json');

const COUNTER_DIR = path.resolve(__dirname, '../.build-counters');
const COUNTER_PATH = path.join(COUNTER_DIR, `${PROJECT}.json`);

if (!fs.existsSync(COUNTER_DIR)) {
  fs.mkdirSync(COUNTER_DIR);
}

const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));

// ---- Date + Time
const now = new Date();
const yy = now.getFullYear().toString().slice(-2);
const mm = now.getMonth() + 1;
const dd = now.getDate();
const hh = String(now.getHours()).padStart(2, '0');
const min = String(now.getMinutes()).padStart(2, '0');
const ss = String(now.getSeconds()).padStart(2, '0');

const buildTime = `${hh}:${min}:${ss}`;
const versionCore = `${yy}.${mm}.${dd}.${buildTime}`;

// ---- Branch
let branch = process.env.GIT_BRANCH;
if (!branch) {
  branch = execSync('git rev-parse --abbrev-ref HEAD')
    .toString()
    .trim();
}

// ---- Prerelease mapping
const prereleaseRules = [
  { match: /^main$/, label: null },
  { match: /^release\//, label: 'rc' },
  { match: /^hotfix\//, label: 'rc' },
  { match: /^develop$/, label: 'beta' },
  { match: /^feature\//, label: 'alpha' }
];

let preLabel = null;
for (const rule of prereleaseRules) {
  if (rule.match.test(branch)) {
    preLabel = rule.label;
    break;
  }
}

// ---- Prerelease counter (per project)
let counter = { pre: 0 };
if (fs.existsSync(COUNTER_PATH)) {
  counter = JSON.parse(fs.readFileSync(COUNTER_PATH, 'utf8'));
}

let version = versionCore;

if (preLabel) {
  counter.pre += 1;
  version = `${versionCore}-${preLabel}.${counter.pre}`;
} else {
  counter.pre = 0;
}

// ---- Write outputs
pkg.version = version;

fs.writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
fs.writeFileSync(COUNTER_PATH, JSON.stringify(counter, null, 2));

console.log(`✅ ${PROJECT} version → ${version}`);

// ---- Git tag (main only)
if (!preLabel && branch === 'main') {
  try {
    execSync(`git tag -a v${version} -m "Release ${version}"`);
    console.log(`🏷️  Tag created: v${version}`);
  } catch {
    console.log('ℹ️  Git tag skipped');
  }
}


















// const fs = require('fs');
// const path = require('path');

// // Resolve path to package.json (assuming script is in build/ folder)
// const packageJsonPath = path.resolve(__dirname, '../package.json');
// const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// const now = new Date();

// const yy = now.getFullYear().toString().slice(-2);
// const mm = (now.getMonth() + 1).toString(); // Month is 0-indexed
// const dd = now.getDate();

// const currentVersion = packageJson.version;
// const parts = currentVersion.split('.');

// let patch = 0;

// // Check if we should increment or reset
// if (parts.length === 3) {
//     const [prevYY, prevM, prevPatch] = parts;
//     if (prevYY === yy && prevM === m) {
//         // Same month/year, increment patch
//         patch = parseInt(prevPatch, 10) + 1;
//     } else {
//         // New month or year, reset patch to 0
//         patch = 0;
//     }
// } else {
//     // Non-matching format, start fresh
//     patch = 0;
// }

// const newVersion = `${yy}.${mm}.${dd}`;

// const oldVersion = packageJson.version;
// packageJson.version = newVersion;

// // Write back to package.json with formatting
// fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

// console.log(`Build Version Updated: ${oldVersion} -> ${newVersion}`);