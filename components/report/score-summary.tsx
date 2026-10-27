'use client';

import * as React from 'react';
import { AuditScores } from '@/types/audit';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertOctagon, Sparkles } from 'lucide-react';
import { RadialScoreGauges } from './charts/radial-score-gauges';

interface ScoreSummaryProps {
  scores: AuditScores;
}

export function ScoreSummary({ scores }: ScoreSummaryProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Critical Override Alert Banner */}
      {scores.criticalOverride && (
        <Alert
          variant="destructive"
          className="border-red-500/50 bg-red-500/10 dark:bg-red-950/40 text-red-700 dark:text-red-300 animate-in-scale"
        >
          <AlertOctagon className="size-4 shrink-0 text-red-600 dark:text-red-400" />
          <div className="flex flex-col gap-1 ml-2">
            <AlertTitle className="font-semibold text-sm">
              Critical AI Crawling / Indexing Barrier Detected
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed text-red-600/90 dark:text-red-300/90">
              {scores.overrideReason ||
                'AI answer crawlers (OAI-SearchBot / PerplexityBot) are explicitly blocked or a page-level noindex directive is present. AI Readiness grade is capped at "Needs work" until resolved.'}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Primary Score Gauges using Recharts and WCAG AA Grade Chips */}
      <RadialScoreGauges scores={scores} />

      {/* Category quick progress cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        {Object.values(scores.categories).slice(0, 6).map((cat) => {
          const barColor =
            cat.score >= 90
              ? 'bg-emerald-500'
              : cat.score >= 75
              ? 'bg-lime-500'
              : cat.score >= 50
              ? 'bg-amber-500'
              : 'bg-rose-500';

          return (
            <Card key={cat.id} className="p-2.5 bg-card/60 border-border/60 backdrop-blur-xs">
              <div className="flex justify-between items-center text-[11px] font-medium text-muted-foreground truncate mb-1.5">
                <span className="truncate">{cat.name}</span>
                <span className="font-bold font-mono text-foreground shrink-0 ml-1">
                  {cat.isExcluded ? 'N/A' : `${cat.score}%`}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cat.isExcluded ? 'bg-muted-foreground/30' : barColor
                  }`}
                  style={{ width: `${cat.isExcluded ? 0 : cat.score}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
