'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';

export interface AuditStage {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed';
}

interface ProgressStagesProps {
  currentStageIndex: number;
  stages: AuditStage[];
  url: string;
}

export function ProgressStages({ currentStageIndex, stages, url }: ProgressStagesProps) {
  const percent = Math.min(
    100,
    Math.round(((currentStageIndex + 0.5) / stages.length) * 100)
  );

  return (
    <Card className="w-full max-w-xl mx-auto border border-border/80 shadow-md bg-card/90 backdrop-blur-sm animate-in-scale">
      <CardContent className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1.5 text-center">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary">
            Live AI Readiness Inspection
          </span>
          <h3 className="text-lg font-bold text-foreground truncate px-4">
            Auditing {url}
          </h3>
          <p className="text-xs text-muted-foreground">
            Evaluating raw server HTML, robots directives, and structured entity graphs.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
            <span>Overall Progress</span>
            <span className="text-foreground font-semibold">{percent}%</span>
          </div>
          <Progress value={percent} className="h-2" />
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isRunning = stage.status === 'running';

            return (
              <div
                key={stage.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border text-xs transition-colors duration-200 ${
                  isRunning
                    ? 'border-primary/40 bg-primary/5 text-foreground font-medium'
                    : isCompleted
                      ? 'border-border/60 bg-muted/20 text-muted-foreground'
                      : 'border-transparent text-muted-foreground/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {isCompleted ? (
                    <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : isRunning ? (
                    <Loader2 className="size-4 text-primary animate-spin shrink-0" />
                  ) : (
                    <Circle className="size-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span>{stage.label}</span>
                </div>

                <span className="text-[11px] uppercase tracking-wider">
                  {isCompleted ? 'Done' : isRunning ? 'Evaluating...' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

