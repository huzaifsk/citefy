'use client';

import * as React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Radar as RadarIcon, Info } from 'lucide-react';
import { CategoryId, CategoryScore } from '@/types/audit';
import { CategoryChip } from '@/components/ui/audit-chips';

interface AIRadarChartProps {
  categories: Record<CategoryId, CategoryScore>;
}

interface RadarDataPoint {
  category: string;
  shortName: string;
  score: number;
  weight: number;
  fullMark: 100;
}

export function AIRadarChart({ categories }: AIRadarChartProps) {
  // The five core AI SEO categories specified
  const aiCategoryDefs: Array<{ id: CategoryId; name: string; short: string }> = [
    { id: 'A', name: 'Crawler Access', short: 'Crawlers' },
    { id: 'B', name: 'Renderability', short: 'Render' },
    { id: 'C', name: 'Structured Data', short: 'Schema' },
    { id: 'D', name: 'Answer-Ready Content', short: 'Content' },
    { id: 'E', name: 'Entity & Trust', short: 'Entity' },
  ];

  const data: RadarDataPoint[] = aiCategoryDefs.map((def) => {
    const cat = categories[def.id];
    const score = cat && typeof cat.score === 'number' && !isNaN(cat.score) ? cat.score : 0;
    const weight = cat?.weight ?? 20;
    return {
      category: def.name,
      shortName: def.short,
      score,
      weight,
      fullMark: 100,
    };
  });

  const averageAiScore =
    data.length > 0
      ? Math.round(data.reduce((acc, curr) => acc + curr.score, 0) / data.length)
      : 0;

  return (
    <Card className="flex flex-col h-full bg-card/60 backdrop-blur-sm border-border/60">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center">
              <RadarIcon className="size-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold tracking-tight">
                AI SEO Balance Radar
              </CardTitle>
              <CardDescription className="text-xs">
                Shape analysis across the 5 core AI readiness vectors
              </CardDescription>
            </div>
          </div>
          <CategoryChip section="ai" label="AI Vectors" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between pt-2">
        <div className="w-full h-64 min-w-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="currentColor" className="text-muted/40" />
              <PolarAngleAxis
                dataKey="shortName"
                stroke="currentColor"
                className="text-muted-foreground text-[11px] font-medium"
                tick={{ fill: 'currentColor', fontSize: 11 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                stroke="currentColor"
                className="text-muted-foreground/50 text-[9px]"
                tick={{ fill: 'currentColor', fontSize: 9 }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as RadarDataPoint;
                    return (
                      <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-md text-popover-foreground">
                        <p className="font-semibold">{item.category}</p>
                        <p className="text-muted-foreground mt-0.5">
                          Score: <span className="font-mono font-medium text-foreground">{item.score}/100</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Weight: {item.weight}% of AI SEO
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Radar
                name="AI Readiness"
                dataKey="score"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.35}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-2 text-xs text-muted-foreground flex items-start gap-1.5 pt-2 border-t border-border/40">
          <Info className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <span>
            Balanced radar profiles ensure LLM crawlers can retrieve, render, and extract factual answers without bottlenecking.
          </span>
        </div>

        {/* Accessible visually-hidden data table */}
        <div className="sr-only">
          <table summary="AI SEO 5-category radar chart data table showing category scores out of 100">
            caption AI SEO Vector Scores
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Weight</th>
                <th scope="col">Score (0-100)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.category}>
                  <td>{d.category}</td>
                  <td>{d.weight}%</td>
                  <td>{d.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

