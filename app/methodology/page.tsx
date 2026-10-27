import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { SCORING_CONFIG } from '@/config/weights';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Audit Methodology - Citeify AI SEO Scoring Engine',
  description:
    'Comprehensive documentation of the Citeify audit engine, scoring formulas, weights, and check catalogue.',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto max-w-4xl px-4 sm:px-6 py-12 flex flex-col gap-10">
        <div className="flex flex-col gap-3">
          <Badge variant="secondary" className="w-fit text-xs font-semibold">
            Methodology & Scoring Architecture
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Scoring Model & Check Heuristics
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Citeify computes an overall readiness score by blending 65% AI SEO signals with 35% classic technical and on-page SEO health. Every check is isolated and deterministic.
          </p>
        </div>

        <section className="flex flex-col gap-4 text-xs leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-bold text-foreground">1. Overall Formula</h2>
          <div className="p-4 rounded-xl border bg-muted/20 font-mono text-foreground">
            Overall Score = (0.65 × AI_Score) + (0.35 × Classic_Score)
          </div>
          <p>
            Each check is evaluated as <strong>Pass (1.0)</strong>, <strong>Warn (0.5)</strong>, or <strong>Fail (0.0)</strong>. Checks are multiplied by their severity weight: High (3), Medium (2), or Low (1). Category scores are scaled from 0 to 100.
          </p>
        </section>

        <section className="flex flex-col gap-4 text-xs leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-bold text-foreground">2. Category Weightings</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-border/70 bg-card">
              <CardContent className="p-4 flex flex-col gap-2">
                <span className="font-bold text-foreground">AI SEO Categories (65%)</span>
                <ul className="list-disc list-inside space-y-1">
                  <li>AI Crawler Access (20%)</li>
                  <li>Content Renderability (15%)</li>
                  <li>Structured Data & Entity Markup (20%)</li>
                  <li>Answer-Ready Content Structure (25%)</li>
                  <li>Entity, Trust & Authority (15%)</li>
                  <li>Freshness Signals (5%)</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card">
              <CardContent className="p-4 flex flex-col gap-2">
                <span className="font-bold text-foreground">Classic SEO Categories (35%)</span>
                <ul className="list-disc list-inside space-y-1">
                  <li>On-Page Foundation (30%)</li>
                  <li>Technical Architecture (25%)</li>
                  <li>Core Web Vitals & Performance (25%)</li>
                  <li>Links & Image Assets (10%)</li>
                  <li>Social Metadata (10%)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="flex flex-col gap-4 text-xs leading-relaxed text-muted-foreground">
          <h2 className="text-lg font-bold text-foreground">3. Critical Override Rules</h2>
          <p>
            Regardless of on-page content excellence, if robots.txt disallows primary search crawlers (e.g. OAI-SearchBot, PerplexityBot) or if directives include <code className="bg-muted px-1 py-0.5 rounded text-foreground">noindex</code>, the overall grade is automatically capped at <strong>Needs Work</strong>.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

