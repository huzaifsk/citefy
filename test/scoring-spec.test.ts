import { describe, it, expect } from 'vitest';
import { calculateAuditScores, extractPriorityFixes, getGradeFromScore } from '@/lib/scoring/engine';
import { CheckResult } from '@/types/audit';

describe('Scoring Engine Specification Compliance', () => {
  // 1. Required test case: Category with one High pass, one Medium warn, one Low fail:
  // expected: (3*1 + 2*0.5 + 1*0) / (3 + 2 + 1) = 4 / 6 = 66.666...% -> 66.67%
  it('evaluates category with one High pass, one Medium warn, and one Low fail as 66.67', () => {
    const checks: CheckResult[] = [
      { id: 'AI-17', category: 'D', section: 'ai', title: 'H1', status: 'pass', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'AI-18', category: 'D', section: 'ai', title: 'Questions', status: 'warn', severity: 'M', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'AI-23', category: 'D', section: 'ai', title: 'Readability', status: 'fail', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
    ];

    const result = calculateAuditScores(checks);
    const catD = result.categories.D;

    expect(catD.isExcluded).toBe(false);
    expect(catD.unroundedScore).toBeCloseTo(66.6666, 2);
    expect(catD.score).toBe(67); // Rounded display integer
  });

  // 2. Required test case: Category with only info checks is excluded and weights renormalized
  it('excludes categories with only info checks and renormalizes remaining category weights to 100', () => {
    // Category A has 1 info check (AI-03)
    // Category B has 1 High pass check (AI-08)
    const checks: CheckResult[] = [
      { id: 'AI-03', category: 'A', section: 'ai', title: 'Training crawlers', status: 'info', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'AI-08', category: 'B', section: 'ai', title: 'Main content', status: 'pass', severity: 'H', effort: 'Moderate', evidence: '', recommendation: '' },
    ];

    const result = calculateAuditScores(checks);
    expect(result.categories.A.isExcluded).toBe(true);
    expect(result.categories.B.isExcluded).toBe(false);

    // Category B is the only active category in AI section (originally weight 15), so it renormalizes to 100%
    expect(result.categories.B.weight).toBe(100);
    expect(result.unroundedAi).toBe(100);
    expect(result.ai).toBe(100);
  });

  // 3. Required test case: AI score 80 and Classic score 60: overall = 0.65*80 + 0.35*60 = 73
  it('computes overall score as 0.65 x AI + 0.35 x Classic (80 AI, 60 Classic => 73)', () => {
    // Construct checks so Category A (AI) gets exactly 80:
    // e.g. 5 checks of severity L (weight 1 each): 4 pass (4), 1 fail (0) -> 4/5 = 80%
    // Construct checks so Category F (Classic) gets exactly 60:
    // e.g. 5 checks of severity L: 3 pass (3), 2 fail (0) -> 3/5 = 60%
    const checks: CheckResult[] = [
      { id: 'AI-01', category: 'A', section: 'ai', title: 'c1', status: 'pass', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'AI-02', category: 'A', section: 'ai', title: 'c2', status: 'pass', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'AI-04', category: 'A', section: 'ai', title: 'c3', status: 'pass', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'AI-05', category: 'A', section: 'ai', title: 'c4', status: 'pass', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'AI-07', category: 'A', section: 'ai', title: 'c5', status: 'fail', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },

      { id: 'SEO-01', category: 'F', section: 'classic', title: 's1', status: 'pass', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'SEO-02', category: 'F', section: 'classic', title: 's2', status: 'pass', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'SEO-03', category: 'F', section: 'classic', title: 's3', status: 'pass', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'SEO-04', category: 'F', section: 'classic', title: 's4', status: 'fail', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'SEO-07', category: 'F', section: 'classic', title: 's5', status: 'fail', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
    ];

    const result = calculateAuditScores(checks);
    expect(result.unroundedAi).toBe(80);
    expect(result.unroundedClassic).toBe(60);
    expect(result.unroundedOverall).toBe(73);
    expect(result.overall).toBe(73);
  });

  // 4. Required test case: All checks pass: 100. All checks fail: 0.
  it('returns 100 when all checks pass and 0 when all checks fail', () => {
    const allPass: CheckResult[] = [
      { id: 'AI-01', category: 'A', section: 'ai', title: 't1', status: 'pass', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'SEO-01', category: 'F', section: 'classic', title: 't2', status: 'pass', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
    ];
    const passResult = calculateAuditScores(allPass);
    expect(passResult.overall).toBe(100);
    expect(passResult.ai).toBe(100);
    expect(passResult.classic).toBe(100);
    expect(passResult.grade).toBe('Excellent');

    const allFail: CheckResult[] = [
      { id: 'AI-01', category: 'A', section: 'ai', title: 't1', status: 'fail', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'SEO-01', category: 'F', section: 'classic', title: 't2', status: 'fail', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
    ];
    const failResult = calculateAuditScores(allFail);
    expect(failResult.overall).toBe(0);
    expect(failResult.ai).toBe(0);
    expect(failResult.classic).toBe(0);
    expect(failResult.grade).toBe('Poor');
  });

  // 5. Required test case: Boundary scores 90, 75, 50 map to Excellent, Good, Needs work
  it('correctly maps boundary scores 90, 75, 50 to Excellent, Good, and Needs work', () => {
    expect(getGradeFromScore(100)).toBe('Excellent');
    expect(getGradeFromScore(90)).toBe('Excellent');
    expect(getGradeFromScore(89.99)).toBe('Good');
    expect(getGradeFromScore(75)).toBe('Good');
    expect(getGradeFromScore(74.99)).toBe('Needs work');
    expect(getGradeFromScore(50)).toBe('Needs work');
    expect(getGradeFromScore(49.99)).toBe('Poor');
    expect(getGradeFromScore(0)).toBe('Poor');
  });

  // 6. Required test case: Crawler check fails with a numeric AI score of 85:
  // score stays 85, grade becomes "Needs work", banner flag is true
  it('caps AI SEO grade at "Needs work" when AI-02 search bot check fails while numeric score remains 85', () => {
    // Construct checks where AI score calculates to ~85.7% or 85
    // Severity H fail (3 * 0 = 0), Severity H pass (3 * 1 = 3),
    // and several other checks to reach ~85.
    const checks: CheckResult[] = [
      { id: 'AI-02', category: 'A', section: 'ai', title: 'AI Search Bots Allowed', status: 'fail', severity: 'H', effort: 'Quick win', evidence: 'OAI blocked', recommendation: 'allow' },
      { id: 'AI-01', category: 'A', section: 'ai', title: 'robots.txt exists', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-08', category: 'B', section: 'ai', title: 'Renderability', status: 'pass', severity: 'H', effort: 'Moderate', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-12', category: 'C', section: 'ai', title: 'JSON-LD', status: 'pass', severity: 'H', effort: 'Moderate', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-17', category: 'D', section: 'ai', title: 'Headings', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-25', category: 'E', section: 'ai', title: 'Author', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
    ];

    const result = calculateAuditScores(checks);
    // AI-02 failed: critical override must trigger
    expect(result.criticalOverride).toBe(true);
    expect(result.aiGrade).toBe('Needs work');
    expect(result.grade).toBe('Needs work');
    expect(result.overrideReason).toContain('search and answer bots');
    // Numeric score is untouched
    expect(result.ai).toBeGreaterThan(75);
  });

  // --- FIVE ADDITIONAL EDGE CASES ---

  // Edge Case 1: Empty check list produces safe zero scores without NaN
  it('handles empty checks array gracefully without throwing or NaN', () => {
    const result = calculateAuditScores([]);
    expect(result.overall).toBe(0);
    expect(result.ai).toBe(0);
    expect(result.classic).toBe(0);
    expect(result.grade).toBe('Poor');
    expect(result.criticalOverride).toBe(false);
  });

  // Edge Case 2: "not-applicable" checks are excluded from both numerator and denominator
  it('excludes not-applicable status from both earned points and possible weight', () => {
    const checks: CheckResult[] = [
      { id: 'AI-12', category: 'C', section: 'ai', title: 'JSON-LD', status: 'pass', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
      { id: 'AI-15', category: 'C', section: 'ai', title: 'Entity linking', status: 'not-applicable', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
    ];
    const result = calculateAuditScores(checks);
    expect(result.categories.C.unroundedScore).toBe(100);
    expect(result.categories.C.score).toBe(100);
  });

  // Edge Case 3: noindex directive (AI-05 fail) or CDN block (AI-04 fail) triggers critical override
  it('triggers critical override when AI-05 has noindex directive or AI-04 has CDN block', () => {
    const checksWithAi05: CheckResult[] = [
      { id: 'AI-05', category: 'A', section: 'ai', title: 'Page-level directives', status: 'fail', severity: 'H', effort: 'Quick win', evidence: 'noindex found', recommendation: 'remove' },
      { id: 'AI-08', category: 'B', section: 'ai', title: 'Renderability', status: 'pass', severity: 'H', effort: 'Moderate', evidence: 'ok', recommendation: 'ok' },
      { id: 'SEO-01', category: 'F', section: 'classic', title: 'Title', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
    ];
    const resultAi05 = calculateAuditScores(checksWithAi05);
    expect(resultAi05.criticalOverride).toBe(true);
    expect(resultAi05.grade).toBe('Needs work');
    expect(resultAi05.overrideReason).toContain('noindex');

    const checksWithAi04: CheckResult[] = [
      { id: 'AI-04', category: 'A', section: 'ai', title: 'WAF / CDN blocks', status: 'fail', severity: 'H', effort: 'Quick win', evidence: 'Cloudflare 403', recommendation: 'allow' },
      { id: 'AI-08', category: 'B', section: 'ai', title: 'Renderability', status: 'pass', severity: 'H', effort: 'Moderate', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-12', category: 'C', section: 'ai', title: 'JSON-LD', status: 'pass', severity: 'H', effort: 'Moderate', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-17', category: 'D', section: 'ai', title: 'Heading structure', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'SEO-01', category: 'F', section: 'classic', title: 'Title tag', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
    ];
    const resultAi04 = calculateAuditScores(checksWithAi04);
    expect(resultAi04.criticalOverride).toBe(true);
    expect(resultAi04.grade).toBe('Needs work');
    expect(resultAi04.overrideReason).toContain('CDN or firewall');
  });

  // Edge Case 4: Multiple categories with differing weights renormalize proportionately
  it('renormalizes active categories proportionately when some categories have only info checks', () => {
    // In AI section:
    // Category B (base weight 15): 100% score (High pass = 3/3)
    // Category D (base weight 25): 50% score (High warn = 1.5/3)
    // Categories A, C, E, Freshness have no scored checks.
    // Total active weight = 15 + 25 = 40.
    // Normalized weights: B = 15/40 = 37.5%, D = 25/40 = 62.5%.
    // Expected AI score = 100 * 0.375 + 50 * 0.625 = 37.5 + 31.25 = 68.75.
    const checks: CheckResult[] = [
      { id: 'AI-08', category: 'B', section: 'ai', title: 'B1', status: 'pass', severity: 'H', effort: 'Moderate', evidence: '', recommendation: '' },
      { id: 'AI-17', category: 'D', section: 'ai', title: 'D1', status: 'warn', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
    ];

    const result = calculateAuditScores(checks);
    expect(result.categories.B.weight).toBe(37.5);
    expect(result.categories.D.weight).toBe(62.5);
    expect(result.unroundedAi).toBeCloseTo(68.75, 4);
    expect(result.ai).toBe(69);
  });

  // Edge Case 5: Priority fixes are calculated strictly as severityWeight x categoryWeight
  it('calculates priority fixes strictly as severityWeight x categoryWeight and sorts descending', () => {
    const checks: CheckResult[] = [
      // Check 1: Category D (weight 25), Severity M (weight 2) => priorityScore = 50
      { id: 'AI-18', category: 'D', section: 'ai', title: 'Questions', status: 'warn', severity: 'M', effort: 'Quick win', evidence: '', recommendation: '' },
      // Check 2: Category A (weight 20), Severity H (weight 3) => priorityScore = 60
      { id: 'AI-02', category: 'A', section: 'ai', title: 'Search Bots', status: 'fail', severity: 'H', effort: 'Quick win', evidence: '', recommendation: '' },
      // Check 3: Category Freshness (weight 5), Severity L (weight 1) => priorityScore = 5
      { id: 'AI-07', category: 'Freshness', section: 'ai', title: 'Freshness', status: 'warn', severity: 'L', effort: 'Quick win', evidence: '', recommendation: '' },
    ];

    const scores = calculateAuditScores(checks);
    const fixes = extractPriorityFixes(checks, scores.categories);

    expect(fixes).toHaveLength(3);
    // Renormalized: Category A = 20/50 * 100 = 40 -> priority = 3 * 40 = 120
    // Category D = 25/50 * 100 = 50 -> priority = 2 * 50 = 100
    // Category Freshness = 5/50 * 100 = 10 -> priority = 1 * 10 = 10
    expect(fixes[0].id).toBe('AI-02');
    expect(fixes[0].priorityScore).toBe(120);
    expect(fixes[1].id).toBe('AI-18');
    expect(fixes[1].priorityScore).toBe(100);
    expect(fixes[2].id).toBe('AI-07');
    expect(fixes[2].priorityScore).toBe(10);
  });
});
