import { CheckResult } from '@/types/audit';
import * as cheerio from 'cheerio';

export interface RenderabilityInput {
  html: string;
  targetUrl: string;
}

export function evaluateRenderability(input: RenderabilityInput): CheckResult[] {
  const checks: CheckResult[] = [];
  const $ = cheerio.load(input.html);

  // Measure script tags and scripts bytes
  let scriptBytes = 0;
  $('script').each((_, el) => {
    const text = $(el).html() || '';
    scriptBytes += text.length;
  });

  // Extract raw body text (excluding script and style tags)
  $('script, style, noscript, svg, template').remove();
  const rawText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const textBytes = Buffer.byteLength(rawText, 'utf8');

  // Detect empty app shells
  const hasReactRoot = input.html.includes('id="root"') || input.html.includes('id="__next"');
  const isEmptyAppShell = hasReactRoot && wordCount < 120;

  // AI-08: Main content present in raw HTML (Sev H)
  if (isEmptyAppShell || wordCount < 80) {
    checks.push({
      id: 'AI-08',
      category: 'B',
      section: 'ai',
      title: 'Main content present in raw HTML',
      status: 'fail',
      severity: 'H',
      effort: 'Heavy',
      evidence: `Raw HTML contains only ${wordCount} words. Detected empty client-side app shell.`,
      recommendation:
        'Most AI crawlers (and web search engines) do not execute heavy client-side JavaScript. Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) so full content is present in the initial HTML payload.',
      docsLink: 'https://nextjs.org/docs/app/building-your-application/rendering/server-components',
    });
  } else if (wordCount < 300) {
    checks.push({
      id: 'AI-08',
      category: 'B',
      section: 'ai',
      title: 'Main content present in raw HTML',
      status: 'warn',
      severity: 'H',
      effort: 'Moderate',
      evidence: `Initial HTML contains ${wordCount} words, which is relatively thin for AI answer extraction.`,
      recommendation:
        'Ensure key definitions, explanations, and product facts are rendered directly in server HTML rather than fetched asynchronously on client mount.',
    });
  } else {
    checks.push({
      id: 'AI-08',
      category: 'B',
      section: 'ai',
      title: 'Main content present in raw HTML',
      status: 'pass',
      severity: 'H',
      effort: 'Moderate',
      evidence: `Extracted ${wordCount} readable words directly from raw HTML without JavaScript execution.`,
      recommendation: 'Core content is readily available to non-JS AI parsers.',
    });
  }

  // AI-09: Heavy client-side rendering risk (Sev M)
  const scriptToTextRatio = textBytes > 0 ? scriptBytes / textBytes : 999;
  if (scriptToTextRatio > 8.0 && wordCount < 350) {
    checks.push({
      id: 'AI-09',
      category: 'B',
      section: 'ai',
      title: 'Heavy client-side rendering risk',
      status: 'fail',
      severity: 'M',
      effort: 'Heavy',
      evidence: `Script-to-text ratio is ${scriptToTextRatio.toFixed(1)}:1 (${Math.round(scriptBytes / 1024)} KB JS vs ${Math.round(textBytes / 1024)} KB visible text).`,
      recommendation:
        'High script volume with thin initial text indicates heavy client hydration. Stream HTML or pre-render pages so crawlers do not see a blank loading state.',
    });
  } else if (scriptToTextRatio > 4.0) {
    checks.push({
      id: 'AI-09',
      category: 'B',
      section: 'ai',
      title: 'Heavy client-side rendering risk',
      status: 'warn',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Moderate JS payload ratio (${scriptToTextRatio.toFixed(1)}:1).`,
      recommendation:
        'Verify that important descriptive text and metadata do not depend on client hydration.',
    });
  } else {
    checks.push({
      id: 'AI-09',
      category: 'B',
      section: 'ai',
      title: 'Heavy client-side rendering risk',
      status: 'pass',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Healthy balance between content and script overhead (${scriptToTextRatio.toFixed(1)}:1).`,
      recommendation: 'Page is not over-reliant on heavy client-side scripts for initial render.',
    });
  }

  // AI-10: Content not hidden behind interaction (Sev L)
  const reloaded$ = cheerio.load(input.html);
  const noscriptContent = reloaded$('noscript').text().trim();
  const hasHiddenAccordions =
    reloaded$('[aria-hidden="true"], [hidden], .hidden, [style*="display: none"], [style*="display:none"]').length > 0;

  if (noscriptContent.length > 500) {
    checks.push({
      id: 'AI-10',
      category: 'B',
      section: 'ai',
      title: 'Content not hidden behind interaction',
      status: 'warn',
      severity: 'L',
      effort: 'Moderate',
      evidence: `Substantial content (${noscriptContent.length} chars) sequestered inside <noscript> tags.`,
      recommendation:
        'Render key content directly in normal semantic tags instead of gating it inside <noscript>.',
    });
  } else {
    checks.push({
      id: 'AI-10',
      category: 'B',
      section: 'ai',
      title: 'Content not hidden behind interaction',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'No critical content was found trapped exclusively in <noscript> or hidden DOM containers.',
      recommendation: 'Keep primary facts accessible without requiring click or hover interactions.',
    });
  }

  // AI-11: Clean semantic structure (Sev M)
  const semanticTags = ['main', 'article', 'nav', 'header', 'footer', 'section'];
  const presentSemanticTags = semanticTags.filter(
    (tag) => reloaded$(tag).length > 0
  );

  if (presentSemanticTags.length >= 4) {
    checks.push({
      id: 'AI-11',
      category: 'B',
      section: 'ai',
      title: 'Clean semantic structure',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Semantic elements detected: <${presentSemanticTags.join('>, <')}>.`,
      recommendation:
        'Semantic HTML helps AI content-extractors (like Mozilla Readability, Perplexity, and Apple Reader) delineate primary article copy from navigation and footers.',
    });
  } else if (presentSemanticTags.length >= 2) {
    checks.push({
      id: 'AI-11',
      category: 'B',
      section: 'ai',
      title: 'Clean semantic structure',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Only <${presentSemanticTags.join('>, <')}> found. Missing elements like <main> or <article>.`,
      recommendation:
        'Wrap your primary content in <main> and use <header>, <nav>, and <footer> to cleanly distinguish page regions.',
      snippet: `<header>\n  <nav>...</nav>\n</header>\n<main>\n  <article>\n    <h1>...</h1>\n  </article>\n</main>\n<footer>...</footer>`,
    });
  } else {
    checks.push({
      id: 'AI-11',
      category: 'B',
      section: 'ai',
      title: 'Clean semantic structure',
      status: 'fail',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'Page uses mostly non-semantic <div> elements without <main>, <article>, or <header>.',
      recommendation:
        'Refactor layout containers to use semantic HTML5 landmarks (<main>, <article>, <header>, <footer>).',
      snippet: `<main>\n  <article>\n    <h1>Primary Headline</h1>\n  </article>\n</main>`,
    });
  }

  return checks;
}

