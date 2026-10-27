import { CheckResult } from '@/types/audit';
import * as cheerio from 'cheerio';

export interface ClassicOnPageInput {
  html: string;
  targetUrl: string;
  finalUrl: string;
}

export function evaluateClassicOnPage(input: ClassicOnPageInput): CheckResult[] {
  const checks: CheckResult[] = [];
  const $ = cheerio.load(input.html);

  // SEO-01: Title tag present and 30 to 60 characters (Sev H)
  const title = $('title').text().trim();
  const titleLength = title.length;

  if (titleLength >= 30 && titleLength <= 60) {
    checks.push({
      id: 'SEO-01',
      category: 'F',
      section: 'classic',
      title: 'Title tag length and relevance',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Title is ${titleLength} characters: "${title}". Optimal length (30-60 chars).`,
      recommendation: 'Title tag is concise, descriptive, and within search snippet limits.',
    });
  } else if (titleLength === 0) {
    checks.push({
      id: 'SEO-01',
      category: 'F',
      section: 'classic',
      title: 'Title tag length and relevance',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: 'Missing <title> tag in HTML head.',
      recommendation: 'Add a distinct, keyword-targeted title tag between 30 and 60 characters.',
      snippet: `<title>Product Name - Comprehensive AI SEO Audit Tool</title>`,
    });
  } else if (titleLength < 30) {
    checks.push({
      id: 'SEO-01',
      category: 'F',
      section: 'classic',
      title: 'Title tag length and relevance',
      status: 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Title is too short (${titleLength} characters): "${title}".`,
      recommendation:
        'Expand title to between 30 and 60 characters by including secondary topic or brand name.',
    });
  } else {
    checks.push({
      id: 'SEO-01',
      category: 'F',
      section: 'classic',
      title: 'Title tag length and relevance',
      status: 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Title is too long (${titleLength} characters): "${title}". May truncate in search results.`,
      recommendation: 'Shorten title to under 60 characters to avoid snippet truncation.',
    });
  }

  // SEO-02: Meta description present and 70 to 160 characters (Sev M)
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';
  const descLength = metaDescription.length;

  if (descLength >= 70 && descLength <= 160) {
    checks.push({
      id: 'SEO-02',
      category: 'F',
      section: 'classic',
      title: 'Meta description presence and length',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Meta description is ${descLength} characters: "${metaDescription.slice(0, 75)}...".`,
      recommendation: 'Meta description length is ideal (70-160 chars) for search snippets.',
    });
  } else if (descLength === 0) {
    checks.push({
      id: 'SEO-02',
      category: 'F',
      section: 'classic',
      title: 'Meta description presence and length',
      status: 'fail',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'No <meta name="description"> tag found.',
      recommendation:
        'Add a compelling meta description (70-160 characters) summarizing the page value proposition.',
      snippet: `<meta name="description" content="Citeify conducts comprehensive AI readiness audits, evaluating robots.txt, schema markup, and structured answers for ChatGPT and Google." />`,
    });
  } else {
    checks.push({
      id: 'SEO-02',
      category: 'F',
      section: 'classic',
      title: 'Meta description presence and length',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Meta description length (${descLength} characters) is outside optimal range (70-160 chars).`,
      recommendation: 'Calibrate description length to between 70 and 160 characters.',
    });
  }

  // SEO-03: Canonical tag present and self-consistent (Sev H)
  const canonicalHref = $('link[rel="canonical"]').attr('href')?.trim();

  if (canonicalHref) {
    let isConsistent = false;
    try {
      const canonicalUrl = new URL(canonicalHref, input.finalUrl).toString();
      const currentUrl = new URL(input.finalUrl).toString();
      isConsistent = canonicalUrl === currentUrl;
    } catch {}

    checks.push({
      id: 'SEO-03',
      category: 'F',
      section: 'classic',
      title: 'Canonical tag configuration',
      status: isConsistent ? 'pass' : 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Canonical URL declared: "${canonicalHref}". ${isConsistent ? 'Matches current page URL.' : 'Points to a different URL (cross-domain or syndicated).'}.`,
      recommendation: isConsistent
        ? 'Canonical tag is properly set and self-referential.'
        : 'Ensure canonical URL is intentional to prevent indexing errors or URL splitting.',
    });
  } else {
    checks.push({
      id: 'SEO-03',
      category: 'F',
      section: 'classic',
      title: 'Canonical tag configuration',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: 'Missing <link rel="canonical"> tag.',
      recommendation:
        'Specify a self-referential canonical tag to prevent duplicate content issues across URL parameters or protocols.',
      snippet: `<link rel="canonical" href="${input.finalUrl}" />`,
    });
  }

  // SEO-04: Single H1 containing primary topic (Sev M)
  const h1Elements = $('h1');
  if (h1Elements.length === 1) {
    checks.push({
      id: 'SEO-04',
      category: 'F',
      section: 'classic',
      title: 'Single primary H1 topic heading',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Single H1: "${h1Elements.first().text().trim().slice(0, 60)}".`,
      recommendation: 'Correct usage of a single primary H1 heading.',
    });
  } else {
    checks.push({
      id: 'SEO-04',
      category: 'F',
      section: 'classic',
      title: 'Single primary H1 topic heading',
      status: h1Elements.length === 0 ? 'fail' : 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Found ${h1Elements.length} H1 tags. Best practice is exactly 1 H1 per page.`,
      recommendation: 'Use exactly one H1 containing your core keyword topic.',
    });
  }

  // SEO-05: Image alt text coverage (Sev M) (Category: LinksImages)
  const images = $('img');
  const imageCount = images.length;
  let withAlt = 0;

  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (typeof alt === 'string' && alt.trim().length > 0) {
      withAlt++;
    }
  });

  const altCoverageRatio = imageCount > 0 ? withAlt / imageCount : 1.0;
  const altPercent = Math.round(altCoverageRatio * 100);

  if (imageCount === 0 || altCoverageRatio >= 0.9) {
    checks.push({
      id: 'SEO-05',
      category: 'LinksImages',
      section: 'classic',
      title: 'Image alt text coverage',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `${altPercent}% alt text coverage (${withAlt} of ${imageCount} image(s) have alt attributes).`,
      recommendation: 'Image alt text coverage is excellent for accessibility and image search.',
    });
  } else if (altCoverageRatio >= 0.5) {
    checks.push({
      id: 'SEO-05',
      category: 'LinksImages',
      section: 'classic',
      title: 'Image alt text coverage',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Moderate alt text coverage (${altPercent}%: ${withAlt}/${imageCount} images).`,
      recommendation:
        'Add descriptive alt text to remaining images for accessibility and multimodal AI indexers.',
      snippet: `<img src="/diagram.png" alt="Architectural diagram of AI search indexing workflow" />`,
    });
  } else {
    checks.push({
      id: 'SEO-05',
      category: 'LinksImages',
      section: 'classic',
      title: 'Image alt text coverage',
      status: 'fail',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Poor alt text coverage (${altPercent}%: only ${withAlt} of ${imageCount} images have alt tags).`,
      recommendation:
        'Populate alt attributes on all informative images. Multimodal bots (Google Lens, GPT-4o) parse alt text directly.',
    });
  }

  // SEO-06: Internal link count and anchor text quality (Sev M) (Category: LinksImages)
  const links = $('a[href]');
  let genericAnchorCount = 0;
  let internalLinkCount = 0;
  const currentHost = new URL(input.finalUrl).hostname.toLowerCase();
  const genericTerms = /^(click here|read more|learn more|here|more|link|view|this)$/i;

  links.each((_, el) => {
    const href = $(el).attr('href') || '';
    const anchorText = $(el).text().trim().toLowerCase();

    if (genericTerms.test(anchorText)) {
      genericAnchorCount++;
    }

    try {
      if (href.startsWith('/') || href.startsWith('#') || href.includes(currentHost)) {
        internalLinkCount++;
      }
    } catch {}
  });

  if (genericAnchorCount === 0 && internalLinkCount >= 5) {
    checks.push({
      id: 'SEO-06',
      category: 'LinksImages',
      section: 'classic',
      title: 'Internal link count and anchor text quality',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Found ${internalLinkCount} internal links with descriptive anchor text (0 generic labels like "click here").`,
      recommendation: 'Anchor text clearly signals target context to search algorithms.',
    });
  } else if (genericAnchorCount > 0) {
    checks.push({
      id: 'SEO-06',
      category: 'LinksImages',
      section: 'classic',
      title: 'Internal link count and anchor text quality',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Detected ${genericAnchorCount} generic anchor texts (e.g. "click here", "read more").`,
      recommendation:
        'Replace generic anchor phrases with descriptive text specifying the destination subject matter.',
      snippet: `<!-- Instead of: <a href="/docs">Click here</a> -->\n<a href="/docs">Read our full AI crawler documentation</a>`,
    });
  } else {
    checks.push({
      id: 'SEO-06',
      category: 'LinksImages',
      section: 'classic',
      title: 'Internal link count and anchor text quality',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Low internal link count (${internalLinkCount} links).`,
      recommendation: 'Link to related internal pages to distribute link authority and aid crawling.',
    });
  }

  // SEO-07: URL structure (Sev L)
  const parsedUrl = new URL(input.finalUrl);
  const pathLength = parsedUrl.pathname.length;
  const queryParamCount = Array.from(parsedUrl.searchParams.keys()).length;
  const hasUpperCase = /[A-Z]/.test(parsedUrl.pathname);

  if (pathLength < 90 && queryParamCount === 0 && !hasUpperCase) {
    checks.push({
      id: 'SEO-07',
      category: 'F',
      section: 'classic',
      title: 'URL structure and cleanliness',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Clean, lowercase, parameter-free URL path (${parsedUrl.pathname}).`,
      recommendation: 'URL path is clean and search-friendly.',
    });
  } else {
    checks.push({
      id: 'SEO-07',
      category: 'F',
      section: 'classic',
      title: 'URL structure and cleanliness',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: `URL contains ${queryParamCount} query parameters${hasUpperCase ? ', uppercase characters' : ''}, path length: ${pathLength} chars.`,
      recommendation:
        'Keep URLs clean, lowercase, hyphen-separated, and free of unnecessary query parameters.',
    });
  }

  // SEO-08: Language attribute and hreflang validity (Sev L)
  const langAttr = $('html').attr('lang');
  const hreflangTags = $('link[rel="alternate"][hreflang]');

  if (langAttr && langAttr.trim().length >= 2) {
    checks.push({
      id: 'SEO-08',
      category: 'F',
      section: 'classic',
      title: 'HTML language attribute and hreflang',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Language defined as lang="${langAttr}"${hreflangTags.length > 0 ? ` with ${hreflangTags.length} hreflang alternatives` : ''}.`,
      recommendation: 'Language declaration allows accurate linguistic tokenization and translation.',
    });
  } else {
    checks.push({
      id: 'SEO-08',
      category: 'F',
      section: 'classic',
      title: 'HTML language attribute and hreflang',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'Missing lang attribute on <html> element.',
      recommendation:
        'Add a lang attribute to your <html> tag (e.g. lang="en") to declare the document language.',
      snippet: `<html lang="en">`,
    });
  }

  return checks;
}

