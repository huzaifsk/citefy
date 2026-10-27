import { CheckResult, CrawlerMatrixItem } from '@/types/audit';
import robotsParser from 'robots-parser';
import { AI_BOTS } from '@/config/bots';
import { safeFetch } from '@/lib/fetcher/safe-fetch';

export interface CrawlerCheckInput {
  targetUrl: string;
  robotsTxtBody?: string;
  robotsHttpFound: boolean;
  robotsUrl: string;
  sitemapFound: boolean;
  sitemapUrl?: string;
  sitemapLastmodCount: number;
  llmsTxtFound: boolean;
  llmsTxtValid: boolean;
  llmsTxtUrl?: string;
  headers?: Record<string, string>;
  metaRobotsContent?: string;
  xRobotsTag?: string;
}

export interface CrawlerAccessEvaluation {
  checks: CheckResult[];
  matrix: CrawlerMatrixItem[];
}

export async function evaluateCrawlerAccess(
  input: CrawlerCheckInput
): Promise<CrawlerAccessEvaluation> {
  const checks: CheckResult[] = [];
  const matrix: CrawlerMatrixItem[] = [];

  const robots = input.robotsTxtBody
    ? robotsParser(input.robotsUrl, input.robotsTxtBody)
    : null;

  // AI-01: robots.txt exists and is reachable (Sev M)
  if (input.robotsHttpFound && input.robotsTxtBody) {
    checks.push({
      id: 'AI-01',
      category: 'A',
      section: 'ai',
      title: 'robots.txt exists and is reachable',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `robots.txt discovered at ${input.robotsUrl} (${input.robotsTxtBody.length} bytes).`,
      recommendation: 'Your robots.txt is live and accessible to AI search crawlers.',
      snippet: `# Example robots.txt for AI Search Engines\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /`,
      docsLink: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro',
    });
  } else {
    checks.push({
      id: 'AI-01',
      category: 'A',
      section: 'ai',
      title: 'robots.txt exists and is reachable',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `No valid robots.txt found at ${input.robotsUrl}.`,
      recommendation:
        'Add a robots.txt file to your site root to explicitly guide AI bots and declare your sitemap.',
      snippet: `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', input.targetUrl).toString()}`,
      docsLink: 'https://developers.google.com/search/docs/crawling-indexing/robots/intro',
    });
  }

  // Evaluate bots in robots.txt and probe live fetch
  const searchBotsBlocked: string[] = [];
  const searchBotsAllowed: string[] = [];
  const trainingBotsBlocked: string[] = [];
  const trainingBotsAllowed: string[] = [];

  for (const bot of AI_BOTS) {
    let robotsStatus: 'allowed' | 'disallowed' | 'unspecified' = 'unspecified';

    if (robots) {
      const allowed = robots.isAllowed(input.targetUrl, bot.robotsUserAgent);
      if (allowed === false) {
        robotsStatus = 'disallowed';
      } else if (allowed === true) {
        robotsStatus = 'allowed';
      }
    }

    if (bot.botType === 'search') {
      if (robotsStatus === 'disallowed') {
        searchBotsBlocked.push(bot.name);
      } else {
        searchBotsAllowed.push(bot.name);
      }
    } else {
      if (robotsStatus === 'disallowed') {
        trainingBotsBlocked.push(bot.name);
      } else {
        trainingBotsAllowed.push(bot.name);
      }
    }

    matrix.push({
      id: bot.id,
      name: bot.name,
      owner: bot.owner,
      userAgentHeader: bot.probeUserAgent,
      botType: bot.botType,
      robotsStatus,
      liveFetchStatus: 200, // Will be updated during live probe step below
      isBlocked: robotsStatus === 'disallowed',
      notes: bot.description,
    });
  }

  // AI-02: Search and answer crawlers allowed (Sev H)
  if (searchBotsBlocked.length === 0) {
    checks.push({
      id: 'AI-02',
      category: 'A',
      section: 'ai',
      title: 'Search and answer crawlers allowed in robots.txt',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: `All key AI answer bots (${searchBotsAllowed.join(', ')}) are allowed to crawl.`,
      recommendation:
        'Keep AI answer engines like OAI-SearchBot and PerplexityBot unblocked to maximize real-time citations.',
    });
  } else if (searchBotsBlocked.length >= 4) {
    checks.push({
      id: 'AI-02',
      category: 'A',
      section: 'ai',
      title: 'Search and answer crawlers allowed in robots.txt',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Major search bots blocked: ${searchBotsBlocked.join(', ')}.`,
      recommendation:
        'Unblock search and citation crawlers in robots.txt so ChatGPT Search, Perplexity, and Copilot can retrieve your content.',
      snippet: `# Allow AI Search Engines\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Claude-SearchBot\nAllow: /`,
    });
  } else {
    checks.push({
      id: 'AI-02',
      category: 'A',
      section: 'ai',
      title: 'Search and answer crawlers allowed in robots.txt',
      status: 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Some search bots blocked: ${searchBotsBlocked.join(', ')}.`,
      recommendation:
        'Review blocked crawlers. Blocking search bots stops those AI engines from referencing your page.',
      snippet: `User-agent: ${searchBotsBlocked[0]}\nAllow: /`,
    });
  }

  // AI-03: Training crawler policy (informational) (Sev L)
  const trainingPolicySummary =
    trainingBotsBlocked.length > 0
      ? `${trainingBotsBlocked.length} training crawlers disallowed (${trainingBotsBlocked.join(', ')})`
      : 'All training bots allowed (default policy)';

  checks.push({
    id: 'AI-03',
    category: 'A',
    section: 'ai',
    title: 'Training crawler policy (informational)',
    status: 'info',
    severity: 'L',
    effort: 'Quick win',
    evidence: `${trainingPolicySummary}.`,
    recommendation:
      'Blocking training crawlers (e.g., GPTBot, CCBot) is a commercial choice to protect IP and does not impact real-time search citations if search bots remain allowed.',
    snippet: `# To disallow training crawlers only:\nUser-agent: GPTBot\nDisallow: /\n\nUser-agent: CCBot\nDisallow: /`,
  });

  // AI-04: Not blocked at CDN or firewall (Sev H)
  // Run fast parallel probes for 3 representative AI bot headers
  const probeBots = AI_BOTS.filter((b) =>
    ['oai-search', 'perplexity-bot', 'googlebot'].includes(b.id)
  );
  let cdnBlockCount = 0;
  const probeEvidence: string[] = [];

  for (const bot of probeBots) {
    try {
      const probeRes = await safeFetch(input.targetUrl, {
        userAgent: bot.probeUserAgent,
        timeoutMs: 4000,
        method: 'HEAD',
      });

      const matrixEntry = matrix.find((m) => m.id === bot.id);
      if (matrixEntry) {
        matrixEntry.liveFetchStatus = probeRes.status || 'ERR';
        matrixEntry.liveFetchSize = probeRes.contentLength;
      }

      if ([403, 429, 503].includes(probeRes.status)) {
        cdnBlockCount++;
        probeEvidence.push(`${bot.name} returned HTTP ${probeRes.status}`);
        if (matrixEntry) matrixEntry.isBlocked = true;
      }
    } catch {
      // Non-blocking probe failure
    }
  }

  if (cdnBlockCount > 0) {
    checks.push({
      id: 'AI-04',
      category: 'A',
      section: 'ai',
      title: 'Not blocked at CDN or firewall',
      status: 'fail',
      severity: 'H',
      effort: 'Moderate',
      evidence: `CDN or WAF returned blocking status codes: ${probeEvidence.join(', ')}.`,
      recommendation:
        'Check Cloudflare, AWS WAF, or hosting security rules. AI user agents are triggering automated firewall bot challenges (403/Cloudflare Turnstile).',
      snippet: `// In Cloudflare Security > WAF > Custom Rules:\nAllow known AI bots (User-Agent: *OAI-SearchBot* OR *PerplexityBot*)`,
    });
  } else {
    checks.push({
      id: 'AI-04',
      category: 'A',
      section: 'ai',
      title: 'Not blocked at CDN or firewall',
      status: 'pass',
      severity: 'H',
      effort: 'Moderate',
      evidence: 'Simulated AI crawler user agents were accepted without CDN or firewall challenges.',
      recommendation: 'Your server and CDN correctly respond to AI user agent probes.',
    });
  }

  // AI-05: Page-level directives (Sev H)
  const metaRobots = (input.metaRobotsContent || '').toLowerCase();
  const xRobots = (input.xRobotsTag || '').toLowerCase();
  const allDirectives = `${metaRobots} ${xRobots}`.trim();

  const hasNoindex = allDirectives.includes('noindex');
  const hasNosnippet = allDirectives.includes('nosnippet');
  const hasNoarchive = allDirectives.includes('noarchive');
  const hasMaxSnippetZero = /max-snippet\s*:\s*0/.test(allDirectives);

  if (hasNoindex) {
    checks.push({
      id: 'AI-05',
      category: 'A',
      section: 'ai',
      title: 'Page-level directives (meta robots & X-Robots-Tag)',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Found "noindex" in directives: "${allDirectives}".`,
      recommendation:
        'Remove "noindex" from meta robots or X-Robots-Tag. Noindex prevents all search and AI engines from indexing or citing this page.',
      snippet: `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />`,
    });
  } else if (hasNosnippet || hasMaxSnippetZero) {
    checks.push({
      id: 'AI-05',
      category: 'A',
      section: 'ai',
      title: 'Page-level directives (meta robots & X-Robots-Tag)',
      status: 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Found snippet restriction ("nosnippet" or "max-snippet:0") in directives: "${allDirectives}".`,
      recommendation:
        'Allow text snippets so AI search engines can read and summarize excerpt quotes from your content.',
      snippet: `<meta name="robots" content="index, follow, max-snippet:-1" />`,
    });
  } else {
    checks.push({
      id: 'AI-05',
      category: 'A',
      section: 'ai',
      title: 'Page-level directives (meta robots & X-Robots-Tag)',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: allDirectives ? `Directives: "${allDirectives}"` : 'No restrictive meta robots tags found (defaults to index, follow).',
      recommendation: 'Page allows indexing and snippet generation.',
    });
  }

  // AI-06: llms.txt present (informational) (Sev L)
  if (input.llmsTxtFound && input.llmsTxtValid) {
    checks.push({
      id: 'AI-06',
      category: 'A',
      section: 'ai',
      title: 'llms.txt present (informational)',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Valid llms.txt found at ${input.llmsTxtUrl || '/llms.txt'}.`,
      recommendation:
        'Great proactive setup! Although llms.txt is an evolving standard with low weight, it helps developer agents and AI systems discover your core docs.',
      docsLink: 'https://llmstxt.org/',
    });
  } else if (input.llmsTxtFound && !input.llmsTxtValid) {
    checks.push({
      id: 'AI-06',
      category: 'A',
      section: 'ai',
      title: 'llms.txt present (informational)',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: `File exists at /llms.txt but structure does not meet standard markdown guidelines.`,
      recommendation: 'Format your llms.txt with an H1 title, summary paragraph, and markdown link lists.',
      snippet: `# Site Title\n\n> Short summary of what this site does.\n\n## Core Docs\n- [About](https://example.com/about): Summary`,
      docsLink: 'https://llmstxt.org/',
    });
  } else {
    checks.push({
      id: 'AI-06',
      category: 'A',
      section: 'ai',
      title: 'llms.txt present (informational)',
      status: 'info',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'No /llms.txt file detected on this domain.',
      recommendation:
        'Consider creating an /llms.txt file. This is an informational best practice proposed by the AI community for curating machine-friendly content.',
      snippet: `# My Site\n> A brief overview for LLMs.\n\n## Guides\n- [Documentation](/docs): Core reference`,
      docsLink: 'https://llmstxt.org/',
    });
  }

  // AI-07: Sitemap present and referenced (Sev M) - Freshness Category
  if (input.sitemapFound) {
    const lastmodEvidence =
      input.sitemapLastmodCount > 0
        ? `Contains ${input.sitemapLastmodCount} entries with lastmod dates.`
        : 'Sitemap found, but lastmod dates are missing.';

    checks.push({
      id: 'AI-07',
      category: 'Freshness',
      section: 'ai',
      title: 'Sitemap present and referenced',
      status: input.sitemapLastmodCount > 0 ? 'pass' : 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Sitemap located at ${input.sitemapUrl || '/sitemap.xml'}. ${lastmodEvidence}`,
      recommendation:
        input.sitemapLastmodCount > 0
          ? 'Sitemap is properly configured with freshness signals.'
          : 'Add <lastmod> timestamps to sitemap URLs to signal content freshness to AI engines.',
      snippet: `<url>\n  <loc>${input.targetUrl}</loc>\n  <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n</url>`,
      docsLink: 'https://www.sitemaps.org/protocol.html',
    });
  } else {
    checks.push({
      id: 'AI-07',
      category: 'Freshness',
      section: 'ai',
      title: 'Sitemap present and referenced',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'No sitemap declaration found in robots.txt or at default /sitemap.xml.',
      recommendation: 'Declare an XML sitemap in robots.txt to assist discovery and freshness tracking.',
      snippet: `Sitemap: ${new URL('/sitemap.xml', input.targetUrl).toString()}`,
    });
  }

  return { checks, matrix };
}

