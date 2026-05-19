// Build a Reveal.js-based standalone HTML from SLIDES_GAP_TO_PROGRESS.md
// Pipeline:
//   1a. ECharts blocks → SSR-rendered SVG (themed)
//   1b. mmdc renders remaining Mermaid blocks to SVGs (themed)
//   2.  Each SVG is inlined as base64 data URI in markdown
//   3.  Result is embedded in a Reveal.js HTML template
//
// Output is self-contained: charts are pre-rendered SVGs, no Mermaid CDN
// needed at runtime. Only Reveal.js/Pretendard CSS still loads from CDN
// (small, cacheable, falls back gracefully if blocked).

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');
const { renderEchartsToSvg } = require('./echarts-ssr');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'SLIDES_GAP_TO_PROGRESS.md');
const OUT = path.join(ROOT, 'SLIDES_GAP_TO_PROGRESS.html');
const WORK = __dirname;
const RENDERED_MD = path.join(WORK, 'rendered.md');

// ---- Step 1a: render ECharts blocks to themed SVGs ----
console.log('[1a/3] Rendering ECharts blocks via SSR...');
let srcText = fs.readFileSync(SRC, 'utf8');

// Clean up stale echarts SVGs from previous builds
for (const f of fs.readdirSync(WORK)) {
  if (/^rendered-echarts-\d+\.svg$/.test(f)) fs.unlinkSync(path.join(WORK, f));
}

const echartsBlockRe = /```echarts(?:\s+w=(\d+))?(?:\s+h=(\d+))?\r?\n([\s\S]*?)\r?\n```/g;
let echartsIdx = 0;
srcText = srcText.replace(echartsBlockRe, (_match, wStr, hStr, body) => {
  echartsIdx += 1;
  const width = wStr ? parseInt(wStr, 10) : 900;
  const height = hStr ? parseInt(hStr, 10) : 520;
  let option;
  try {
    option = JSON.parse(body);
  } catch (e) {
    console.error(`  ! echarts block #${echartsIdx} JSON parse error:`, e.message);
    process.exit(1);
  }
  const svg = renderEchartsToSvg(option, { width, height });
  const fname = `rendered-echarts-${echartsIdx}.svg`;
  fs.writeFileSync(path.join(WORK, fname), svg, 'utf8');
  console.log(`  ✅ echarts #${echartsIdx} → ${fname} (${svg.length} bytes, ${width}×${height})`);
  return `![echarts-${echartsIdx}](./${fname})`;
});
console.log(`[1a/3] Rendered ${echartsIdx} ECharts chart${echartsIdx === 1 ? '' : 's'}.`);

// ---- Step 1b: run mmdc on the (echarts-substituted) markdown ----
console.log('[1b/3] Rendering Mermaid blocks via mmdc (themed)...');
const srcCopy = path.join(WORK, '.src.tmp.md');
fs.writeFileSync(srcCopy, srcText, 'utf8');
const MERMAID_CONFIG = path.join(WORK, 'mermaid-config.json');
const PUPPETEER_CONFIG = path.join(WORK, 'puppeteer-config.json');
const mmdcResult = spawnSync(
  'npx',
  ['--yes', '-p', '@mermaid-js/mermaid-cli', 'mmdc',
    '-i', srcCopy,
    '-o', RENDERED_MD,
    '-c', MERMAID_CONFIG,
    '-p', PUPPETEER_CONFIG,
    '--backgroundColor', 'white'],
  { cwd: WORK, stdio: 'inherit', shell: true }
);
if (mmdcResult.status !== 0) {
  console.error('mmdc failed with status', mmdcResult.status, 'error:', mmdcResult.error?.message);
  process.exit(1);
}
fs.unlinkSync(srcCopy);

// ---- Step 2: inline SVGs as base64 data URIs ----
console.log('[2/3] Inlining SVGs as base64 data URIs...');
let md = fs.readFileSync(RENDERED_MD, 'utf8');
// mmdc emits image references like:  ![diagram](./rendered-N.svg) or rendered-N.svg
md = md.replace(/!\[([^\]]*)\]\(\.?\/?([^)]+\.svg)\)/g, (_, alt, fname) => {
  const svgPath = path.join(WORK, fname);
  if (!fs.existsSync(svgPath)) {
    console.warn('  ! missing svg:', fname);
    return _;
  }
  const svgText = fs.readFileSync(svgPath, 'utf8');
  const b64 = Buffer.from(svgText, 'utf8').toString('base64');
  return `![${alt}](data:image/svg+xml;base64,${b64})`;
});

// ---- Step 3: strip Marp frontmatter & directives, wrap in Reveal.js HTML ----
console.log('[3/3] Wrapping in Reveal.js HTML template...');
// Strip Marp frontmatter (first --- ... --- block at top)
md = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');
// Map Marp _class directives to Reveal.js slide attributes
md = md.replace(/<!--\s*_?class:\s*([^>\s]+)\s*-->/g, (_, cls) => `<!-- .slide: class="${cls}" -->`);
md = md.replace(/<!--\s*_?(header|footer):.*?-->/g, '');

// Read theme.css (design tokens + slide masters) for inlining
const THEME_CSS = fs.readFileSync(path.join(WORK, 'theme.css'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="ko-KR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=1280">
<title>수능 영어, 거리로 보다 — ET-Craft</title>

<link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.css">

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reset.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/white.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/monokai.css">

<style>
${THEME_CSS}
</style>
</head>
<body>

<div id="loading">슬라이드 로딩 중…</div>

<div class="reveal">
  <div class="slides">
    <section data-markdown
             data-separator="^\\r?\\n---\\r?\\n"
             data-separator-vertical="^\\r?\\n----\\r?\\n"
             data-charset="utf-8">
      <textarea data-template>
${md}
      </textarea>
    </section>
  </div>
</div>

<div class="deck-footer">ET-Craft · 측정 가능한 영어교육 · 수능 1등급까지의 거리, 계량화하다</div>

<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"></script>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/markdown/markdown.js"></script>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/highlight.js"></script>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/notes/notes.js"></script>

<script>
  Reveal.initialize({
    hash: true,
    slideNumber: 'c/t',
    controls: true,
    progress: true,
    transition: 'slide',
    transitionSpeed: 'fast',
    width: 1280,
    height: 800,
    margin: 0.04,
    minScale: 0.2,
    maxScale: 2,
    plugins: [RevealMarkdown, RevealHighlight, RevealNotes]
  }).then(() => {
    document.body.classList.add('loaded');
  });
</script>

</body>
</html>
`;

fs.writeFileSync(OUT, html, 'utf8');
console.log(`Wrote ${OUT} (${html.length} bytes)`);
