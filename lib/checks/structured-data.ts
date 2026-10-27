import { CheckResult, StructuredDataReport } from '@/types/audit';
import * as cheerio from 'cheerio';

export interface StructuredDataInput {
  html: string;
  targetUrl: string;
}

export interface StructuredDataEvaluation {
  checks: CheckResult[];
  report: StructuredDataReport;
}

const RECOGNIZED_SCHEMA_TYPES = new Set([
  'Organization',
  'WebSite',
  'WebPage',
  'Article',
  'BlogPosting',
  'NewsArticle',
  'Product',
  'FAQPage',
  'HowTo',
  'Person',
  'BreadcrumbList',
  'LocalBusiness',
  'SoftwareApplication',
  'TechArticle',
]);

export function evaluateStructuredData(input: StructuredDataInput): StructuredDataEvaluation {
  const checks: CheckResult[] = [];
  const $ = cheerio.load(input.html);

  const jsonLdScripts = $('script[type="application/ld+json"]');
  const parsedItems: any[] = [];
  const syntaxErrors: string[] = [];
  const detectedTypes = new Set<string>();
  const sameAsLinks: string[] = [];

  jsonLdScripts.each((idx, el) => {
    const rawContent = $(el).html() || '';
    if (!rawContent.trim()) return;

    try {
      const parsed = JSON.parse(rawContent);
      if (Array.isArray(parsed)) {
        parsed.forEach((item) => parsedItems.push(item));
      } else if (parsed['@graph'] && Array.isArray(parsed['@graph'])) {
        parsed['@graph'].forEach((item: any) => parsedItems.push(item));
      } else {
        parsedItems.push(parsed);
      }
    } catch (err: any) {
      syntaxErrors.push(`Block #${idx + 1}: ${err.message}`);
    }
  });

  // Extract types and sameAs links
  function collectTypesAndLinks(item: any) {
    if (!item || typeof item !== 'object') return;
    if (item['@type']) {
      if (Array.isArray(item['@type'])) {
        item['@type'].forEach((t: string) => detectedTypes.add(t));
      } else if (typeof item['@type'] === 'string') {
        detectedTypes.add(item['@type']);
      }
    }
    if (item.sameAs) {
      if (Array.isArray(item.sameAs)) {
        item.sameAs.forEach((l: string) => sameAsLinks.push(String(l)));
      } else if (typeof item.sameAs === 'string') {
        sameAsLinks.push(item.sameAs);
      }
    }

    // Recursively check sub-entities (e.g. author, publisher)
    for (const key of Object.keys(item)) {
      if (typeof item[key] === 'object') {
        collectTypesAndLinks(item[key]);
      }
    }
  }

  parsedItems.forEach(collectTypesAndLinks);

  const typeList = Array.from(detectedTypes);
  const hasJsonLd = jsonLdScripts.length > 0;
  const isValid = hasJsonLd && syntaxErrors.length === 0 && parsedItems.length > 0;

  // AI-12: JSON-LD present and valid (Sev H)
  if (!hasJsonLd) {
    checks.push({
      id: 'AI-12',
      category: 'C',
      section: 'ai',
      title: 'JSON-LD structured data present and valid',
      status: 'fail',
      severity: 'H',
      effort: 'Moderate',
      evidence: 'No JSON-LD (<script type="application/ld+json">) scripts found.',
      recommendation:
        'AI engines rely heavily on schema.org JSON-LD to ground entities, authors, and topics with high precision. Add JSON-LD markup to your page header.',
      snippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebPage",\n  "name": "Page Title",\n  "description": "Page description"\n}\n</script>`,
      docsLink: 'https://schema.org/',
    });
  } else if (syntaxErrors.length > 0) {
    checks.push({
      id: 'AI-12',
      category: 'C',
      section: 'ai',
      title: 'JSON-LD structured data present and valid',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Found ${syntaxErrors.length} JSON syntax error(s): ${syntaxErrors.join('; ')}.`,
      recommendation:
        'Fix invalid JSON syntax. Broken JSON-LD is discarded entirely by crawlers and AI parsers.',
      snippet: `// Ensure valid comma separation and escaped quotes in JSON-LD strings`,
      docsLink: 'https://validator.schema.org/',
    });
  } else {
    checks.push({
      id: 'AI-12',
      category: 'C',
      section: 'ai',
      title: 'JSON-LD structured data present and valid',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Found ${parsedItems.length} valid JSON-LD entity definition(s).`,
      recommendation: 'JSON-LD is properly formatted and syntactically valid.',
    });
  }

  // AI-13: Appropriate schema types (Sev H)
  const matchingTypes = typeList.filter((t) => RECOGNIZED_SCHEMA_TYPES.has(t));
  if (matchingTypes.length > 0) {
    checks.push({
      id: 'AI-13',
      category: 'C',
      section: 'ai',
      title: 'Appropriate schema types declared',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Declared types: ${matchingTypes.join(', ')}.`,
      recommendation:
        'Rich entity types allow AI search engines to map your content into knowledge graphs.',
    });
  } else if (typeList.length > 0) {
    checks.push({
      id: 'AI-13',
      category: 'C',
      section: 'ai',
      title: 'Appropriate schema types declared',
      status: 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Declared types (${typeList.join(', ')}) are generic or not standard for AI grounding.`,
      recommendation:
        'Use specific types like Article, Organization, Product, FAQPage, or SoftwareApplication.',
      snippet: `"@type": "Organization",\n"name": "Brand Name",\n"url": "${input.targetUrl}"`,
    });
  } else {
    checks.push({
      id: 'AI-13',
      category: 'C',
      section: 'ai',
      title: 'Appropriate schema types declared',
      status: 'fail',
      severity: 'H',
      effort: 'Moderate',
      evidence: 'No standard Schema.org entity types found.',
      recommendation:
        'Include at least Organization/WebSite on homepages, and Article/Product on content pages.',
      snippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "Site Name",\n  "url": "${input.targetUrl}"\n}\n</script>`,
    });
  }

  // AI-14: Required properties complete (Sev M)
  const missingProps: string[] = [];
  const primaryItem = parsedItems[0] || {};
  const recommendedProps = ['name', 'description', 'url'];
  if (typeList.includes('Article') || typeList.includes('BlogPosting')) {
    recommendedProps.push('headline', 'author', 'datePublished', 'dateModified', 'image');
  } else if (typeList.includes('Organization')) {
    recommendedProps.push('name', 'url', 'logo');
  }

  for (const prop of recommendedProps) {
    if (!primaryItem[prop]) {
      missingProps.push(prop);
    }
  }

  if (parsedItems.length === 0) {
    checks.push({
      id: 'AI-14',
      category: 'C',
      section: 'ai',
      title: 'Required schema properties complete',
      status: 'fail',
      severity: 'M',
      effort: 'Moderate',
      evidence: 'No schema items available to evaluate properties.',
      recommendation: 'Add complete entity attributes including name, author, and dates.',
    });
  } else if (missingProps.length === 0) {
    checks.push({
      id: 'AI-14',
      category: 'C',
      section: 'ai',
      title: 'Required schema properties complete',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Primary schema entity possesses all core properties (${recommendedProps.join(', ')}).`,
      recommendation: 'All essential schema attributes are present.',
    });
  } else if (missingProps.length <= 2) {
    checks.push({
      id: 'AI-14',
      category: 'C',
      section: 'ai',
      title: 'Required schema properties complete',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Missing recommended properties: ${missingProps.join(', ')}.`,
      recommendation: `Add the missing properties (${missingProps.join(', ')}) to improve confidence for AI fact extraction.`,
      snippet: `"datePublished": "${new Date().toISOString()}",\n"dateModified": "${new Date().toISOString()}"`,
    });
  } else {
    checks.push({
      id: 'AI-14',
      category: 'C',
      section: 'ai',
      title: 'Required schema properties complete',
      status: 'fail',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Multiple core properties missing: ${missingProps.join(', ')}.`,
      recommendation: 'Complete schema definitions with author, publisher, dates, and canonical URLs.',
    });
  }

  // AI-15: Entity linking (sameAs) (Sev M)
  const hasEntityLinking = sameAsLinks.length > 0;
  if (hasEntityLinking) {
    checks.push({
      id: 'AI-15',
      category: 'C',
      section: 'ai',
      title: 'Entity linking (sameAs knowledge graph connections)',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Found ${sameAsLinks.length} authoritative sameAs link(s): ${sameAsLinks.slice(0, 3).join(', ')}${sameAsLinks.length > 3 ? '...' : ''}.`,
      recommendation:
        'sameAs links directly disambiguate your brand with external knowledge graphs (Wikidata, Wikipedia, LinkedIn, X).',
    });
  } else {
    checks.push({
      id: 'AI-15',
      category: 'C',
      section: 'ai',
      title: 'Entity linking (sameAs knowledge graph connections)',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'No "sameAs" properties found in schema markup.',
      recommendation:
        'Add sameAs links to your Organization or Person schema referencing your verified profiles (e.g. Wikidata, LinkedIn, Twitter/X, Crunchbase).',
      snippet: `"sameAs": [\n  "https://twitter.com/yourbrand",\n  "https://www.linkedin.com/company/yourbrand",\n  "https://www.wikidata.org/wiki/Q12345"\n]`,
    });
  }

  // AI-16: Schema matches visible content (Sev L)
  const pageText = $('body').text().toLowerCase();
  const schemaHeadline = (primaryItem.headline || primaryItem.name || '').toLowerCase();
  const matchesVisible =
    schemaHeadline.length > 3 && pageText.includes(schemaHeadline.slice(0, 30));

  if (!hasJsonLd) {
    checks.push({
      id: 'AI-16',
      category: 'C',
      section: 'ai',
      title: 'Schema matches visible content',
      status: 'info',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'No JSON-LD available to compare with page text.',
      recommendation: 'Ensure schema data reflects the copy visible to human readers.',
    });
  } else if (matchesVisible) {
    checks.push({
      id: 'AI-16',
      category: 'C',
      section: 'ai',
      title: 'Schema matches visible content',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Schema title/headline ("${primaryItem.headline || primaryItem.name}") aligns with visible text on the page.`,
      recommendation: 'Schema data matches visible on-page copy.',
    });
  } else {
    checks.push({
      id: 'AI-16',
      category: 'C',
      section: 'ai',
      title: 'Schema matches visible content',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'Schema name or headline could not be matched directly to visible headings or body copy.',
      recommendation:
        'Avoid discrepancies between JSON-LD structured data and visible page content to prevent hallucination flags by answer engines.',
    });
  }

  const report: StructuredDataReport = {
    present: hasJsonLd,
    valid: isValid,
    types: typeList,
    itemsCount: parsedItems.length,
    syntaxErrors,
    sameAsLinks,
    hasEntityLinking,
    matchesVisibleContent: matchesVisible,
  };

  return { checks, report };
}

