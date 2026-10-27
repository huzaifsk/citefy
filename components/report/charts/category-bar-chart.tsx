'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart3, Bot, Search } from 'lucide-react';
import { CategoryId, CategoryScore } from '@/types/audit';
import { AUDIT_COLORS, CategoryChip } from '@/components/ui/audit-chips';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface CategoryBarChartProps {
  categories: Record<CategoryId, CategoryScore>;
}

interface BarDataPoint {
  id: CategoryId;
  name: string;
  score: number;
  weight: number;
  isExcluded: boolean;
  color: string;
}

function getBarColor(score: number): string {
  if (score >= 90) return AUDIT_COLORS.grade.Excellent.chart;
  if (score >= 75) return AUDIT_COLORS.grade.Good.chart;
  if (score >= 50) return AUDIT_COLORS.grade['Needs work'].chart;
  return AUDIT_COLORS.grade.Poor.chart;
}

function SingleSectionBarChart({
  title,
  data,
  section,
}: {
  title: string;
  data: BarDataPoint[];
  section: 'ai' | 'classic';
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          {section === 'ai' ? <Bot className="size-3.5 text-violet-500" /> : <Search className="size-3.5 text-blue-500" />}
          {title}
        </h4>
        <CategoryChip section={section} />
      </div>

      <div className="w-full h-64 min-w-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 10, right: 35, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              dataKey="name"
              type="category"
              width={110}
              tick={{ fontSize: 11, fill: 'var(--foreground)' }}
              axisLine={{ stroke: 'var(--border)' }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value: any) => [`${value}/100`, 'Score']}
              contentStyle={{
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--popover-foreground)',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={18}>
              {data.map((entry) => (
                <Cell key={entry.id} fill={entry.color} />
              ))}
              <LabelList
                dataKey="score"
                position="right"
                style={{ fontSize: 10, fill: 'var(--foreground)', fontWeight: 600 }}
                formatter={(val: any) => `${val}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Screen Reader Table */}
      <div className="sr-only">
        <table>
          <caption>{title} Category Scores</caption>
          <thead>
            <tr>
              <th scope="col">Category</th>
              <th scope="col">Weight</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>{d.weight}%</td>
                <td>{d.score} / 100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CategoryBarChart({ categories }: CategoryBarChartProps) {
  // 1. Process AI categories sorted high to low
  const aiCats: CategoryId[] = ['A', 'B', 'C', 'D', 'E', 'Freshness'];
  const aiData: BarDataPoint[] = aiCats
    .map((id) => {
      const c = categories[id];
      const score = c?.score ?? 0;
      return {
        id,
        name: c?.name || id,
        score,
        weight: c?.weight ?? 0,
        isExcluded: Boolean(c?.isExcluded),
        color: getBarColor(score),
      };
    })
    .sort((a, b) => b.score - a.score);

  // 2. Process Classic categories sorted high to low
  const classicCats: CategoryId[] = ['F', 'G', 'H', 'LinksImages', 'I'];
  const classicData: BarDataPoint[] = classicCats
    .map((id) => {
      const c = categories[id];
      const score = c?.score ?? 0;
      return {
        id,
        name: c?.name || id,
        score,
        weight: c?.weight ?? 0,
        isExcluded: Boolean(c?.isExcluded),
        color: getBarColor(score),
      };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <BarChart3 className="size-4.5 text-primary" />
          Category Performance Breakdown
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Horizontal scores scaled 0 to 100, sorted descending from highest performing to lowest.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <p className="text-xs text-muted-foreground mb-4">
          Visual comparison of individual check categories across both AI and Classic SEO dimensions.
        </p>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid grid-cols-2 max-w-xs mb-4">
            <TabsTrigger value="ai" className="text-xs gap-1.5 font-semibold">
              <Bot className="size-3.5" />
              AI SEO Categories
            </TabsTrigger>
            <TabsTrigger value="classic" className="text-xs gap-1.5 font-semibold">
              <Search className="size-3.5" />
              Classic Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="m-0 focus-visible:outline-none">
            <SingleSectionBarChart
              title="AI SEO Category Rankings"
              data={aiData}
              section="ai"
            />
          </TabsContent>

          <TabsContent value="classic" className="m-0 focus-visible:outline-none">
            <SingleSectionBarChart
              title="Classic SEO Category Rankings"
              data={classicData}
              section="classic"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

