import { describe, it, expect } from 'vitest';
import { evaluateCrawlerAccess } from '@/lib/checks/crawler-access';
import { evaluateRenderability } from '@/lib/checks/renderability';
import { evaluateStructuredData } from '@/lib/checks/structured-data';
import { evaluateAnswerReady } from '@/lib/checks/answer-ready';
import { evaluateClassicOnPage } from '@/lib/checks/classic-onpage';
import { evaluatePerformanceChecks } from '@/lib/checks/classic-perf';
import { evaluateClassicSocial } from '@/lib/checks/classic-social';

describe('Check Catalogue Completeness', () => {
  it('evaluates comprehensive suite of AI & Classic checks', async () => {
    const sampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Citeify - AI Search & SEO Audit Tool Platform</title>
  <meta name="description" content="Paste any URL to get an instant AI search readiness score, crawler matrix, structured data validation, and prioritized fix checklist." />
  <link rel="canonical" href="https://citeify.app" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta property="og:title" content="Citeify - AI Search & SEO Audit Tool Platform" />
  <meta property="og:description" content="Paste any URL to get an instant AI search readiness score, crawler matrix, structured data validation, and prioritized fix checklist." />
  <meta property="og:url" content="https://citeify.app" />
  <meta property="og:type" content="website" />
  <meta property="og:image" content="https://citeify.app/og.png" />
  <meta property="og:site_name" content="Citeify" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/favicon.ico" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Citeify",
    "headline": "Citeify AI SEO Audit Platform",
    "url": "https://citeify.app",
    "sameAs": ["https://twitter.com/citeify", "https://linkedin.com/company/citeify"]
  }
  </script>
</head>
<body>
  <header><nav><a href="/about">About</a><a href="/contact">Contact</a></nav></header>
  <main>
    <article>
      <h1>Citeify AI SEO Audit Platform</h1>
      <p>Citeify provides comprehensive AI readiness audits, evaluating robots.txt, schema markup, and structured answers for ChatGPT and Google.</p>
      <h2>What is an AI SEO Audit?</h2>
      <p>An AI SEO audit evaluates how search bots and LLMs crawl, render, understand, and cite a webpage in generated answers, measuring machine readability and factual authority.</p>
      <h2>How does AI Search decide what to cite?</h2>
      <p>Answer engines parse raw HTML payloads and look for structured schema markup, verifiable statistics, author credentials, and logical question-answer blocks to generate citations.</p>
      <ul>
        <li>Crawler Access across 15+ bots</li>
        <li>Schema.org JSON-LD extraction</li>
      </ul>
      <div class="byline">Written by <a rel="author" href="/about">Citeify Team</a></div>
      <time datetime="2026-10-27">October 27, 2026</time>
    </article>
  </main>
  <footer>
    <a href="/about">About</a>
    <a href="/contact">Contact</a>
    <a href="/privacy">Privacy</a>
    <a href="https://twitter.com/citeify">Twitter</a>
    <a href="https://github.com/citeify/citeify">GitHub</a>
  </footer>
</body>
</html>`;

    // 1. Crawler access
    const crawlerEval = await evaluateCrawlerAccess({
      targetUrl: 'https://citeify.app',
      robotsTxtBody: 'User-agent: *\nAllow: /\n\nSitemap: https://citeify.app/sitemap.xml',
      robotsHttpFound: true,
      robotsUrl: 'https://citeify.app/robots.txt',
      sitemapFound: true,
      sitemapUrl: 'https://citeify.app/sitemap.xml',
      sitemapLastmodCount: 5,
      llmsTxtFound: true,
      llmsTxtValid: true,
      llmsTxtUrl: 'https://citeify.app/llms.txt',
    });
    expect(crawlerEval.checks.some((c) => c.id === 'AI-01')).toBe(true);
    expect(crawlerEval.checks.some((c) => c.id === 'AI-02')).toBe(true);
    expect(crawlerEval.checks.some((c) => c.id === 'AI-03')).toBe(true);
    expect(crawlerEval.checks.some((c) => c.id === 'AI-06')).toBe(true);
    expect(crawlerEval.checks.some((c) => c.id === 'AI-07')).toBe(true);

    // 2. Renderability
    const renderChecks = evaluateRenderability({
      html: sampleHtml,
      targetUrl: 'https://citeify.app',
    });
    expect(renderChecks.some((c) => c.id === 'AI-08')).toBe(true);
    expect(renderChecks.some((c) => c.id === 'AI-09')).toBe(true);
    expect(renderChecks.some((c) => c.id === 'AI-11')).toBe(true);

    // 3. Structured Data
    const structuredEval = evaluateStructuredData({
      html: sampleHtml,
      targetUrl: 'https://citeify.app',
    });
    expect(structuredEval.checks.some((c) => c.id === 'AI-12')).toBe(true);
    expect(structuredEval.checks.some((c) => c.id === 'AI-13')).toBe(true);
    expect(structuredEval.checks.some((c) => c.id === 'AI-15')).toBe(true);
    expect(structuredEval.report.hasEntityLinking).toBe(true);

    // 4. Answer-Ready
    const answerChecks = evaluateAnswerReady({
      html: sampleHtml,
      hasFaqSchema: false,
    });
    expect(answerChecks.some((c) => c.id === 'AI-17')).toBe(true);
    expect(answerChecks.some((c) => c.id === 'AI-18')).toBe(true);
    expect(answerChecks.some((c) => c.id === 'AI-19')).toBe(true);
    expect(answerChecks.some((c) => c.id === 'AI-20')).toBe(true);

    // 5. Classic On-page
    const onPageChecks = evaluateClassicOnPage({
      html: sampleHtml,
      targetUrl: 'https://citeify.app',
      finalUrl: 'https://citeify.app',
    });
    expect(onPageChecks.some((c) => c.id === 'SEO-01')).toBe(true);
    expect(onPageChecks.some((c) => c.id === 'SEO-02')).toBe(true);
    expect(onPageChecks.some((c) => c.id === 'SEO-03')).toBe(true);

    // 6. Classic Social
    const socialChecks = evaluateClassicSocial({
      html: sampleHtml,
      targetUrl: 'https://citeify.app',
    });
    expect(socialChecks.some((c) => c.id === 'SEO-20')).toBe(true);
    expect(socialChecks.some((c) => c.id === 'SEO-21')).toBe(true);

    // 7. Performance
    const perfChecks = evaluatePerformanceChecks({
      isAvailable: true,
      lcp: 1.5,
      cls: 0.02,
      tbt: 50,
      inp: 70,
      performanceScore: 95,
      accessibilityScore: 98,
      source: 'google-psi',
    });
    expect(perfChecks.some((c) => c.id === 'SEO-16')).toBe(true);
    expect(perfChecks.some((c) => c.id === 'SEO-17')).toBe(true);
    expect(perfChecks.some((c) => c.id === 'SEO-18')).toBe(true);
    expect(perfChecks.some((c) => c.id === 'SEO-19')).toBe(true);
  });
});
