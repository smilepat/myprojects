// Inline all rendered-N.svg references in rendered.md as base64 data URIs
// Produces rendered_inline.md
const fs = require('fs');
const path = require('path');

const src = fs.readFileSync('rendered.md', 'utf8');
const inlined = src.replace(/!\[([^\]]*)\]\(\.\/(rendered-\d+\.svg)\)/g, (_, alt, fname) => {
  const svgPath = path.join('.', fname);
  const svgText = fs.readFileSync(svgPath, 'utf8');
  const b64 = Buffer.from(svgText, 'utf8').toString('base64');
  return `![${alt}](data:image/svg+xml;base64,${b64})`;
});
fs.writeFileSync('rendered_inline.md', inlined);
console.log('Wrote rendered_inline.md, size:', inlined.length);
