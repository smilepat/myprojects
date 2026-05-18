// Build a Reveal.js-based standalone HTML from SLIDES_GAP_TO_PROGRESS.md
// Pipeline:
//   1. mmdc renders all Mermaid blocks to SVGs (deterministic, server-side)
//   2. Each SVG is inlined as base64 data URI in markdown
//   3. Result is embedded in a Reveal.js HTML template
//
// Output is self-contained: charts are pre-rendered SVGs, no Mermaid CDN
// needed at runtime. Only Reveal.js/Pretendard CSS still loads from CDN
// (small, cacheable, falls back gracefully if blocked).

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'SLIDES_GAP_TO_PROGRESS.md');
const OUT = path.join(ROOT, 'SLIDES_GAP_TO_PROGRESS.html');
const WORK = __dirname;
const RENDERED_MD = path.join(WORK, 'rendered.md');

// ---- Step 1: run mmdc to render Mermaid blocks ----
console.log('[1/3] Rendering Mermaid blocks via mmdc...');
// Use the source markdown directly; mmdc will preserve everything else and
// only substitute mermaid blocks with image references.
const srcCopy = path.join(WORK, '.src.tmp.md');
fs.copyFileSync(SRC, srcCopy);
const mmdcResult = spawnSync(
  'npx',
  ['--yes', '-p', '@mermaid-js/mermaid-cli', 'mmdc', '-i', srcCopy, '-o', RENDERED_MD, '--backgroundColor', 'white'],
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
  :root {
    --r-main-font: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, Roboto, 'Helvetica Neue', 'Segoe UI', sans-serif;
    --r-heading-font: var(--r-main-font);
    --r-main-font-size: 26px;
    --r-main-color: #1f2937;
    --r-heading-color: #0f172a;
    --r-link-color: #2563eb;
    --r-background-color: #ffffff;
    --r-block-margin: 16px;
  }
  .reveal { font-family: var(--r-main-font); color: var(--r-main-color); }
  .reveal h1 { font-size: 1.7em; margin-bottom: 0.4em; font-weight: 700; color: var(--r-heading-color); letter-spacing: -0.02em; }
  .reveal h2 { font-size: 1.25em; margin-bottom: 0.5em; font-weight: 600; color: var(--r-heading-color); }
  .reveal h3 { font-size: 1.05em; font-weight: 600; color: var(--r-heading-color); }
  .reveal p, .reveal li { font-size: 0.9em; line-height: 1.5; }
  .reveal blockquote {
    width: 92%; padding: 12px 18px; margin: 12px auto;
    background: #f8fafc; border-left: 4px solid #94a3b8;
    font-size: 0.78em; font-style: normal; color: #475569;
    box-shadow: none;
  }
  .reveal table {
    margin: 8px auto; border-collapse: collapse; font-size: 0.65em;
    background: white; max-width: 95%;
  }
  .reveal table th { background: #f1f5f9; color: #0f172a; font-weight: 600; padding: 6px 12px; border: 1px solid #e2e8f0; text-align: left; }
  .reveal table td { padding: 5px 12px; border: 1px solid #e2e8f0; vertical-align: top; }
  .reveal table tr:nth-child(even) td { background: #fafbfc; }
  .reveal code { font-family: 'JetBrains Mono', 'D2Coding', Consolas, monospace; font-size: 0.85em; background: #f1f5f9; padding: 1px 6px; border-radius: 3px; }
  .reveal pre code { font-size: 0.7em; line-height: 1.45; padding: 12px; border-radius: 6px; }
  .reveal a { color: var(--r-link-color); text-decoration: none; border-bottom: 1px dotted; }
  .reveal a:hover { border-bottom-style: solid; }
  .reveal strong { color: #0f172a; font-weight: 700; }
  .reveal hr { display: none; }
  /* Mermaid SVG sizing */
  .reveal img {
    display: block; margin: 8px auto;
    max-width: 95%; max-height: 460px;
    background: white;
  }
  .reveal .slides section.lead { text-align: center; }
  .reveal .slides section.lead h1 { font-size: 2.2em; margin-bottom: 0.3em; }
  .reveal .slides section.lead h3 { font-size: 1.1em; color: #64748b; font-weight: 400; }
  .reveal .slides section { text-align: left; padding: 24px 36px; box-sizing: border-box; height: 100%; }
  .reveal .slides section > h1:first-child,
  .reveal .slides section > h2:first-child { margin-top: 0; }
  .deck-footer {
    position: fixed; bottom: 8px; right: 16px; z-index: 10;
    font-size: 11px; color: #94a3b8; font-family: var(--r-main-font);
  }
  .reveal .progress { color: #2563eb; height: 4px; }
  .reveal .slide-number {
    background: rgba(15, 23, 42, 0.6); color: white; font-size: 12px;
    padding: 2px 8px; border-radius: 3px; right: 12px; bottom: 12px;
  }
  #loading {
    position: fixed; inset: 0; display: flex; align-items: center; justify-content: center;
    background: white; z-index: 100;
    font-family: var(--r-main-font); color: #64748b;
  }
  body.loaded #loading { display: none; }
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
