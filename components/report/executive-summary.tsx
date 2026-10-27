'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Sparkles, CheckCircle2, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { LlmInsights } from '@/types/audit';

interface ExecutiveSummaryProps {
  insights?: LlmInsights;
}

export function ExecutiveSummary({ insights }: ExecutiveSummaryProps) {
  if (!insights) return null;

  return (
    <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            Executive Synthesis
          </CardTitle>
          <Badge variant="outline" className="text-[11px] font-normal">
            {insights.isAiGenerated ? 'Gemini AI Insights' : 'Deterministic Rule Engine'}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground">
          High-level evaluation of answer-engine accessibility and immediate technical priorities
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4 text-sm leading-relaxed text-foreground/90">
        <p className="text-xs md:text-sm text-foreground/90 leading-relaxed bg-muted/20 p-3.5 rounded-lg border border-border/40">
          {insights.summary}
        </p>

        {insights.keyTakeaways && insights.keyTakeaways.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Lightbulb className="size-3.5 text-amber-500" />
              Strategic Takeaways
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
              {insights.keyTakeaways.map((takeaway, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg border border-border/60 bg-card flex items-start gap-2 text-muted-foreground"
                >
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span className="leading-snug text-foreground/90">{takeaway}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

