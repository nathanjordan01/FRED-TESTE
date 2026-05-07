const fs = require('fs');
const Papa = require('papaparse');

function fixCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = Papa.parse(raw);
  
  let fixedCount = 0;
  parsed.data.forEach((row, i) => {
    if (i === 0) return; // Header
    const url = row[7];
    if (url) {
      let cleanUrl = url.replace(/^\"(.*)\"$/, '$1').trim();
      if (!fs.existsSync('public' + cleanUrl)) {
        row[7] = ""; // Apaga o link quebrado
        fixedCount++;
      }
    }
  });

  const newCsv = Papa.unparse(parsed.data);
  fs.writeFileSync(filePath, newCsv, 'utf8');
  console.log(`Fixed ${fixedCount} broken URLs in ${filePath}`);
}

fixCsv('public/data/base_produtos_clean.csv');
fixCsv('public/data/base_produtos.csv');
