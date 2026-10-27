'use client';

import * as React from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { UrlForm } from '@/components/url-form';
import { ProgressStages, AuditStage } from '@/components/progress-stages';
import { ReportView } from '@/components/report/report-view';
import {
  AuditReport,
  CheckResult,
  PageAnalyzeResponse,
  PerformanceMetrics,
  SiteAnalyzeResponse,
} from '@/types/audit';
import { calculateAuditScores, extractPriorityFixes } from '@/lib/scoring/engine';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  Code2,
  FileSearch,
  Zap,
  Layers,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

const DEFAULT_STAGES: AuditStage[] = [
  { id: 'fetch', label: 'Fetching server HTML & headers', status: 'pending' },
  { id: 'site', label: 'Probing robots.txt, sitemaps & AI crawler agents', status: 'pending' },
  { id: 'schema', label: 'Parsing JSON-LD schema & entity graphs', status: 'pending' },
  { id: 'content', label: 'Evaluating answer-readiness & semantic structure', status: 'pending' },
  { id: 'perf', label: 'Measuring Core Web Vitals & performance', status: 'pending' },
  { id: 'score', label: 'Calculating weighted scores & fix priorities', status: 'pending' },
];

export default function HomePage() {
  const [report, setReport] = React.useState<AuditReport | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [stages, setStages] = React.useState<AuditStage[]>(DEFAULT_STAGES);
  const [currentStageIdx, setCurrentStageIdx] = React.useState(0);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [analyzingUrl, setAnalyzingUrl] = React.useState<string>('');

  const updateStage = (index: number, status: 'running' | 'completed' | 'pending') => {
    setCurrentStageIdx(index);
    setStages((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status } : idx < index ? { ...s, status: 'completed' } : s))
    );
  };

  const handleStartAudit = async (targetUrl: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setReport(null);
    setAnalyzingUrl(targetUrl);
    setStages(DEFAULT_STAGES);

    const startTime = Date.now();

    try {
      // Stage 0: Initializing fetch
      updateStage(0, 'running');

      // 1. Parallel Request: Page Analysis & Site Files Analysis
      const pagePromise = fetch('/api/analyze/page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || `Page fetch failed with status ${res.status}`);
        }
        return data as PageAnalyzeResponse;
      });

      const sitePromise = fetch('/api/analyze/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      }).then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || 'Site files inspection failed.');
        }
        return data as SiteAnalyzeResponse;
      });

      // Stage 1: Probing robots.txt and AI crawlers
      updateStage(1, 'running');

      // Wait for page & site results in parallel
      const [pageData, siteData] = await Promise.all([pagePromise, sitePromise]);
      updateStage(0, 'completed');
      updateStage(1, 'completed');

      // Stage 2: Schema evaluation
      updateStage(2, 'running');
      await new Promise((r) => setTimeout(r, 150));
      updateStage(2, 'completed');

      // Stage 3: Content analysis
      updateStage(3, 'running');
      await new Promise((r) => setTimeout(r, 150));
      updateStage(3, 'completed');

      // Stage 4: Performance audit (calls PSI with graceful fallback)
      updateStage(4, 'running');
      let perfData: { metrics: PerformanceMetrics; checks: CheckResult[] };
      try {
        const perfRes = await fetch('/api/analyze/performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: targetUrl }),
        });
        perfData = await perfRes.json();
      } catch {
        perfData = {
          metrics: {
            isAvailable: false,
            lcp: null,
            cls: null,
            inp: null,
            tbt: null,
            performanceScore: null,
            accessibilityScore: null,
            source: 'unavailable',
            errorMessage: 'Performance check timed out',
          },
          checks: [],
        };
      }
      updateStage(4, 'completed');

      // Stage 5: Calculate scores and priorities
      updateStage(5, 'running');

      const allChecks: CheckResult[] = [
        ...siteData.checks,
        ...pageData.checks,
        ...perfData.checks,
      ];

      const scores = calculateAuditScores(allChecks);
      const priorities = extractPriorityFixes(allChecks, scores.categories);

      // Call Insights endpoint (Optional LLM / smart rule fallback)
      let llmInsights;
      try {
        const insightsRes = await fetch('/api/analyze/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            scores: {
              overall: scores.overall,
              ai: scores.ai,
              classic: scores.classic,
              grade: scores.grade,
              criticalOverride: scores.criticalOverride,
              overrideReason: scores.overrideReason,
            },
            topIssues: priorities.slice(0, 5).map((p) => ({
              id: p.id,
              title: p.title,
              severity: p.severity,
              status: p.status,
              recommendation: p.recommendation,
            })),
            structuredDataTypes: pageData.structuredData.types,
            blockedBots: siteData.crawlerMatrix.filter((b) => b.isBlocked).map((b) => b.name),
          }),
        });
        if (insightsRes.ok) {
          llmInsights = await insightsRes.json();
        }
      } catch {
        // Non-blocking
      }

      updateStage(5, 'completed');

      const fullReport: AuditReport = {
        meta: {
          url: targetUrl,
          finalUrl: pageData.finalUrl,
          redirectChain: pageData.redirectChain,
          timestamp: new Date().toISOString(),
          toolVersion: '1.0.0',
          timingMs: Date.now() - startTime,
          contentLength: pageData.contentLength,
          contentType: pageData.headers['content-type'] || 'text/html',
          httpStatus: pageData.status,
        },
        scores,
        checks: allChecks,
        priorities,
        crawlerMatrix: siteData.crawlerMatrix,
        structuredData: pageData.structuredData,
        performance: perfData.metrics,
        llmInsights,
      };

      setReport(fullReport);
      toast.success('AI SEO readiness audit completed!');
    } catch (err: any) {
      setErrorMessage(err.message || 'Audit encountered an unexpected network failure.');
      toast.error('Audit failed to complete');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReport(null);
    setErrorMessage(null);
    setIsLoading(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/10 selection:text-primary">
      <Header />

      <main className="flex-1 container mx-auto max-w-6xl px-4 sm:px-6 py-8 md:py-12 flex flex-col gap-12">
        {report ? (
          /* Report Screen */
          <ReportView report={report} onReset={handleReset} />
        ) : (
          /* Landing Screen */
          <div className="flex flex-col gap-16">
            {/* Hero Section */}
            <section className="flex flex-col items-center text-center max-w-3xl mx-auto gap-6 pt-4 sm:pt-8">
              <Badge
                variant="secondary"
                className="gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border border-border/80 shadow-2xs"
              >
                <Sparkles className="size-3.5 text-primary" />
                Next-Generation Search Engine Readiness
              </Badge>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
                Is your website ready for{' '}
                <span className="bg-gradient-to-r from-primary via-indigo-600 to-sky-600 dark:from-primary dark:via-indigo-400 dark:to-sky-400 bg-clip-text text-transparent">
                  AI Answer Engines?
                </span>
              </h1>

              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Search is shifting from ten blue links to AI synthesis. Paste any URL to get an instant AI
                search readiness score, crawler matrix, structured data validation, and a prioritized fix checklist.
              </p>

              {/* URL Form Component */}
              <div className="w-full max-w-2xl pt-2">
                <UrlForm
                  onSubmit={handleStartAudit}
                  isLoading={isLoading}
                  errorMessage={errorMessage}
                  initialUrl={analyzingUrl}
                />
              </div>

              {/* Live Loading Progress Stages */}
              {isLoading && (
                <div className="w-full pt-4">
                  <ProgressStages
                    stages={stages}
                    currentStageIndex={currentStageIdx}
                    url={analyzingUrl}
                  />
                </div>
              )}
            </section>

            {/* How It Works (3 Steps) */}
            <section className="flex flex-col gap-6 pt-6 border-t border-border/50">
              <div className="flex flex-col items-center text-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Audit Methodology
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  How Citeify Audits AI Readiness
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-xl">
                  Designed specifically around how modern AI retrieval engines crawl, parse, and cite primary sources.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                      <Code2 className="size-5" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">
                      1. Raw HTML Evaluation
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      AI scrapers (OAI-SearchBot, PerplexityBot) parse raw server HTML without running client JavaScript. We verify your core content and facts are visible immediately in the initial payload.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="size-10 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <ShieldCheck className="size-5" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">
                      2. Crawler & Firewall Probing
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      We check robots.txt rules across 15+ search and training bots, and simulate live HTTP requests to detect subtle Cloudflare or WAF challenges that block AI indexing.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-border/70 bg-card/60 backdrop-blur-sm">
                  <CardContent className="p-6 flex flex-col gap-3">
                    <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Zap className="size-5" />
                    </div>
                    <h3 className="font-bold text-base text-foreground">
                      3. Prioritized Fix List
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Get a ranked checklist of issues scored by severity × impact, with copy-paste code snippets for Schema.org JSON-LD, inverted pyramid answer structures, and robots.txt.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* Feature Comparison Grid */}
            <section className="flex flex-col gap-6 pt-6 border-t border-border/50">
              <div className="flex flex-col items-center text-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Comprehensive Coverage
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  30 AI SEO Checks + 21 Classic SEO Checks
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-border/70 bg-card flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Bot className="size-4 text-primary" />
                    <span>AI Crawler Access</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Evaluates robots.txt allow rules for OAI-SearchBot, PerplexityBot, Claude, and probes live CDN blocking.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-card flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Layers className="size-4 text-primary" />
                    <span>Renderability & Architecture</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Detects empty client app shells, script-to-text bloat ratios, and semantic HTML5 landmarks (&lt;main&gt;, &lt;article&gt;).
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-card flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <Code2 className="size-4 text-primary" />
                    <span>Schema & Knowledge Graphs</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Validates Schema.org JSON-LD entity structures, author credentials, and sameAs links to external verified profiles.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border/70 bg-card flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <FileSearch className="size-4 text-primary" />
                    <span>Answer-Ready Content</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    Checks question headings, inverted-pyramid answer capsules (40-60 words), tables, FAQs, and citable empirical facts.
                  </p>
                </div>
              </div>
            </section>

            {/* FAQ Section (Semantic & Dogfooding AI-21) */}
            <section id="faq" className="flex flex-col gap-6 pt-6 border-t border-border/50 max-w-3xl mx-auto w-full">
              <div className="flex flex-col items-center text-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Frequently Asked Questions
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Common Questions About AI SEO
                </h2>
              </div>

              <div className="flex flex-col gap-3 text-xs leading-relaxed">
                <details className="group p-4 rounded-xl border border-border/70 bg-card transition-colors open:bg-muted/20">
                  <summary className="font-semibold text-sm text-foreground cursor-pointer list-none flex items-center justify-between">
                    <span>What is AI SEO and why does it matter in 2026?</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    AI SEO focuses on optimizing content so conversational answer engines (such as ChatGPT Search, Perplexity, Google AI Overviews, and Claude) can easily crawl, comprehend, and cite your page as a trusted source in generated answers.
                  </p>
                </details>

                <details className="group p-4 rounded-xl border border-border/70 bg-card transition-colors open:bg-muted/20">
                  <summary className="font-semibold text-sm text-foreground cursor-pointer list-none flex items-center justify-between">
                    <span>Why does Citeify analyze raw HTML instead of running JavaScript?</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    Most high-speed AI web search crawlers do not execute heavy client-side JavaScript frameworks. Analyzing raw HTML accurately reflects what AI answer agents actually encounter upon fetching your URL.
                  </p>
                </details>

                <details className="group p-4 rounded-xl border border-border/70 bg-card transition-colors open:bg-muted/20">
                  <summary className="font-semibold text-sm text-foreground cursor-pointer list-none flex items-center justify-between">
                    <span>Does this tool guarantee my site will be cited by ChatGPT or Perplexity?</span>
                    <span className="text-muted-foreground group-open:rotate-180 transition-transform">▼</span>
                  </summary>
                  <p className="mt-3 text-muted-foreground leading-relaxed">
                    No tool can guarantee citation, because proprietary AI vendors maintain evolving retrieval algorithms. Citeify provides an objective audit of readiness, machine accessibility, and semantic best practices.
                  </p>
                </details>
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
