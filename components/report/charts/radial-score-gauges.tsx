'use client';

import * as React from 'react';
import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Gauge, Bot, Search } from 'lucide-react';
import { AuditScores, GradeLevel } from '@/types/audit';
import { AUDIT_COLORS, GradeChip } from '@/components/ui/audit-chips';
import { getGradeFromScore } from '@/lib/scoring/engine';

interface RadialScoreGaugesProps {
  scores: AuditScores;
}

function getGradeColor(grade: GradeLevel): string {
  return AUDIT_COLORS.grade[grade]?.chart || '#10b981';
}

function GaugeItem({
  score,
  label,
  sublabel,
  grade,
  icon: Icon,
}: {
  score: number;
  label: string;
  sublabel: string;
  grade: GradeLevel;
  icon: React.ElementType;
}) {
  const chartColor = getGradeColor(grade);
  const data = [{ name: label, value: Math.min(100, Math.max(0, score)), fill: chartColor }];

  return (
    <div className="flex flex-col items-center justify-center p-3 text-center gap-2">
      <div className="relative size-36 sm:size-40 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="72%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'var(--muted)' }}
              dataKey="value"
              cornerRadius={8}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {score}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase font-semibold">
            / 100
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Icon className="size-3.5 text-muted-foreground" />
          <span>{label}</span>
        </div>
        <span className="text-[11px] text-muted-foreground">{sublabel}</span>
        <GradeChip grade={grade} className="mt-1" />
      </div>
    </div>
  );
}

export function RadialScoreGauges({ scores }: RadialScoreGaugesProps) {
  const overallGrade = scores.grade;
  const aiGrade = scores.aiGrade ?? getGradeFromScore(scores.ai);
  const classicGrade = scores.classicGrade ?? getGradeFromScore(scores.classic);

  return (
    <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Gauge className="size-4.5 text-primary" />
          Readiness & Health Score Gauges
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Calibrated 0 to 100 radial dials evaluated against search and answer engine best practices.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Short text summary for accessibility */}
        <p className="text-xs text-muted-foreground mb-4">
          Overall score is <strong>{scores.overall}/100</strong> ({overallGrade}), composed of AI SEO at{' '}
          <strong>{scores.ai}/100</strong> ({aiGrade}) and Classic SEO at{' '}
          <strong>{scores.classic}/100</strong> ({classicGrade}).
        </p>

        {/* Responsive Gauges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/60">
          <GaugeItem
            score={scores.overall}
            label="Overall Score"
            sublabel="65% AI + 35% Classic"
            grade={overallGrade}
            icon={Gauge}
          />
          <GaugeItem
            score={scores.ai}
            label="AI SEO Readiness"
            sublabel="Primary Focus (65%)"
            grade={aiGrade}
            icon={Bot}
          />
          <GaugeItem
            score={scores.classic}
            label="Classic SEO Health"
            sublabel="Secondary Focus (35%)"
            grade={classicGrade}
            icon={Search}
          />
        </div>

        {/* Visually hidden data table fallback for screen readers (WCAG AA requirement) */}
        <div className="sr-only">
          <table>
            <caption>Score Gauges Summary Table</caption>
            <thead>
              <tr>
                <th scope="col">Metric</th>
                <th scope="col">Weight</th>
                <th scope="col">Score</th>
                <th scope="col">Grade</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Overall Score</td>
                <td>100%</td>
                <td>{scores.overall} / 100</td>
                <td>{overallGrade}</td>
              </tr>
              <tr>
                <td>AI SEO Readiness</td>
                <td>65%</td>
                <td>{scores.ai} / 100</td>
                <td>{aiGrade}</td>
              </tr>
              <tr>
                <td>Classic SEO Health</td>
                <td>35%</td>
                <td>{scores.classic} / 100</td>
                <td>{classicGrade}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

