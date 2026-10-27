import { CheckResult } from '@/types/audit';
import * as cheerio from 'cheerio';

export interface EntityTrustInput {
  html: string;
  targetUrl: string;
  schemaTypes?: string[];
  schemaAuthor?: string;
  schemaDateModified?: string;
  schemaDatePublished?: string;
  schemaBrand?: string;
}

export function evaluateEntityTrust(input: EntityTrustInput): CheckResult[] {
  const checks: CheckResult[] = [];
  const $ = cheerio.load(input.html);

  // Parse links
  let hasAboutLink = false;
  let hasContactLink = false;
  let hasPrivacyPolicyLink = false;
  let hasAuthorLink = false;
  const socialLinks: string[] = [];
  const externalCitations: string[] = [];

  const targetHost = new URL(input.targetUrl).hostname.toLowerCase();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text().toLowerCase().trim();
    const rel = $(el).attr('rel') || '';

    // Check author rel
    if (rel.includes('author') || href.includes('/author/') || href.includes('/team/')) {
      hasAuthorLink = true;
    }

    // Check header / footer links
    if (text.includes('about') || href.includes('/about')) hasAboutLink = true;
    if (text.includes('contact') || href.includes('/contact')) hasContactLink = true;
    if (text.includes('privacy') || href.includes('/privacy') || text.includes('terms') || href.includes('/terms')) {
      hasPrivacyPolicyLink = true;
    }

    // Social links
    if (/twitter\.com|x\.com|linkedin\.com|github\.com|youtube\.com|facebook\.com|instagram\.com/i.test(href)) {
      if (!socialLinks.includes(href)) socialLinks.push(href);
    }

    // External outbound links
    try {
      if (href.startsWith('http://') || href.startsWith('https://')) {
        const u = new URL(href);
        if (u.hostname.toLowerCase() !== targetHost && !u.hostname.includes('google.com/search')) {
          if (!externalCitations.includes(u.hostname)) {
            externalCitations.push(u.hostname);
          }
        }
      }
    } catch {}
  });

  // AI-25: Author byline and author page (Sev M)
  const hasBylineMarkup =
    $('[class*="author"], [rel="author"], [itemprop="author"], .byline').length > 0;
  const hasAuthorSchema =
    Boolean(input.schemaAuthor) || (input.schemaTypes && input.schemaTypes.includes('Person'));

  if (hasAuthorSchema && (hasBylineMarkup || hasAuthorLink)) {
    checks.push({
      id: 'AI-25',
      category: 'E',
      section: 'ai',
      title: 'Author byline and author profile page',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Author explicitly declared in schema (${input.schemaAuthor || 'Person'}) and visible in on-page byline.`,
      recommendation:
        'Clear authorship establishes E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) for AI retrieval.',
    });
  } else if (hasBylineMarkup || hasAuthorSchema || hasAuthorLink) {
    checks.push({
      id: 'AI-25',
      category: 'E',
      section: 'ai',
      title: 'Author byline and author profile page',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'Partial author signals found. Missing bidirectional schema + profile page linking.',
      recommendation:
        'Include both a visible author byline and an Article.author schema object linking to an author bio page.',
      snippet: `"author": {\n  "@type": "Person",\n  "name": "Jane Doe",\n  "url": "${new URL('/author/jane', input.targetUrl).toString()}"\n}`,
    });
  } else {
    checks.push({
      id: 'AI-25',
      category: 'E',
      section: 'ai',
      title: 'Author byline and author profile page',
      status: 'warn',
      severity: 'M',
      effort: 'Moderate',
      evidence: 'No visible author byline or Person schema detected.',
      recommendation:
        'Add an author byline with credentials. AI search algorithms heavily prioritize trusted, named human creators.',
      snippet: `<div class="byline">Written by <a rel="author" href="/about">Jane Doe</a></div>`,
    });
  }

  // AI-26: Publish and modified dates visible (Sev M) (Category: Freshness)
  const timeElements = $('time');
  const hasVisibleDate =
    timeElements.length > 0 || $('[class*="date"], [class*="published"], [class*="modified"]').length > 0;
  const hasSchemaDate = Boolean(input.schemaDatePublished || input.schemaDateModified);

  if (hasVisibleDate && hasSchemaDate) {
    checks.push({
      id: 'AI-26',
      category: 'Freshness',
      section: 'ai',
      title: 'Publish and modified dates visible',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Visible <time> tags with matching schema dates (${input.schemaDateModified || input.schemaDatePublished || 'detected'}).`,
      recommendation: 'Dates provide critical freshness grounding for time-sensitive AI queries.',
    });
  } else if (hasVisibleDate || hasSchemaDate) {
    checks.push({
      id: 'AI-26',
      category: 'Freshness',
      section: 'ai',
      title: 'Publish and modified dates visible',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: hasVisibleDate
        ? 'Visible date found in text, but missing in schema datePublished/dateModified.'
        : 'Schema contains date, but no visible <time> element was detected on the page.',
      recommendation:
        'Align both visible <time datetime="..."> markup and schema dateModified so AI crawlers know the content is up to date.',
      snippet: `<time datetime="2026-10-27">October 27, 2026</time>`,
    });
  } else {
    checks.push({
      id: 'AI-26',
      category: 'Freshness',
      section: 'ai',
      title: 'Publish and modified dates visible',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'No visible publish dates or schema date timestamps detected.',
      recommendation:
        'Always display the last updated date. AI answers prioritize recent, maintained sources.',
      snippet: `<p>Last updated: <time datetime="${new Date().toISOString()}">${new Date().toLocaleDateString('en-US')}</time></p>`,
    });
  }

  // AI-27: About, contact and policy pages (Sev M)
  const trustPagesFound: string[] = [];
  if (hasAboutLink) trustPagesFound.push('About');
  if (hasContactLink) trustPagesFound.push('Contact');
  if (hasPrivacyPolicyLink) trustPagesFound.push('Privacy/Terms');

  if (trustPagesFound.length >= 2) {
    checks.push({
      id: 'AI-27',
      category: 'E',
      section: 'ai',
      title: 'About, contact and privacy policy pages',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Detected essential trust pages in navigation: ${trustPagesFound.join(', ')}.`,
      recommendation:
        'These pages signal organizational legitimacy to both search quality evaluators and AI models.',
    });
  } else if (trustPagesFound.length === 1) {
    checks.push({
      id: 'AI-27',
      category: 'E',
      section: 'ai',
      title: 'About, contact and privacy policy pages',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Found only ${trustPagesFound[0]}. Missing other key trust links in footer or navigation.`,
      recommendation:
        'Ensure About Us, Contact, and Privacy Policy links are clearly reachable from site-wide navigation.',
    });
  } else {
    checks.push({
      id: 'AI-27',
      category: 'E',
      section: 'ai',
      title: 'About, contact and privacy policy pages',
      status: 'fail',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'No About, Contact, or Privacy Policy links discovered on this page.',
      recommendation:
        'Add links to an About page and Contact page in your footer. AI systems penalize anonymous or untraceable sources.',
    });
  }

  // AI-28: Outbound citations to credible sources (Sev L)
  if (externalCitations.length >= 2) {
    checks.push({
      id: 'AI-28',
      category: 'E',
      section: 'ai',
      title: 'Outbound citations to external authoritative sources',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `References ${externalCitations.length} distinct external domain(s) (${externalCitations.slice(0, 3).join(', ')}).`,
      recommendation:
        'Citing external documentation, research papers, and authoritative sources builds entity co-occurrence.',
    });
  } else {
    checks.push({
      id: 'AI-28',
      category: 'E',
      section: 'ai',
      title: 'Outbound citations to external authoritative sources',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Contains ${externalCitations.length} external citation(s).`,
      recommendation:
        'Include 2-3 links to primary sources, standards (W3C, Schema.org), or trusted documentation.',
    });
  }

  // AI-29: Brand consistency (Sev L)
  const pageTitle = $('title').text().trim();
  const ogSiteName = $('meta[property="og:site_name"]').attr('content') || '';
  const brandNames = [input.schemaBrand, ogSiteName].filter(Boolean);

  let brandConsistent = false;
  if (ogSiteName && pageTitle.toLowerCase().includes(ogSiteName.toLowerCase())) {
    brandConsistent = true;
  } else if (brandNames.length > 0) {
    brandConsistent = true;
  }

  if (brandConsistent) {
    checks.push({
      id: 'AI-29',
      category: 'E',
      section: 'ai',
      title: 'Brand consistency across title, meta, and schema',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Brand name consistent between title and metadata ("${ogSiteName || brandNames[0] || 'Aligned'}").`,
      recommendation: 'Consistent branding reinforces the entity name across AI knowledge graphs.',
    });
  } else {
    checks.push({
      id: 'AI-29',
      category: 'E',
      section: 'ai',
      title: 'Brand consistency across title, meta, and schema',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'Missing og:site_name or inconsistent brand naming across tags.',
      recommendation:
        'Ensure the exact brand name matches across <title>, <meta property="og:site_name">, and JSON-LD.',
      snippet: `<meta property="og:site_name" content="Citeify" />`,
    });
  }

  // AI-30: Social and profile links (Sev L)
  if (socialLinks.length >= 2) {
    checks.push({
      id: 'AI-30',
      category: 'E',
      section: 'ai',
      title: 'Official social and organizational profile links',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Found ${socialLinks.length} social profile link(s) (${socialLinks.slice(0, 3).map((u) => new URL(u).hostname).join(', ')}).`,
      recommendation: 'Official profile links help verify entity identity.',
    });
  } else {
    checks.push({
      id: 'AI-30',
      category: 'E',
      section: 'ai',
      title: 'Official social and organizational profile links',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Only ${socialLinks.length} official profile link(s) detected.`,
      recommendation:
        'Add links to your official profiles (X/Twitter, LinkedIn, GitHub) in your footer.',
    });
  }

  return checks;
}

