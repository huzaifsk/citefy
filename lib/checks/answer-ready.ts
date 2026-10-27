import { CheckResult } from '@/types/audit';
import * as cheerio from 'cheerio';

export interface AnswerReadyInput {
  html: string;
  hasFaqSchema?: boolean;
}

export function evaluateAnswerReady(input: AnswerReadyInput): CheckResult[] {
  const checks: CheckResult[] = [];
  const $ = cheerio.load(input.html);

  // Clean elements that don't represent article content
  $('script, style, noscript, nav, footer, header, svg').remove();

  // Headings analysis
  const h1Elements = $('h1');
  const h1Count = h1Elements.length;
  const h2Elements = $('h2');
  const h3Elements = $('h3');

  const allHeadings: { tag: string; level: number; text: string }[] = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const tagName = el.tagName.toLowerCase();
    const level = parseInt(tagName.replace('h', ''), 10);
    allHeadings.push({ tag: tagName, level, text: $(el).text().trim() });
  });

  // Check skipped levels
  let hasSkippedLevels = false;
  for (let i = 0; i < allHeadings.length - 1; i++) {
    if (allHeadings[i + 1].level - allHeadings[i].level > 1) {
      hasSkippedLevels = true;
      break;
    }
  }

  // AI-17: One clear H1 and logical heading hierarchy (Sev H)
  if (h1Count === 1 && !hasSkippedLevels) {
    checks.push({
      id: 'AI-17',
      category: 'D',
      section: 'ai',
      title: 'One clear H1 and logical heading hierarchy',
      status: 'pass',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Single H1 ("${h1Elements.first().text().trim().slice(0, 50)}") with strict hierarchical order across ${allHeadings.length} headings.`,
      recommendation: 'Heading hierarchy is logical and easy for AI crawlers to outline.',
    });
  } else if (h1Count === 0) {
    checks.push({
      id: 'AI-17',
      category: 'D',
      section: 'ai',
      title: 'One clear H1 and logical heading hierarchy',
      status: 'fail',
      severity: 'H',
      effort: 'Quick win',
      evidence: 'Missing H1 heading on the page.',
      recommendation:
        'Add a single, descriptive <h1> representing the core topic of the page.',
      snippet: `<h1>Comprehensive Guide to AI Search Readiness</h1>`,
    });
  } else if (h1Count > 1) {
    checks.push({
      id: 'AI-17',
      category: 'D',
      section: 'ai',
      title: 'One clear H1 and logical heading hierarchy',
      status: 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: `Detected ${h1Count} separate <h1> headings. Multiple H1s dilute topic clarity.`,
      recommendation:
        'Use exactly one <h1> for the main page title, and downgrade secondary titles to <h2> or <h3>.',
    });
  } else {
    checks.push({
      id: 'AI-17',
      category: 'D',
      section: 'ai',
      title: 'One clear H1 and logical heading hierarchy',
      status: 'warn',
      severity: 'H',
      effort: 'Quick win',
      evidence: 'Headings skip hierarchy levels (e.g., jumping from H1 directly to H3).',
      recommendation: 'Maintain continuous heading levels (H1 -> H2 -> H3) without skipping.',
    });
  }

  // AI-18: Question-style headings (Sev M)
  const questionWords = /^(what|how|why|can|is|are|when|where|who|should|do|does|will)\b|\?$/i;
  const subHeadings = [...h2Elements.toArray(), ...h3Elements.toArray()].map((el) =>
    $(el).text().trim()
  );

  const questionHeadings = subHeadings.filter((text) => questionWords.test(text));
  const questionRatio = subHeadings.length > 0 ? questionHeadings.length / subHeadings.length : 0;

  if (questionHeadings.length >= 2 || questionRatio >= 0.25) {
    checks.push({
      id: 'AI-18',
      category: 'D',
      section: 'ai',
      title: 'Question-style headings matching conversational search',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Found ${questionHeadings.length} question-phrased heading(s) (e.g. "${questionHeadings[0]}").`,
      recommendation:
        'Question-based headings directly mirror user prompts in ChatGPT and Perplexity, boosting citation likelihood.',
    });
  } else if (subHeadings.length > 0) {
    checks.push({
      id: 'AI-18',
      category: 'D',
      section: 'ai',
      title: 'Question-style headings matching conversational search',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Few or no question-based headings found among ${subHeadings.length} subheadings.`,
      recommendation:
        'Phrase some H2s as natural questions that users ask (e.g., "How does X work?", "Why is Y important?").',
      snippet: `<h2>How does AI Search decide what to cite?</h2>`,
    });
  } else {
    checks.push({
      id: 'AI-18',
      category: 'D',
      section: 'ai',
      title: 'Question-style headings matching conversational search',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'No subheadings (H2/H3) detected on the page.',
      recommendation: 'Structure content into subheaded sections phrased as natural queries.',
    });
  }

  // AI-19: Direct answers up front (Sev M)
  // Check the first paragraph immediately following H2 headings
  let conciseAnswersCount = 0;
  let totalH2Tested = 0;

  $('h2').each((_, el) => {
    totalH2Tested++;
    let nextEl = $(el).next();
    // skip non-p elements if small
    if (!nextEl.is('p') && nextEl.next().is('p')) {
      nextEl = nextEl.next();
    }
    if (nextEl.is('p')) {
      const pText = nextEl.text().trim();
      const pWords = pText.split(/\s+/).filter(Boolean).length;
      if (pWords >= 30 && pWords <= 75) {
        conciseAnswersCount++;
      }
    }
  });

  if (conciseAnswersCount >= 2 || (totalH2Tested > 0 && conciseAnswersCount / totalH2Tested >= 0.3)) {
    checks.push({
      id: 'AI-19',
      category: 'D',
      section: 'ai',
      title: 'Direct answers up front (inverted pyramid)',
      status: 'pass',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Detected concise, self-contained answer paragraphs (30-75 words) positioned directly underneath headings.`,
      recommendation:
        'Answer engines prefer self-contained 40-60 word answer capsules they can extract as direct snippet answers.',
    });
  } else {
    checks.push({
      id: 'AI-19',
      category: 'D',
      section: 'ai',
      title: 'Direct answers up front (inverted pyramid)',
      status: 'warn',
      severity: 'M',
      effort: 'Moderate',
      evidence: 'Paragraphs under headings are either missing, very long, or rely on preamble.',
      recommendation:
        'Lead each section with a direct 40 to 60-word definition or summary before elaborating with background.',
      snippet: `<h2>What is an AI SEO Audit?</h2>\n<p>An AI SEO audit evaluates how search bots and LLMs crawl, render, understand, and cite a webpage in generated answers, measuring machine readability and factual authority.</p>`,
    });
  }

  // AI-20: Lists, tables and steps (Sev M)
  const ulCount = $('ul').length;
  const olCount = $('ol').length;
  const tableCount = $('table').length;
  const totalScannable = ulCount + olCount + tableCount;

  if (totalScannable >= 3) {
    checks.push({
      id: 'AI-20',
      category: 'D',
      section: 'ai',
      title: 'Lists, tables and structured data steps',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Found ${ulCount} bullet list(s), ${olCount} numbered list(s), and ${tableCount} data table(s).`,
      recommendation:
        'Tables and lists provide structured tabular data that AI answer engines love to synthesize into formatted answers.',
    });
  } else if (totalScannable >= 1) {
    checks.push({
      id: 'AI-20',
      category: 'D',
      section: 'ai',
      title: 'Lists, tables and structured data steps',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: `Found ${totalScannable} scannable list or table element(s).`,
      recommendation: 'Good start. Consider adding comparative tables for key benchmarks or features.',
    });
  } else {
    checks.push({
      id: 'AI-20',
      category: 'D',
      section: 'ai',
      title: 'Lists, tables and structured data steps',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'No <ul>, <ol>, or <table> elements found in primary content.',
      recommendation:
        'Convert dense prose blocks into bullet points, numbered steps, or comparison tables to boost extraction speed.',
    });
  }

  // AI-21: FAQ section (Sev M)
  const hasFaqMarkup = $('[class*="faq"], [id*="faq"], details, summary').length > 0;
  const textContent = $('body').text();
  const hasFaqKeywords = /frequently asked questions|\bfaqs?\b/i.test(textContent);

  if (input.hasFaqSchema || (hasFaqMarkup && hasFaqKeywords)) {
    checks.push({
      id: 'AI-21',
      category: 'D',
      section: 'ai',
      title: 'FAQ section present',
      status: 'pass',
      severity: 'M',
      effort: 'Quick win',
      evidence: input.hasFaqSchema
        ? 'FAQ section with valid FAQPage schema detected.'
        : 'Dedicated FAQ section pattern found in page content.',
      recommendation:
        'FAQ sections are one of the highest-yielding surfaces for question-answer retrieval systems.',
    });
  } else {
    checks.push({
      id: 'AI-21',
      category: 'D',
      section: 'ai',
      title: 'FAQ section present',
      status: 'warn',
      severity: 'M',
      effort: 'Quick win',
      evidence: 'No dedicated FAQ pattern or FAQPage schema found.',
      recommendation:
        'Add a concise 3-5 item FAQ section addressing common search inquiries, paired with FAQPage schema.',
      snippet: `<section id="faq">\n  <h2>Frequently Asked Questions</h2>\n  <details>\n    <summary>Question here?</summary>\n    <p>Direct answer here.</p>\n  </details>\n</section>`,
    });
  }

  // AI-22: Sufficient content depth (Sev M)
  const allWords = textContent.replace(/\s+/g, ' ').trim().split(/\s+/).filter(Boolean);
  const wordCount = allWords.length;

  if (wordCount >= 600) {
    checks.push({
      id: 'AI-22',
      category: 'D',
      section: 'ai',
      title: 'Sufficient content depth',
      status: 'pass',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Extracted ${wordCount} words of comprehensive content.`,
      recommendation: 'Page provides deep topical context required for authoritative citations.',
    });
  } else if (wordCount >= 250) {
    checks.push({
      id: 'AI-22',
      category: 'D',
      section: 'ai',
      title: 'Sufficient content depth',
      status: 'warn',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Moderate content length (${wordCount} words).`,
      recommendation:
        'Expand definitions, examples, and nuances to cover related sub-questions that searchers ask.',
    });
  } else {
    checks.push({
      id: 'AI-22',
      category: 'D',
      section: 'ai',
      title: 'Sufficient content depth',
      status: 'fail',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Thin content detected (${wordCount} words).`,
      recommendation:
        'Thin pages rarely get cited in AI answers because LLMs prefer in-depth, definitive sources.',
    });
  }

  // AI-23: Readability (Flesch score & average sentence length) (Sev L)
  const sentences = textContent
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5);

  const sentenceCount = Math.max(1, sentences.length);
  const avgSentenceLength = wordCount / sentenceCount;

  // Approximate syllable count heuristic
  let syllableCount = 0;
  for (const word of allWords.slice(0, 500)) {
    const clean = word.toLowerCase().replace(/[^a-z]/g, '');
    if (clean.length <= 3) {
      syllableCount += 1;
    } else {
      const matches = clean.match(/[aeiouy]{1,2}/g);
      syllableCount += Math.max(1, matches ? matches.length : 1);
    }
  }
  const sampleWords = Math.min(wordCount, 500) || 1;
  const avgSyllablesPerWord = syllableCount / sampleWords;

  // Flesch Reading Ease Formula: 206.835 - (1.015 * ASL) - (84.6 * ASW)
  const fleschScore = Math.max(
    0,
    Math.min(100, Math.round(206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord))
  );

  if (fleschScore >= 50 && fleschScore <= 80 && avgSentenceLength <= 22) {
    checks.push({
      id: 'AI-23',
      category: 'D',
      section: 'ai',
      title: 'Readability and sentence structure',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Flesch Reading Ease score: ${fleschScore}/100 (Avg sentence length: ${avgSentenceLength.toFixed(1)} words). Plain, clear writing.`,
      recommendation: 'Clear, direct writing style allows AI models to parse logic without ambiguity.',
    });
  } else if (avgSentenceLength > 25 || fleschScore < 40) {
    checks.push({
      id: 'AI-23',
      category: 'D',
      section: 'ai',
      title: 'Readability and sentence structure',
      status: 'warn',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Readability score: ${fleschScore}/100. Sentences are long (average ${avgSentenceLength.toFixed(1)} words per sentence).`,
      recommendation:
        'Shorten complex compound sentences to 15-20 words to make statements easily quotable.',
    });
  } else {
    checks.push({
      id: 'AI-23',
      category: 'D',
      section: 'ai',
      title: 'Readability and sentence structure',
      status: 'pass',
      severity: 'L',
      effort: 'Quick win',
      evidence: `Readability score: ${fleschScore}/100. Content is accessible and clear.`,
      recommendation: 'Good readability profile.',
    });
  }

  // AI-24: Citable facts (statistics, dates, named sources, original data) (Sev M)
  const statsMatches = textContent.match(/\b\d+(\.\d+)?%|\$\d+[\d,]*|\b(19\d\d|20\d\d)\b|\b\d{1,3}(,\d{3})+\b/g) || [];
  const attributionMatches = textContent.match(/according to|study by|source:|research by|published in|survey of|findings show/i) || [];

  if (statsMatches.length >= 3 || attributionMatches.length > 0) {
    checks.push({
      id: 'AI-24',
      category: 'D',
      section: 'ai',
      title: 'Citable facts and verifiable data points',
      status: 'pass',
      severity: 'M',
      effort: 'Moderate',
      evidence: `Identified ${statsMatches.length} numeric/date data points${attributionMatches.length > 0 ? ' with authoritative attribution phrases' : ''}.`,
      recommendation:
        'AI answer engines actively search for empirical metrics and specific data points to cite as sources.',
    });
  } else {
    checks.push({
      id: 'AI-24',
      category: 'D',
      section: 'ai',
      title: 'Citable facts and verifiable data points',
      status: 'warn',
      severity: 'M',
      effort: 'Moderate',
      evidence: 'Low density of specific statistics, benchmark figures, or sourced citations.',
      recommendation:
        'Inject specific statistics, release dates, benchmark metrics, and cited research. AI engines prioritize citing pages with unique, verifiable data.',
      snippet: `According to our 2026 benchmark of 500 sites, pages with structured JSON-LD achieved a 42% higher AI citation rate.`,
    });
  }

  return checks;
}

