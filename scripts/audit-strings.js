const fs = require('fs');
const path = require('path');

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let files = [];
  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);
    if (fs.statSync(full).isDirectory()) {
      files = files.concat(getAllFiles(full, exts));
    } else if (exts.some(e => full.endsWith(e))) {
      files.push(full);
    }
  }
  return files;
}

const srcFiles = getAllFiles(path.join(__dirname, '..', 'src'));
console.log('Total source files found:', srcFiles.length);

const results = {};

for (const f of srcFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const relPath = path.relative(path.join(__dirname, '..'), f);
  
  // Look for Devanagari characters
  const devanagariMatches = content.match(/[\u0900-\u097F]+/g) || [];
  
  // Look for hardcoded JSX text, aria-label, title, placeholder, alert, confirm
  const alertMatches = content.match(/(alert|confirm)\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g) || [];
  const placeholderMatches = content.match(/placeholder\s*=\s*['"`]([^'"`]+)['"`]/g) || [];
  const ariaMatches = content.match(/aria-label\s*=\s*['"`]([^'"`]+)['"`]/g) || [];
  const titleMatches = content.match(/title\s*=\s*['"`]([^'"`]+)['"`]/g) || [];

  results[relPath] = {
    devanagariCount: devanagariMatches.length,
    alerts: alertMatches,
    placeholders: placeholderMatches,
    arias: ariaMatches,
    titles: titleMatches,
  };
}

for (const [file, info] of Object.entries(results)) {
  if (info.devanagariCount > 0 || info.alerts.length > 0 || info.placeholders.length > 0 || info.arias.length > 0 || info.titles.length > 0) {
    console.log(`\nFILE: ${file}`);
    console.log(`  Devanagari text snippets: ${info.devanagariCount}`);
    if (info.alerts.length) console.log(`  Alerts/Confirms:`, info.alerts);
    if (info.placeholders.length) console.log(`  Placeholders:`, info.placeholders);
    if (info.arias.length) console.log(`  Aria labels:`, info.arias);
    if (info.titles.length) console.log(`  Titles:`, info.titles);
  }
}
