'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, ShieldCheck, Scale, Cpu, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function MethodologyDialog() {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground active:scale-[0.98] transition-transform duration-150 ease-out"
          >
            <HelpCircle data-icon="inline-start" className="size-3.5" />
            Methodology & Scoring
          </Button>
        }
      />
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Audit Architecture v1.0
            </Badge>
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight">
            AI SEO Audit Methodology & Scoring Logic
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            How Citeify evaluates machine-readability, answer readiness, and search health.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
          {/* Section 1: Framing */}
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-foreground flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-medium text-amber-800 dark:text-amber-300">
              <AlertTriangle className="size-4 shrink-0" />
              <span>Critical Framing & Ethical Disclaimer</span>
            </div>
            <p className="text-xs text-muted-foreground leading-normal">
              Nobody outside proprietary AI vendors (OpenAI, Anthropic, Google, Perplexity) knows the exact
              live ranking or citation weights used by answer engines. Citeify measures <strong>readiness, structural accessibility, and verified best practices</strong>—never guaranteed citations.
            </p>
          </div>

          {/* Section 2: Scoring Formula */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Scale className="size-4 text-primary" />
              <span>Scoring Model & Weights</span>
            </div>
            <p>
              The Overall Score combines two distinct perspectives:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-lg border bg-card">
                <span className="font-semibold text-foreground">AI SEO Readiness (65% Weight)</span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>AI Crawler Access (20%)</li>
                  <li>Content Renderability (15%)</li>
                  <li>Structured Data & Entities (20%)</li>
                  <li>Answer-Ready Content (25%)</li>
                  <li>Entity, Trust & Authority (15%)</li>
                  <li>Freshness Signals (5%)</li>
                </ul>
              </div>
              <div className="p-3 rounded-lg border bg-card">
                <span className="font-semibold text-foreground">Classic SEO Health (35% Weight)</span>
                <ul className="mt-1 list-disc list-inside space-y-0.5 text-muted-foreground">
                  <li>On-Page Foundation (30%)</li>
                  <li>Technical Architecture (25%)</li>
                  <li>Performance & Vitals (25%)</li>
                  <li>Links & Image Assets (10%)</li>
                  <li>Social Metadata (10%)</li>
                </ul>
              </div>
            </div>
          </div>

          <Separator />

          {/* Section 3: Critical Override */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="size-4 text-destructive" />
              <span>Critical Override Protection</span>
            </div>
            <p className="text-xs">
              If search answer crawlers (OAI-SearchBot, PerplexityBot) are blocked in robots.txt, or if page directives contain <code className="bg-muted px-1 py-0.5 rounded text-foreground">noindex</code>, the overall grade is automatically capped at <strong>Needs Work</strong> regardless of content quality.
            </p>
          </div>

          <Separator />

          {/* Section 4: Why Raw HTML */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <Cpu className="size-4 text-primary" />
              <span>Why Raw HTML (No Client JS Execution)?</span>
            </div>
            <p className="text-xs">
              Most fast answer crawlers operate high-volume, low-latency scrapers without running heavy JavaScript execution engines. Evaluating raw server HTML accurately exposes blank client-side app shells that human browsers render fine, but AI crawlers perceive as empty.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

