import { CategoryId, CheckSeverity, GradeLevel } from '@/types/audit';

export const SCORING_CONFIG = {
  overallWeights: {
    ai: 0.65,
    classic: 0.35,
  },
  severityWeights: {
    H: 3,
    M: 2,
    L: 1,
  } as Record<CheckSeverity, number>,
  statusScores: {
    pass: 1.0,
    warn: 0.5,
    fail: 0.0,
  },
  aiCategoryWeights: {
    A: 20,          // AI crawler access
    B: 15,          // Content renderability
    C: 20,          // Structured data & entity markup
    D: 25,          // Answer-ready content
    E: 15,          // Entity, trust and authority
    Freshness: 5,   // Freshness signals
  } as Partial<Record<CategoryId, number>>,
  classicCategoryWeights: {
    F: 30,          // On-page
    G: 25,          // Technical
    H: 25,          // Performance
    LinksImages: 10,// Links and images
    I: 10,          // Social sharing
  } as Partial<Record<CategoryId, number>>,
  gradeThresholds: [
    { min: 90, grade: 'Excellent' as GradeLevel },
    { min: 75, grade: 'Good' as GradeLevel },
    { min: 50, grade: 'Needs work' as GradeLevel },
    { min: 0,  grade: 'Poor' as GradeLevel },
  ],
  categoryNames: {
    A: 'AI Crawler Access',
    B: 'Content Renderability',
    C: 'Structured Data & Entities',
    D: 'Answer-Ready Content',
    E: 'Entity, Trust & Authority',
    Freshness: 'Freshness Signals',
    F: 'On-Page SEO',
    G: 'Technical Architecture',
    H: 'Core Web Vitals & Speed',
    LinksImages: 'Links & Images',
    I: 'Social & Metadata',
  } as Record<CategoryId, string>,
};

