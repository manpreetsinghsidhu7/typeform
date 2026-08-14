const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'src'));
let replacedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.match(/\bgray-/)) {
    const newContent = content.replace(/\bgray-/g, 'neutral-');
    fs.writeFileSync(file, newContent, 'utf8');
    replacedCount++;
  }
});

console.log(`Replaced 'gray-' with 'neutral-' in ${replacedCount} files.`);
