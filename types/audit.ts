export type CheckStatus = 'pass' | 'warn' | 'fail' | 'info' | 'not-applicable';

export type CheckSeverity = 'H' | 'M' | 'L';

export type EffortLevel = 'Quick win' | 'Moderate' | 'Heavy';

export type AuditSection = 'ai' | 'classic';

export type CategoryId =
  | 'A' // AI crawler access
  | 'B' // Content renderability
  | 'C' // Structured data and entity markup
  | 'D' // Answer-ready content structure
  | 'E' // Entity, trust and authority signals
  | 'Freshness' // Freshness (AI-07 lastmod, AI-26)
  | 'F' // Classic On-page
  | 'G' // Classic Technical
  | 'H' // Performance (PageSpeed)
  | 'LinksImages' // Links and images
  | 'I'; // Social sharing

export interface CheckResult {
  id: string;
  category: CategoryId;
  section: AuditSection;
  title: string;
  status: CheckStatus;
  severity: CheckSeverity;
  evidence: string;
  recommendation: string;
  snippet?: string;
  docsLink?: string;
  effort: EffortLevel;
  priorityScore?: number;
}

export interface CategoryScore {
  id: CategoryId;
  name: string;
  section: AuditSection;
  weight: number;
  score: number;
  unroundedScore?: number;
  isExcluded?: boolean;
  passedCount: number;
  warnCount: number;
  failCount: number;
  infoCount: number;
}

export interface CrawlerMatrixItem {
  id: string;
  name: string;
  owner: string;
  userAgentHeader: string;
  botType: 'search' | 'training';
  robotsStatus: 'allowed' | 'disallowed' | 'unspecified';
  liveFetchStatus: number | 'ERR' | 'TIMEOUT';
  liveFetchSize?: number;
  isBlocked: boolean;
  notes?: string;
}

export interface StructuredDataReport {
  present: boolean;
  valid: boolean;
  types: string[];
  itemsCount: number;
  syntaxErrors: string[];
  sameAsLinks: string[];
  hasEntityLinking: boolean;
  matchesVisibleContent: boolean;
}

export interface PerformanceMetrics {
  isAvailable: boolean;
  lcp: number | null; // seconds
  cls: number | null; // unitless
  inp: number | null; // ms
  tbt: number | null; // ms
  performanceScore: number | null; // 0-100
  accessibilityScore: number | null; // 0-100
  source: 'google-psi' | 'fallback' | 'unavailable';
  errorMessage?: string;
}

export type GradeLevel = 'Excellent' | 'Good' | 'Needs work' | 'Poor';

export interface AuditScores {
  overall: number; // 0-100 (display rounded)
  unroundedOverall?: number;
  ai: number;      // 0-100 (display rounded)
  unroundedAi?: number;
  classic: number; // 0-100 (display rounded)
  unroundedClassic?: number;
  grade: GradeLevel;
  aiGrade: GradeLevel;
  classicGrade: GradeLevel;
  criticalOverride: boolean;
  overrideReason?: string;
  categories: Record<CategoryId, CategoryScore>;
}

export interface AuditReportMeta {
  url: string;
  finalUrl: string;
  redirectChain: string[];
  timestamp: string;
  toolVersion: string;
  timingMs: number;
  contentLength: number;
  contentType: string;
  httpStatus: number;
}

export interface LlmInsights {
  summary: string;
  keyTakeaways: string[];
  isAiGenerated: boolean;
}

export interface AuditReport {
  meta: AuditReportMeta;
  scores: AuditScores;
  checks: CheckResult[];
  priorities: CheckResult[];
  crawlerMatrix: CrawlerMatrixItem[];
  structuredData: StructuredDataReport;
  performance: PerformanceMetrics;
  llmInsights?: LlmInsights;
}

export interface PageAnalyzeResponse {
  finalUrl: string;
  redirectChain: string[];
  headers: Record<string, string>;
  status: number;
  timingMs: number;
  contentLength: number;
  checks: CheckResult[];
  structuredData: StructuredDataReport;
  rawTextStats: {
    wordCount: number;
    headingsCount: number;
    paragraphsCount: number;
    imagesCount: number;
  };
}

export interface SiteAnalyzeResponse {
  robotsFound: boolean;
  robotsUrl: string;
  sitemapFound: boolean;
  sitemapUrl?: string;
  sitemapLastmodCount: number;
  llmsTxtFound: boolean;
  llmsTxtUrl?: string;
  llmsTxtValid: boolean;
  checks: CheckResult[];
  crawlerMatrix: CrawlerMatrixItem[];
}

