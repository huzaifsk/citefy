'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gauge, AlertCircle, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import { PerformanceMetrics } from '@/types/audit';
import { AUDIT_COLORS, StatusChip } from '@/components/ui/audit-chips';

interface CoreWebVitalsChartProps {
  performance?: PerformanceMetrics;
}

type MetricStatus = 'pass' | 'warn' | 'fail' | 'info';

interface VitalsMetric {
  id: string;
  name: string;
  abbr: string;
  value: number | null;
  unit: string;
  formattedValue: string;
  status: MetricStatus;
  statusText: 'Good' | 'Needs Improvement' | 'Poor' | 'N/A';
  goodThreshold: number;
  poorThreshold: number;
  goodLabel: string;
  needsImpLabel: string;
  poorLabel: string;
  percentOfMax: number;
}

export function CoreWebVitalsChart({ performance }: CoreWebVitalsChartProps) {
  const isAvailable = Boolean(
    performance &&
      performance.isAvailable &&
      (performance.lcp !== null ||
        performance.cls !== null ||
        performance.inp !== null ||
        performance.tbt !== null)
  );

  // Compute metrics
  const metrics: VitalsMetric[] = React.useMemo(() => {
    if (!performance) return [];

    // 1. LCP
    const lcpVal = performance.lcp;
    let lcpStatus: MetricStatus = 'info';
    let lcpText: 'Good' | 'Needs Improvement' | 'Poor' | 'N/A' = 'N/A';
    let lcpPct = 0;
    if (lcpVal !== null) {
      if (lcpVal <= 2.5) {
        lcpStatus = 'pass';
        lcpText = 'Good';
      } else if (lcpVal <= 4.0) {
        lcpStatus = 'warn';
        lcpText = 'Needs Improvement';
      } else {
        lcpStatus = 'fail';
        lcpText = 'Poor';
      }
      lcpPct = Math.min(100, Math.max(5, (lcpVal / 5.0) * 100));
    }

    // 2. CLS
    const clsVal = performance.cls;
    let clsStatus: MetricStatus = 'info';
    let clsText: 'Good' | 'Needs Improvement' | 'Poor' | 'N/A' = 'N/A';
    let clsPct = 0;
    if (clsVal !== null) {
      if (clsVal <= 0.1) {
        clsStatus = 'pass';
        clsText = 'Good';
      } else if (clsVal <= 0.25) {
        clsStatus = 'warn';
        clsText = 'Needs Improvement';
      } else {
        clsStatus = 'fail';
        clsText = 'Poor';
      }
      clsPct = Math.min(100, Math.max(5, (clsVal / 0.4) * 100));
    }

    // 3. INP or TBT
    const hasInp = performance.inp !== null;
    const interactiveVal = hasInp ? performance.inp : performance.tbt;
    const isInteractiveInp = hasInp;
    let intStatus: MetricStatus = 'info';
    let intText: 'Good' | 'Needs Improvement' | 'Poor' | 'N/A' = 'N/A';
    let intPct = 0;

    if (interactiveVal !== null) {
      const goodCutoff = 200;
      const poorCutoff = isInteractiveInp ? 500 : 600;
      const maxScale = isInteractiveInp ? 700 : 800;

      if (interactiveVal <= goodCutoff) {
        intStatus = 'pass';
        intText = 'Good';
      } else if (interactiveVal <= poorCutoff) {
        intStatus = 'warn';
        intText = 'Needs Improvement';
      } else {
        intStatus = 'fail';
        intText = 'Poor';
      }
      intPct = Math.min(100, Math.max(5, (interactiveVal / maxScale) * 100));
    }

    return [
      {
        id: 'lcp',
        name: 'Largest Contentful Paint',
        abbr: 'LCP',
        value: lcpVal,
        unit: 's',
        formattedValue: lcpVal !== null ? `${lcpVal.toFixed(2)}s` : '—',
        status: lcpStatus,
        statusText: lcpText,
        goodThreshold: 2.5,
        poorThreshold: 4.0,
        goodLabel: '≤ 2.5s',
        needsImpLabel: '2.5s - 4.0s',
        poorLabel: '> 4.0s',
        percentOfMax: lcpPct,
      },
      {
        id: 'cls',
        name: 'Cumulative Layout Shift',
        abbr: 'CLS',
        value: clsVal,
        unit: '',
        formattedValue: clsVal !== null ? clsVal.toFixed(3) : '—',
        status: clsStatus,
        statusText: clsText,
        goodThreshold: 0.1,
        poorThreshold: 0.25,
        goodLabel: '≤ 0.10',
        needsImpLabel: '0.10 - 0.25',
        poorLabel: '> 0.25',
        percentOfMax: clsPct,
      },
      {
        id: isInteractiveInp ? 'inp' : 'tbt',
        name: isInteractiveInp ? 'Interaction to Next Paint' : 'Total Blocking Time',
        abbr: isInteractiveInp ? 'INP' : 'TBT',
        value: interactiveVal,
        unit: 'ms',
        formattedValue: interactiveVal !== null ? `${Math.round(interactiveVal)}ms` : '—',
        status: intStatus,
        statusText: intText,
        goodThreshold: 200,
        poorThreshold: isInteractiveInp ? 500 : 600,
        goodLabel: '≤ 200ms',
        needsImpLabel: isInteractiveInp ? '200 - 500ms' : '200 - 600ms',
        poorLabel: isInteractiveInp ? '> 500ms' : '> 600ms',
        percentOfMax: intPct,
      },
    ];
  }, [performance]);

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-sm border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Gauge className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                Core Web Vitals Thresholds
              </CardTitle>
              <CardDescription className="text-xs">
                User experience signals evaluated against Google field guidelines
              </CardDescription>
            </div>
          </div>
          {performance?.source && (
            <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-muted/50 border border-border/40">
              {performance.source === 'google-psi' ? 'Google PSI' : 'Simulated / Heuristic'}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-3">
        {!isAvailable ? (
          <div className="p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center text-center my-auto py-8">
            <AlertCircle className="size-8 text-muted-foreground/60 mb-2" />
            <h4 className="text-sm font-medium text-foreground">
              Core Web Vitals Unavailable
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {performance?.errorMessage ||
                'PageSpeed Insights data could not be fetched or was omitted. Other AI and classic SEO checks remain complete and unaffected.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {metrics.map((m) => {
              // Status color styling
              const barColor =
                m.status === 'pass'
                  ? 'bg-emerald-500'
                  : m.status === 'warn'
                  ? 'bg-amber-500'
                  : m.status === 'fail'
                  ? 'bg-rose-500'
                  : 'bg-muted-foreground';

              return (
                <div key={m.id} className="space-y-1.5 p-2.5 rounded-lg bg-muted/15 border border-border/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-xs text-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                        {m.abbr}
                      </span>
                      <span className="text-xs font-medium text-foreground/90">
                        {m.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground">
                        {m.formattedValue}
                      </span>
                      <StatusChip status={m.status} label={m.statusText} />
                    </div>
                  </div>

                  {/* Threshold Zones Bar */}
                  <div className="relative pt-1">
                    <div className="w-full h-2 rounded-full bg-muted/50 flex overflow-hidden">
                      {/* Good zone: 0 - 50% */}
                      <div className="h-full w-1/2 bg-emerald-500/20 border-r border-background" />
                      {/* Needs improvement zone: 50% - 75% */}
                      <div className="h-full w-1/4 bg-amber-500/20 border-r border-background" />
                      {/* Poor zone: 75% - 100% */}
                      <div className="h-full w-1/4 bg-rose-500/20" />
                    </div>

                    {/* Metric indicator pin */}
                    {m.value !== null && (
                      <div
                        className="absolute top-0 -ml-1 transition-all duration-300"
                        style={{ left: `${m.percentOfMax}%` }}
                      >
                        <div className={`size-3 rounded-full ${barColor} ring-2 ring-background shadow-sm`} />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-[10px] text-muted-foreground/80 font-mono pt-0.5">
                    <span className="text-emerald-600 dark:text-emerald-400">Good ({m.goodLabel})</span>
                    <span className="text-amber-600 dark:text-amber-400">Needs Imp ({m.needsImpLabel})</span>
                    <span className="text-rose-600 dark:text-rose-400">Poor ({m.poorLabel})</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 text-xs text-muted-foreground flex items-center justify-between pt-2 border-t border-border/40">
          <span className="text-[11px]">
            AI search scrapers prioritize responsive pages that don&apos;t shift layout during parsing.
          </span>
        </div>

        {/* Accessible visually hidden fallback table */}
        <div className="sr-only">
          <table summary="Core Web Vitals metric thresholds and measured values table">
            <caption>Core Web Vitals Thresholds</caption>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">Value</th>
                <th scope="col">Good Threshold</th>
                <th scope="col">Poor Threshold</th>
                <th scope="col">Assessment</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => (
                <tr key={m.id}>
                  <td>{m.name} ({m.abbr})</td>
                  <td>{m.formattedValue}</td>
                  <td>{m.goodLabel}</td>
                  <td>{m.poorLabel}</td>
                  <td>{m.statusText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

