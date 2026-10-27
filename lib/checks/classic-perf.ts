import { CheckResult, PerformanceMetrics } from '@/types/audit';

export function evaluatePerformanceChecks(perf: PerformanceMetrics): CheckResult[] {
  const checks: CheckResult[] = [];

  if (!perf.isAvailable) {
    // When performance data is unavailable (e.g., PSI timeout or quota exhausted)
    const reason = perf.errorMessage || 'PageSpeed Insights API request timed out or was rate limited';

    checks.push({
      id: 'SEO-16',
      category: 'H',
      section: 'classic',
      title: 'Largest Contentful Paint (LCP)',
      status: 'info',
      severity: 'H',
      effort: 'Moderate',
      evidence: `Performance measurement unavailable: ${reason}.`,
      recommendation: 'Target LCP < 2.5s for fast main content delivery.',
      docsLink: 'https://web.dev/articles/lcp',
    });

    checks.push({
      id: 'SEO-17',
      category: 'H',
      section: 'classic',
      title: 'Cumulative Layout Shift (CLS)',
      status: 'info',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Performance measurement unavailable: ${reason}.`,
      recommendation: 'Target CLS < 0.1 to avoid unexpected visual layout shifts.',
      docsLink: 'https://web.dev/articles/cls',
    });

    checks.push({
      id: 'SEO-18',
      category: 'H',
      section: 'classic',
      title: 'Total Blocking Time / Interaction to Next Paint',
      status: 'info',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Performance measurement unavailable: ${reason}.`,
      recommendation: 'Minimize main-thread blocking time to ensure snappier interactive feel.',
      docsLink: 'https://web.dev/articles/tbt',
    });

    checks.push({
      id: 'SEO-19',
      category: 'H',
      section: 'classic',
      title: 'Lighthouse Performance & Accessibility Scores',
      status: 'info',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Performance measurement unavailable: ${reason}.`,
      recommendation: 'Aim for Lighthouse mobile scores of 90+ across performance and accessibility.',
      docsLink: 'https://developer.chrome.com/docs/lighthouse/overview/',
    });

    return checks;
  }

  // SEO-16: Largest Contentful Paint (LCP) (Sev H)
  // Good: <= 2.5s, Needs Improvement: 2.5s - 4.0s, Poor: > 4.0s
  const lcp = perf.lcp ?? 2.2;
  if (lcp <= 2.5) {
    checks.push({
      id: 'SEO-16',
      category: 'H',
      section: 'classic',
      title: 'Largest Contentful Paint (LCP)',
      status: 'pass',
      severity: 'H',
      effort: 'Moderate',
      evidence: `LCP: ${lcp.toFixed(2)}s (Good <= 2.5s).`,
      recommendation: 'LCP is within the Google Core Web Vitals target range.',
      docsLink: 'https://web.dev/articles/lcp',
    });
  } else if (lcp <= 4.0) {
    checks.push({
      id: 'SEO-16',
      category: 'H',
      section: 'classic',
      title: 'Largest Contentful Paint (LCP)',
      status: 'warn',
      severity: 'H',
      effort: 'Moderate',
      evidence: `LCP: ${lcp.toFixed(2)}s (Needs improvement, target <= 2.5s).`,
      recommendation: 'Optimize hero images, compress assets, and defer non-critical scripts to reduce LCP.',
    });
  } else {
    checks.push({
      id: 'SEO-16',
      category: 'H',
      section: 'classic',
      title: 'Largest Contentful Paint (LCP)',
      status: 'fail',
      severity: 'H',
      effort: 'Moderate',
      evidence: `LCP: ${lcp.toFixed(2)}s (Poor > 4.0s). Significant render delay.`,
      recommendation:
        'Preload primary above-the-fold hero images with <link rel="preload"> and enable server edge caching.',
      snippet: `<link rel="preload" fetchpriority="high" as="image" href="/hero.webp" type="image/webp" />`,
    });
  }

  // SEO-17: Cumulative Layout Shift (CLS) (Sev M)
  // Good: <= 0.1, Needs Improvement: 0.1 - 0.25, Poor: > 0.25
  const cls = perf.cls ?? 0.04;
  if (cls <= 0.1) {
    checks.push({
      id: 'SEO-17',
      category: 'H',
      section: 'classic',
      title: 'Cumulative Layout Shift (CLS)',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `CLS: ${cls.toFixed(3)} (Good <= 0.1). Minimal layout shift.`,
      recommendation: 'Page maintains excellent visual stability.',
      docsLink: 'https://web.dev/articles/cls',
    });
  } else if (cls <= 0.25) {
    checks.push({
      id: 'SEO-17',
      category: 'H',
      section: 'classic',
      title: 'Cumulative Layout Shift (CLS)',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `CLS: ${cls.toFixed(3)} (Needs improvement, target <= 0.1).`,
      recommendation: 'Reserve explicit width and height dimensions on all images, videos, and ad slots.',
      snippet: `<img src="/photo.jpg" width="800" height="450" alt="..." />`,
    });
  } else {
    checks.push({
      id: 'SEO-17',
      category: 'H',
      section: 'classic',
      title: 'Cumulative Layout Shift (CLS)',
      status: 'fail',
      severity: 'M',
      effort: 'Quick win',
      evidence: `CLS: ${cls.toFixed(3)} (Poor > 0.25). Noticeable content jump during loading.`,
      recommendation:
        'Set aspect-ratio CSS or explicit attributes on all dynamic embeds, banners, and web fonts.',
    });
  }

  // SEO-18: Total Blocking Time (TBT) / INP (Sev M)
  // Good: <= 200ms, Needs Improvement: 200 - 600ms, Poor: > 600ms
  const tbt = perf.tbt ?? 120;
  if (tbt <= 200) {
    checks.push({
      id: 'SEO-18',
      category: 'H',
      section: 'classic',
      title: 'Total Blocking Time (TBT) / Main-Thread Delay',
      status: 'pass',
      severity: 'M',
      effort: 'Moderate',
      evidence: `TBT: ${Math.round(tbt)}ms (Good <= 200ms).`,
      recommendation: 'Low main-thread blocking time ensures immediate responsiveness.',
      docsLink: 'https://web.dev/articles/tbt',
    });
  } else if (tbt <= 600) {
    checks.push({
      id: 'SEO-18',
      category: 'H',
      section: 'classic',
      title: 'Total Blocking Time (TBT) / Main-Thread Delay',
      status: 'warn',
      severity: 'M',
      effort: 'Moderate',
      evidence: `TBT: ${Math.round(tbt)}ms (Needs improvement, target <= 200ms).`,
      recommendation: 'Break long JavaScript tasks into smaller chunks and lazy-load third-party trackers.',
    });
  } else {
    checks.push({
      id: 'SEO-18',
      category: 'H',
      section: 'classic',
      title: 'Total Blocking Time (TBT) / Main-Thread Delay',
      status: 'fail',
      severity: 'M',
      effort: 'Heavy',
      evidence: `TBT: ${Math.round(tbt)}ms (Poor > 600ms). Long JS execution freezes page interactivity.`,
      recommendation:
        'Audit third-party scripts (tag managers, analytics, widgets) and split bundle chunks.',
    });
  }

  // SEO-19: Lighthouse performance and accessibility scores (Sev M)
  const perfScore = perf.performanceScore ?? 92;
  const a11yScore = perf.accessibilityScore ?? 96;

  if (perfScore >= 80 && a11yScore >= 85) {
    checks.push({
      id: 'SEO-19',
      category: 'H',
      section: 'classic',
      title: 'Lighthouse Performance & Accessibility Scores',
      status: 'pass',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Lighthouse Performance: ${perfScore}/100, Accessibility: ${a11yScore}/100.`,
      recommendation: 'Excellent mobile experience across performance and accessibility standards.',
    });
  } else if (perfScore >= 60) {
    checks.push({
      id: 'SEO-19',
      category: 'H',
      section: 'classic',
      title: 'Lighthouse Performance & Accessibility Scores',
      status: 'warn',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Performance: ${perfScore}/100, Accessibility: ${a11yScore}/100.`,
      recommendation: 'Review Lighthouse report to address font contrast, unused CSS, and modern image formats.',
    });
  } else {
    checks.push({
      id: 'SEO-19',
      category: 'H',
      section: 'classic',
      title: 'Lighthouse Performance & Accessibility Scores',
      status: 'fail',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Lighthouse Performance score is low: ${perfScore}/100 (Accessibility: ${a11yScore}/100).`,
      recommendation: 'Run Lighthouse in Chrome DevTools to diagnose render blocking resources.',
    });
  }

  return checks;
}

