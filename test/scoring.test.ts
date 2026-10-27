import { describe, it, expect } from 'vitest';
import { calculateAuditScores, extractPriorityFixes } from '@/lib/scoring/engine';
import { CheckResult } from '@/types/audit';

describe('Scoring Engine Basic Tests', () => {
  it('computes 100 for all passed checks', () => {
    const dummyChecks: CheckResult[] = [
      { id: 'AI-01', category: 'A', section: 'ai', title: 'robots.txt', status: 'pass', severity: 'M', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-02', category: 'A', section: 'ai', title: 'search bots', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-08', category: 'B', section: 'ai', title: 'renderability', status: 'pass', severity: 'H', effort: 'Moderate', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-12', category: 'C', section: 'ai', title: 'json-ld', status: 'pass', severity: 'H', effort: 'Moderate', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-17', category: 'D', section: 'ai', title: 'heading', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-25', category: 'E', section: 'ai', title: 'author', status: 'pass', severity: 'M', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'SEO-01', category: 'F', section: 'classic', title: 'title tag', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'SEO-09', category: 'G', section: 'classic', title: 'https', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'SEO-16', category: 'H', section: 'classic', title: 'lcp', status: 'pass', severity: 'H', effort: 'Moderate', evidence: 'ok', recommendation: 'ok' },
      { id: 'SEO-20', category: 'I', section: 'classic', title: 'og tags', status: 'pass', severity: 'M', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
    ];

    const scores = calculateAuditScores(dummyChecks);
    expect(scores.overall).toBe(100);
    expect(scores.ai).toBe(100);
    expect(scores.classic).toBe(100);
    expect(scores.grade).toBe('Excellent');
    expect(scores.criticalOverride).toBe(false);
  });

  it('triggers critical override when AI-02 fails', () => {
    const dummyChecks: CheckResult[] = [
      { id: 'AI-01', category: 'A', section: 'ai', title: 'robots.txt', status: 'pass', severity: 'M', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-02', category: 'A', section: 'ai', title: 'search bots', status: 'fail', severity: 'H', effort: 'Quick win', evidence: 'blocked', recommendation: 'fix' },
      { id: 'SEO-01', category: 'F', section: 'classic', title: 'title tag', status: 'pass', severity: 'H', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
    ];

    const scores = calculateAuditScores(dummyChecks);
    expect(scores.criticalOverride).toBe(true);
    expect(scores.grade).toBe('Needs work');
    expect(scores.overrideReason).toContain('search and answer bots');
  });

  it('orders priority fixes by impact', () => {
    const dummyChecks: CheckResult[] = [
      { id: 'AI-06', category: 'A', section: 'ai', title: 'llms.txt', status: 'warn', severity: 'L', effort: 'Quick win', evidence: 'ok', recommendation: 'ok' },
      { id: 'AI-02', category: 'A', section: 'ai', title: 'search bots', status: 'fail', severity: 'H', effort: 'Quick win', evidence: 'blocked', recommendation: 'fix' },
      { id: 'SEO-02', category: 'F', section: 'classic', title: 'meta desc', status: 'warn', severity: 'M', effort: 'Quick win', evidence: 'short', recommendation: 'fix' },
    ];

    const scores = calculateAuditScores(dummyChecks);
    const priorities = extractPriorityFixes(dummyChecks, scores.categories);

    expect(priorities[0].id).toBe('AI-02');
    expect(priorities.length).toBeGreaterThanOrEqual(2);
  });
});
