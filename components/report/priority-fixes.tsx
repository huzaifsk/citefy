'use client';

import * as React from 'react';
import { CheckResult } from '@/types/audit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Copy, Check, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { StatusChip, SeverityChip, EffortChip } from '@/components/ui/audit-chips';

interface PriorityFixesProps {
  fixes: CheckResult[];
}

export function PriorityFixes({ fixes }: PriorityFixesProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const topFixes = fixes.slice(0, 5);

  const handleCopySnippet = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    toast.success('Code snippet copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (topFixes.length === 0) {
    return (
      <Card className="border-border/80 shadow-xs bg-card/60 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
          <Check className="size-6 text-emerald-500" />
          <span className="font-medium text-foreground">Zero High-Priority Issues Found</span>
          <p className="text-xs">This page passes all primary AI readiness baseline criteria.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              Top 5 Priority Fixes
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Prioritized by impact (severity weight × category weight) with implementation effort.
            </CardDescription>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-muted/60 border border-border/40">
            Ranked: Severity × Category Weight
          </span>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        {topFixes.map((fix, idx) => {
          return (
            <div
              key={fix.id}
              className="p-4 rounded-xl border border-border/70 bg-card hover:border-border transition-colors flex flex-col gap-3"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex size-5 rounded-full bg-muted text-[11px] font-bold items-center justify-center text-muted-foreground shrink-0 font-mono">
                    {idx + 1}
                  </span>
                  <StatusChip status={fix.status} />
                  <h4 className="font-semibold text-sm text-foreground">
                    <span className="text-muted-foreground font-mono mr-1">[{fix.id}]</span>
                    {fix.title}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                  <SeverityChip severity={fix.severity} />
                  {fix.effort && <EffortChip effort={fix.effort} />}
                </div>
              </div>

              {/* Evidence & Why it matters */}
              <div className="text-xs text-muted-foreground flex flex-col gap-1.5 bg-muted/20 p-2.5 rounded-lg border border-border/30">
                <p>
                  <strong className="text-foreground">Evidence:</strong> {fix.evidence}
                </p>
                <p>
                  <strong className="text-foreground">Recommendation:</strong> {fix.recommendation}
                </p>
              </div>

              {/* Copy-Paste Code Snippet */}
              {fix.snippet && (
                <div className="relative group rounded-lg bg-zinc-950 p-3 font-mono text-xs text-zinc-200 overflow-x-auto border border-zinc-800">
                  <div className="absolute right-2 top-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <Button
                              variant="outline"
                              size="icon-xs"
                              onClick={() => handleCopySnippet(fix.id, fix.snippet!)}
                              className="size-7 bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-[0.97]"
                            >
                              {copiedId === fix.id ? (
                                <Check className="size-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                              <span className="sr-only">Copy snippet</span>
                            </Button>
                          }
                        />
                        <TooltipContent className="text-xs">Copy snippet</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <pre className="pr-8 text-[11px] leading-relaxed whitespace-pre-wrap">{fix.snippet}</pre>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
