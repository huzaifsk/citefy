'use client';

import * as React from 'react';
import { AuditReport, AuditSection } from '@/types/audit';
import { ScoreSummary } from './score-summary';
import { ExecutiveSummary } from './executive-summary';
import { PriorityFixes } from './priority-fixes';
import { CrawlerMatrix } from './crawler-matrix';
import { StructuredDataCard } from './structured-data-card';
import { ChecksAccordion } from './checks-accordion';
import { MethodologyCard } from './methodology-card';
import { CategoryBarChart } from './charts/category-bar-chart';
import { ChecksDonutChart } from './charts/checks-donut-chart';
import { AIRadarChart } from './charts/ai-radar-chart';
import { CoreWebVitalsChart } from './charts/core-web-vitals-chart';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Download,
  FileText,
  FileCode,
  FileJson,
  RotateCcw,
  Clock,
  Globe,
  BarChart3,
} from 'lucide-react';
import { downloadJsonReport } from '@/lib/export/json';
import { generateMarkdownReport } from '@/lib/export/markdown';
import { downloadPdfReport } from '@/lib/export/pdf';
import { toast } from 'sonner';

interface ReportViewProps {
  report: AuditReport;
  onReset: () => void;
}

export function ReportView({ report, onReset }: ReportViewProps) {
  const [activeSection, setActiveSection] = React.useState<AuditSection>('ai');
  const [isExportingPdf, setIsExportingPdf] = React.useState(false);

  const handleDownloadMarkdown = () => {
    try {
      const md = generateMarkdownReport(report);
      const blob = new Blob([md], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const domain = new URL(report.meta.url).hostname.replace(/[^a-z0-9]/gi, '-');
      a.href = url;
      a.download = `citeify-report-${domain}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Markdown report downloaded');
    } catch {
      toast.error('Failed to export Markdown report');
    }
  };

  const handleDownloadJson = () => {
    try {
      downloadJsonReport(report);
      toast.success('JSON report downloaded');
    } catch {
      toast.error('Failed to export JSON report');
    }
  };

  const handleDownloadPdf = async () => {
    setIsExportingPdf(true);
    toast.loading('Generating branded PDF report...', { id: 'pdf-gen' });
    try {
      await downloadPdfReport(report);
      toast.success('PDF report downloaded', { id: 'pdf-gen' });
    } catch (err: any) {
      toast.error(`PDF export failed: ${err.message}`, { id: 'pdf-gen' });
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-in-scale">
      {/* Sticky Report Header Bar */}
      <div className="sticky top-14 z-30 -mx-4 px-4 py-3 bg-background/95 backdrop-blur border-b border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-col gap-0.5 truncate">
          <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
            <span className="flex items-center gap-1 font-medium text-foreground truncate">
              <Globe className="size-3.5 text-primary shrink-0" />
              <span className="truncate">{report.meta.url}</span>
            </span>
            {report.meta.redirectChain.length > 1 && (
              <span className="text-[11px] text-muted-foreground hidden md:inline">
                (redirected to {new URL(report.meta.finalUrl).pathname})
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {new Date(report.meta.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>v{report.meta.toolVersion}</span>
            <span>{Math.round(report.meta.contentLength / 1024)} KB</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="text-xs h-8 gap-1.5 active:scale-[0.98] transition-transform duration-150 ease-out"
          >
            <RotateCcw data-icon="inline-start" className="size-3.5" />
            Analyze Another
          </Button>

          {/* Download Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  size="sm"
                  disabled={isExportingPdf}
                  className="text-xs h-8 gap-1.5 active:scale-[0.98] transition-transform duration-150 ease-out font-medium"
                >
                  <Download data-icon="inline-start" className="size-3.5" />
                  Download Report
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleDownloadPdf} className="text-xs cursor-pointer gap-2">
                  <FileText className="size-4 text-rose-500" />
                  <span>Download as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadMarkdown} className="text-xs cursor-pointer gap-2">
                  <FileCode className="size-4 text-blue-500" />
                  <span>Download Markdown</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadJson} className="text-xs cursor-pointer gap-2">
                  <FileJson className="size-4 text-amber-500" />
                  <span>Download JSON</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 1. Score Summary & 3 Radial Gauges */}
      <ScoreSummary scores={report.scores} />

      {/* 2. Visual Analytics Section (Charts 2, 3, 4, 5) */}
      <section aria-labelledby="analytics-section-title" className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <h3 id="analytics-section-title" className="text-sm font-semibold tracking-tight text-foreground">
            Audit Analytics & Diagnostic Charts
          </h3>
        </div>

        {/* Chart Row 1: AI Radar Chart (5 categories) + Checks Donut Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AIRadarChart categories={report.scores.categories} />
          <ChecksDonutChart checks={report.checks} />
        </div>

        {/* Chart Row 2: Category Score Horizontal Bars + Core Web Vitals Bars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryBarChart categories={report.scores.categories} />
          <CoreWebVitalsChart performance={report.performance} />
        </div>
      </section>

      {/* 3. Executive Synthesis */}
      <ExecutiveSummary insights={report.llmInsights} />

      {/* 4. Top Priority Fixes */}
      <PriorityFixes fixes={report.priorities} />

      {/* 5. Filterable Checks Accordion (AI SEO & Classic SEO) */}
      <ChecksAccordion
        checks={report.checks}
        categories={report.scores.categories}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* 6. AI Crawler Access Matrix */}
      <CrawlerMatrix matrix={report.crawlerMatrix} />

      {/* 7. Structured Data Viewer */}
      <StructuredDataCard structuredData={report.structuredData} />

      {/* 8. Methodology & Boundaries Note */}
      <MethodologyCard />
    </div>
  );
}
