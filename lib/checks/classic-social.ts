import { CheckResult } from '@/types/audit';
import * as cheerio from 'cheerio';

export interface ClassicSocialInput {
  html: string;
  targetUrl: string;
}

export function evaluateClassicSocial(input: ClassicSocialInput): CheckResult[] {
  const checks: CheckResult[] = [];
  const $ = cheerio.load(input.html);

  // SEO-20: Open Graph tags (Sev M)
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim();
  const ogDesc = $('meta[property="og:description"]').attr('content')?.trim();
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim();
  const ogType = $('meta[property="og:type"]').attr('content')?.trim();
  const ogUrl = $('meta[property="og:url"]').attr('content')?.trim();

  const ogTagsPresent = [
    ogTitle && 'og:title',
    ogDesc && 'og:description',
    ogImage && 'og:image',
    ogType && 'og:type',
    ogUrl && 'og:url',
  ].filter(Boolean) as string[];

  if (ogTagsPresent.length === 5) {
    checks.push({
      id: 'SEO-20',
      category: 'I',
      section: 'classic',
      title: 'Open Graph social sharing metadata',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `All standard Open Graph tags present (${ogTagsPresent.join(', ')}).`,
      recommendation: 'Open Graph cards will preview attractively when shared or cited.',
    });
  } else if (ogTagsPresent.length >= 3) {
    const missing = ['og:title', 'og:description', 'og:image', 'og:type', 'og:url'].filter(
      (t) => !ogTagsPresent.includes(t)
    );
    checks.push({
      id: 'SEO-20',
      category: 'I',
      section: 'classic',
      title: 'Open Graph social sharing metadata',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Found ${ogTagsPresent.length}/5 Open Graph tags. Missing: ${missing.join(', ')}.`,
      recommendation: `Add the missing Open Graph properties (${missing.join(', ')}) to control snippet cards.`,
      snippet: `<meta property="og:title" content="Page Title" />\n<meta property="og:image" content="https://example.com/og.png" />`,
    });
  } else {
    checks.push({
      id: 'SEO-20',
      category: 'I',
      section: 'classic',
      title: 'Open Graph social sharing metadata',
      status: 'fail',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Missing essential Open Graph markup (only found ${ogTagsPresent.length}/5 tags).`,
      recommendation:
        'Include og:title, og:description, og:image, og:url, and og:type for social previews and AI link cards.',
      snippet: `<meta property="og:title" content="Title" />\n<meta property="og:description" content="Description" />\n<meta property="og:image" content="https://example.com/image.png" />\n<meta property="og:url" content="${input.targetUrl}" />\n<meta property="og:type" content="website" />`,
    });
  }

  // SEO-21: Twitter card tags (Sev L)
  const twitterCard = $('meta[name="twitter:card"]').attr('content')?.trim();
  const twitterTitle = $('meta[name="twitter:title"]').attr('content')?.trim();
  const twitterImage = $('meta[name="twitter:image"]').attr('content')?.trim();

  if (twitterCard && (twitterTitle || twitterImage || ogTitle)) {
    checks.push({
      id: 'SEO-21',
      category: 'I',
      section: 'classic',
      title: 'Twitter / X card metadata',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Twitter card defined: twitter:card="${twitterCard}"${twitterTitle ? `, title="${twitterTitle}"` : ''}.`,
      recommendation: 'Twitter / X social card metadata is properly configured.',
    });
  } else {
    checks.push({
      id: 'SEO-21',
      category: 'I',
      section: 'classic',
      title: 'Twitter / X card metadata',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: 'Missing twitter:card meta tag.',
      recommendation: 'Add twitter:card meta tag for rich interactive card previews on X/Twitter.',
      snippet: `<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="Page Title" />\n<meta name="twitter:image" content="https://example.com/og.png" />`,
    });
  }

  return checks;
}

