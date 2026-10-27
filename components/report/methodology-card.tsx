import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { HelpCircle, AlertTriangle, ShieldCheck, Check } from 'lucide-react';

export function MethodologyCard() {
  return (
    <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <HelpCircle className="size-4 text-primary" />
          Audit Methodology & Boundaries
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Understanding what this report evaluates and how to interpret scores
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-xs leading-relaxed text-muted-foreground">
        <div className="p-3 rounded-lg border border-border/70 bg-muted/20 flex flex-col gap-1.5">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <AlertTriangle className="size-3.5 text-amber-500" />
            Ethical Framing & No-Guarantee Policy
          </span>
          <p>
            Nobody outside AI search vendors (OpenAI, Perplexity, Google, Anthropic) controls real-time citation weights. This audit provides an objective score of <strong>architectural readiness, machine accessibility, and semantic compliance</strong>. It does not promise or guarantee rankings or citations in answer engines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <span className="font-semibold text-foreground">1. Raw HTML Evaluation</span>
            <p className="mt-1">
              Evaluates initial server-rendered HTML payloads without running headless browsers. Matches the high-speed scrapers used by standard AI retrieval engines.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <span className="font-semibold text-foreground">2. Page + Origin Scope</span>
            <p className="mt-1">
              Combines single target page analysis with domain-level configuration files (/robots.txt, /sitemap.xml, /llms.txt) and AI crawler user-agent probes.
            </p>
          </div>
          <div className="p-3 rounded-lg border border-border/60 bg-card">
            <span className="font-semibold text-foreground">3. Config-Driven Rules</span>
            <p className="mt-1">
              Every check is weighted by severity and category impact. Heuristics are transparently documented with visible code snippets for immediate remediation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

