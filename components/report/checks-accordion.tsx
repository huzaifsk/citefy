'use client';

import * as React from 'react';
import { AuditSection, CategoryId, CategoryScore, CheckResult } from '@/types/audit';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Copy,
  Check,
  Filter,
  Bot,
  Search,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  StatusChip,
  SeverityChip,
  CategoryChip,
} from '@/components/ui/audit-chips';

interface ChecksAccordionProps {
  checks: CheckResult[];
  categories: Record<CategoryId, CategoryScore>;
  activeSection: AuditSection;
  onSectionChange: (sec: AuditSection) => void;
}

type StatusFilter = 'all' | 'fail' | 'warn' | 'pass';

// List of checks marked as heuristics in the PRD methodology
const HEURISTIC_CHECK_IDS = new Set([
  'AI-17', // Answer-first layout heuristic
  'AI-18', // Self-contained answer blocks
  'AI-20', // Data density ratio
  'AI-24', // Authoritative tone heuristic
  'AI-28', // First-party data signals
  'AI-30', // Editorial policy heuristic
  'SEO-16', // Fallback synthetic performance
]);

export function ChecksAccordion({
  checks,
  categories,
  activeSection,
  onSectionChange,
}: ChecksAccordionProps) {
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    toast.success('Snippet copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter checks by current active section (ai vs classic)
  const sectionChecks = checks.filter((c) => c.section === activeSection);

  // Filter checks by status
  const filteredChecks = sectionChecks.filter((c) => {
    if (statusFilter === 'all') return true;
    return c.status === statusFilter;
  });

  // Group by category
  const groupedCategories = Object.values(categories).filter(
    (cat) => cat.section === activeSection
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation Controls: Section Tabs and Status Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-xs">
        <Tabs
          value={activeSection}
          onValueChange={(val) => onSectionChange(val as AuditSection)}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid grid-cols-2 w-full sm:w-80">
            <TabsTrigger value="ai" className="text-xs font-semibold gap-1.5 active:scale-[0.98]">
              <Bot className="size-3.5" />
              AI SEO Checks
            </TabsTrigger>
            <TabsTrigger value="classic" className="text-xs font-semibold gap-1.5 active:scale-[0.98]">
              <Search className="size-3.5" />
              Classic SEO Checks
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          <span className="flex items-center gap-1 text-[11px] text-muted-foreground mr-1">
            <Filter className="size-3" /> Filter:
          </span>
          {(['all', 'fail', 'warn', 'pass'] as StatusFilter[]).map((filter) => {
            const count =
              filter === 'all'
                ? sectionChecks.length
                : sectionChecks.filter((c) => c.status === filter).length;

            return (
              <Button
                key={filter}
                variant={statusFilter === filter ? 'default' : 'outline'}
                size="xs"
                onClick={() => setStatusFilter(filter)}
                className="text-[11px] capitalize rounded-md px-2 active:scale-[0.97]"
              >
                {filter} ({count})
              </Button>
            );
          })}
        </div>
      </div>

      {/* Accordion Categories */}
      <div className="flex flex-col gap-3">
        {groupedCategories.map((cat) => {
          const catChecks = filteredChecks.filter((c) => c.category === cat.id);
          if (statusFilter !== 'all' && catChecks.length === 0) return null;

          return (
            <div
              key={cat.id}
              className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-xs"
            >
              {/* Category Header */}
              <div className="p-3.5 bg-muted/30 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm text-foreground">{cat.name}</h3>
                  <Badge variant="secondary" className="text-[10px] font-mono px-1.5">
                    Weight: {cat.weight}%
                  </Badge>
                  {cat.isExcluded && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground">
                      Excluded (No Scored Checks)
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Category Score:</span>
                  <span
                    className={`font-bold font-mono ${
                      cat.isExcluded
                        ? 'text-muted-foreground'
                        : cat.score >= 90
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : cat.score >= 75
                        ? 'text-lime-600 dark:text-lime-400'
                        : cat.score >= 50
                        ? 'text-amber-500'
                        : 'text-rose-500'
                    }`}
                  >
                    {cat.isExcluded ? 'N/A' : `${cat.score}/100`}
                  </span>
                </div>
              </div>

              {catChecks.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground italic text-center">
                  No checks match the &quot;{statusFilter}&quot; filter in this category.
                </div>
              ) : (
                <Accordion className="w-full">
                  {catChecks.map((check) => {
                    const isHeuristic = HEURISTIC_CHECK_IDS.has(check.id);

                    return (
                      <AccordionItem
                        key={check.id}
                        value={check.id}
                        className="px-4 border-b border-border/40 last:border-b-0 hover:bg-muted/10 transition-colors"
                      >
                        <AccordionTrigger className="hover:no-underline py-3">
                          <div className="flex items-start sm:items-center gap-2.5 text-left pr-2 flex-wrap sm:flex-nowrap w-full">
                            {/* Standardized Status Chip */}
                            <StatusChip status={check.status} />

                            <span className="font-semibold text-xs sm:text-sm text-foreground flex items-center gap-1.5 flex-wrap">
                              <span className="text-muted-foreground font-mono">[{check.id}]</span>
                              <span>{check.title}</span>
                              {isHeuristic && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-mono text-muted-foreground bg-muted border border-border/40">
                                  <Sparkles className="size-2.5" /> Heuristic
                                </span>
                              )}
                            </span>

                            <div className="flex items-center gap-1.5 ml-auto shrink-0">
                              <SeverityChip severity={check.severity} />
                              <CategoryChip section={check.section} />
                            </div>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="pt-1 pb-4 flex flex-col gap-3 text-xs leading-relaxed">
                          {/* Evidence Block */}
                          <div className="p-3 rounded-lg bg-muted/30 border border-border/50 flex flex-col gap-1">
                            <span className="font-semibold text-foreground">Evaluation & Evidence:</span>
                            <p className="text-muted-foreground">{check.evidence}</p>
                          </div>

                          {/* Recommendation Block */}
                          <div className="p-3 rounded-lg bg-card border border-border/70 flex flex-col gap-1">
                            <span className="font-semibold text-foreground">Why It Matters & Action:</span>
                            <p className="text-muted-foreground">{check.recommendation}</p>
                          </div>

                          {/* Code Snippet if any */}
                          {check.snippet && (
                            <div className="relative group rounded-lg bg-zinc-950 p-3 font-mono text-xs text-zinc-200 overflow-x-auto border border-zinc-800">
                              <div className="absolute right-2 top-2">
                                <Button
                                  variant="outline"
                                  size="icon-xs"
                                  onClick={() => handleCopy(check.id, check.snippet!)}
                                  className="size-7 bg-zinc-900 border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 active:scale-[0.97]"
                                >
                                  {copiedId === check.id ? (
                                    <Check className="size-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="size-3.5" />
                                  )}
                                  <span className="sr-only">Copy snippet</span>
                                </Button>
                              </div>
                              <pre className="pr-8 text-[11px] leading-relaxed whitespace-pre-wrap">
                                {check.snippet}
                              </pre>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
