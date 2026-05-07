const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('c:\\Users\\thiag\\Downloads\\PDFs-20260408T161521Z-3-001\\PDFs\\joelho-90-graus-painel-jic-37-graus.pdf');
pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(console.error);
