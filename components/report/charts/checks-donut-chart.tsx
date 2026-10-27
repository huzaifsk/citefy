'use client';

import * as React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart as PieIcon } from 'lucide-react';
import { CheckResult } from '@/types/audit';
import { AUDIT_COLORS, StatusChip } from '@/components/ui/audit-chips';

interface ChecksDonutChartProps {
  checks: CheckResult[];
}

export function ChecksDonutChart({ checks }: ChecksDonutChartProps) {
  const passCount = checks.filter((c) => c.status === 'pass').length;
  const warnCount = checks.filter((c) => c.status === 'warn').length;
  const failCount = checks.filter((c) => c.status === 'fail').length;
  const infoCount = checks.filter((c) => c.status === 'info').length;
  const total = checks.length;

  const data = [
    { name: 'Pass', value: passCount, color: AUDIT_COLORS.status.pass.chart, status: 'pass' as const },
    { name: 'Warn', value: warnCount, color: AUDIT_COLORS.status.warn.chart, status: 'warn' as const },
    { name: 'Fail', value: failCount, color: AUDIT_COLORS.status.fail.chart, status: 'fail' as const },
    { name: 'Info', value: infoCount, color: AUDIT_COLORS.status.info.chart, status: 'info' as const },
  ].filter((item) => item.value > 0);

  return (
    <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <PieIcon className="size-4.5 text-primary" />
          Check Results Distribution
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Breakdown of all {total} evaluated checks by pass, warn, fail, and informational status.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <p className="text-xs text-muted-foreground mb-2">
          Out of <strong>{total}</strong> checks evaluated, <strong>{passCount}</strong> passed ({Math.round((passCount / (total || 1)) * 100)}%),{' '}
          <strong>{warnCount}</strong> warned, and <strong>{failCount}</strong> failed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Donut Chart with Center Total */}
          <div className="relative size-48 sm:size-52 shrink-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} checks`, name]}
                  contentStyle={{
                    backgroundColor: 'var(--popover)',
                    borderColor: 'var(--border)',
                    borderRadius: '8px',
                    color: 'var(--popover-foreground)',
                    fontSize: '12px',
                  }}
                />
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius="65%"
                  outerRadius="90%"
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={1}
                  stroke="var(--card)"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Center Callout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold tracking-tight text-foreground font-mono">
                {total}
              </span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                Checks
              </span>
            </div>
          </div>

          {/* Legend Chips List */}
          <div className="flex flex-col gap-2 w-full max-w-xs">
            <div className="flex items-center justify-between text-xs p-1.5 rounded-lg border border-border/40 bg-muted/20">
              <StatusChip status="pass" />
              <span className="font-bold text-foreground font-mono">
                {passCount} ({total > 0 ? Math.round((passCount / total) * 100) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs p-1.5 rounded-lg border border-border/40 bg-muted/20">
              <StatusChip status="warn" />
              <span className="font-bold text-foreground font-mono">
                {warnCount} ({total > 0 ? Math.round((warnCount / total) * 100) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs p-1.5 rounded-lg border border-border/40 bg-muted/20">
              <StatusChip status="fail" />
              <span className="font-bold text-foreground font-mono">
                {failCount} ({total > 0 ? Math.round((failCount / total) * 100) : 0}%)
              </span>
            </div>
            <div className="flex items-center justify-between text-xs p-1.5 rounded-lg border border-border/40 bg-muted/20">
              <StatusChip status="info" />
              <span className="font-bold text-foreground font-mono">
                {infoCount} ({total > 0 ? Math.round((infoCount / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        {/* Visually hidden screen reader data table fallback */}
        <div className="sr-only">
          <table>
            <caption>Check Status Distribution</caption>
            <thead>
              <tr>
                <th scope="col">Status</th>
                <th scope="col">Count</th>
                <th scope="col">Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pass</td>
                <td>{passCount}</td>
                <td>{total > 0 ? Math.round((passCount / total) * 100) : 0}%</td>
              </tr>
              <tr>
                <td>Warn</td>
                <td>{warnCount}</td>
                <td>{total > 0 ? Math.round((warnCount / total) * 100) : 0}%</td>
              </tr>
              <tr>
                <td>Fail</td>
                <td>{failCount}</td>
                <td>{total > 0 ? Math.round((failCount / total) * 100) : 0}%</td>
              </tr>
              <tr>
                <td>Info</td>
                <td>{infoCount}</td>
                <td>{total > 0 ? Math.round((infoCount / total) * 100) : 0}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

