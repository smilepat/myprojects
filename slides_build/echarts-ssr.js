// ECharts SSR helper — renders option JSON to an SVG string.
// Uses ECharts 5.x native SSR (renderer:'svg' + ssr:true), no jsdom needed.

const echarts = require('echarts');

// Shared theme tokens (kept in sync with theme.css and mermaid-config.json)
const TOKENS = {
  primary:        '#2563eb',
  primaryLight:   '#dbeafe',
  primaryDark:    '#1e40af',
  accent:         '#ef4444',
  accentLight:    '#fee2e2',
  success:        '#10b981',
  successLight:   '#dcfce7',
  warning:        '#f59e0b',
  warningLight:   '#fef3c7',
  purple:         '#8b5cf6',
  text:           '#0f172a',
  textMuted:      '#64748b',
  textFaint:      '#94a3b8',
  border:         '#e2e8f0',
  bg:             '#ffffff',
  bgCard:         '#f8fafc',
};

const PALETTE = [TOKENS.primary, TOKENS.accent, TOKENS.success, TOKENS.warning, TOKENS.purple, '#ec4899'];

const FONT_FAMILY = "'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

// Register a custom theme with our design tokens.
echarts.registerTheme('et-craft', {
  color: PALETTE,
  backgroundColor: TOKENS.bg,
  textStyle: {
    fontFamily: FONT_FAMILY,
    color: TOKENS.text,
  },
  title: {
    textStyle: {
      fontFamily: FONT_FAMILY,
      color: TOKENS.text,
      fontWeight: 700,
      fontSize: 18,
    },
    subtextStyle: { color: TOKENS.textMuted, fontSize: 13 },
  },
  legend: {
    textStyle: { color: TOKENS.text, fontFamily: FONT_FAMILY, fontSize: 13 },
  },
  tooltip: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderWidth: 0,
    textStyle: { color: '#fff', fontFamily: FONT_FAMILY },
  },
  axisPointer: {
    lineStyle: { color: TOKENS.textMuted },
    crossStyle: { color: TOKENS.textMuted },
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: TOKENS.border } },
    axisTick: { lineStyle: { color: TOKENS.border } },
    axisLabel: { color: TOKENS.textMuted, fontFamily: FONT_FAMILY, fontSize: 12 },
    splitLine: { lineStyle: { color: TOKENS.border, type: 'dashed' } },
    nameTextStyle: { color: TOKENS.text, fontFamily: FONT_FAMILY },
  },
  valueAxis: {
    axisLine: { lineStyle: { color: TOKENS.border } },
    axisTick: { lineStyle: { color: TOKENS.border } },
    axisLabel: { color: TOKENS.textMuted, fontFamily: FONT_FAMILY, fontSize: 12 },
    splitLine: { lineStyle: { color: TOKENS.border, type: 'dashed' } },
    nameTextStyle: { color: TOKENS.text, fontFamily: FONT_FAMILY },
  },
  radar: {
    axisLine: { lineStyle: { color: TOKENS.border } },
    splitLine: { lineStyle: { color: TOKENS.border } },
    splitArea: { areaStyle: { color: ['rgba(248,250,252,0.4)', 'rgba(255,255,255,0)'] } },
    axisName: { color: TOKENS.text, fontFamily: FONT_FAMILY, fontSize: 13, fontWeight: 600 },
  },
  bar: {
    itemStyle: { borderRadius: [4, 4, 0, 0] },
  },
});

/**
 * Render an ECharts option JSON to an SVG string.
 * @param {object} option - ECharts option (parsed JSON).
 * @param {object} [opts]
 * @param {number} [opts.width=900]
 * @param {number} [opts.height=520]
 * @returns {string} svg markup
 */
function renderEchartsToSvg(option, opts = {}) {
  const width = opts.width || 900;
  const height = opts.height || 520;

  const chart = echarts.init(null, 'et-craft', {
    renderer: 'svg',
    ssr: true,
    width,
    height,
  });

  // Apply some sensible defaults if not overridden
  const merged = {
    animation: false,
    grid: { left: 60, right: 24, top: 50, bottom: 50, containLabel: true },
    ...option,
  };

  chart.setOption(merged);
  const svg = chart.renderToSVGString();
  chart.dispose();
  return svg;
}

module.exports = { renderEchartsToSvg, TOKENS, PALETTE, FONT_FAMILY };
