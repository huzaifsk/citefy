import { AuditReport } from '@/types/audit';
import { jsPDF } from 'jspdf';

export async function downloadPdfReport(report: AuditReport): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 18;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = 16;
      drawHeaderBanner();
    }
  }

  function drawHeaderBanner() {
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Citeify AI SEO Readiness Audit  |  ${report.meta.url}`, margin, y - 6);
    doc.setDrawColor(220, 220, 220);
    doc.line(margin, y - 4, pageWidth - margin, y - 4);
  }

  // --- Cover / Header ---
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(margin, y, pageWidth - margin * 2, 28, 'F');

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Citeify AI SEO Audit Report', margin + 6, y + 10);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(
    `Analyzed URL: ${report.meta.url}  |  Generated: ${new Date(report.meta.timestamp).toLocaleDateString()} ${new Date(report.meta.timestamp).toLocaleTimeString()}`,
    margin + 6,
    y + 18
  );
  doc.text(`Tool Version: v${report.meta.toolVersion}  |  HTTP ${report.meta.httpStatus} (${report.meta.timingMs}ms)`, margin + 6, y + 23);

  y += 36;

  // --- Score Summary Cards ---
  const boxWidth = (pageWidth - margin * 2 - 8) / 3;

  // Overall Score Box
  doc.setFillColor(241, 245, 249); // slate-100
  doc.roundedRect(margin, y, boxWidth, 26, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('OVERALL SCORE', margin + 6, y + 7);
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(`${report.scores.overall}/100`, margin + 6, y + 17);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Grade: ${report.scores.grade}`, margin + 6, y + 22);

  // AI SEO Score Box
  const xAi = margin + boxWidth + 4;
  doc.setFillColor(238, 242, 255); // indigo-50
  doc.roundedRect(xAi, y, boxWidth, 26, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.text('AI SEO READINESS', xAi + 6, y + 7);
  doc.setFontSize(18);
  doc.setTextColor(49, 46, 129);
  doc.text(`${report.scores.ai}/100`, xAi + 6, y + 17);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Weight: 65%', xAi + 6, y + 22);

  // Classic SEO Score Box
  const xClassic = margin + (boxWidth + 4) * 2;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.roundedRect(xClassic, y, boxWidth, 26, 2, 2, 'F');
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61);
  doc.setFont('helvetica', 'bold');
  doc.text('CLASSIC SEO HEALTH', xClassic + 6, y + 7);
  doc.setFontSize(18);
  doc.setTextColor(20, 83, 45);
  doc.text(`${report.scores.classic}/100`, xClassic + 6, y + 17);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Weight: 35%', xClassic + 6, y + 22);

  y += 32;

  // Critical Banner if triggered
  if (report.scores.criticalOverride) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 12, 1, 1, 'FD');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(185, 28, 28);
    doc.text(`CRITICAL WARNING: ${report.scores.overrideReason || 'Key search crawlers blocked.'}`, margin + 4, y + 7);
    y += 16;
  }

  // --- Executive Summary ---
  checkPageBreak(25);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('1. Executive Summary', margin, y);
  y += 6;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);

  const summaryText =
    report.llmInsights?.summary ||
    `This site achieves an overall AI SEO readiness grade of ${report.scores.grade} (${report.scores.overall}/100). The AI crawler and answer readiness score is ${report.scores.ai}/100, while Classic SEO health scored ${report.scores.classic}/100. Key areas for optimization are detailed below in order of impact.`;

  const splitSummary = doc.splitTextToSize(summaryText, pageWidth - margin * 2);
  doc.text(splitSummary, margin, y);
  y += splitSummary.length * 4.5 + 4;

  // --- Priority Fixes ---
  checkPageBreak(30);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('2. Top Priority Fixes', margin, y);
  y += 6;

  const topFixes = report.priorities.slice(0, 4);
  for (const fix of topFixes) {
    checkPageBreak(22);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 18, 1, 1, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    const isFail = fix.status === 'fail';
    doc.setTextColor(isFail ? 185 : 180, isFail ? 28 : 83, isFail ? 28 : 9);
    doc.text(`[${fix.id}] ${fix.title}`, margin + 4, y + 5);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Severity: ${fix.severity}  |  Effort: ${fix.effort}  |  Status: ${fix.status.toUpperCase()}`, margin + 4, y + 9.5);

    doc.setTextColor(51, 65, 85);
    const recShort = doc.splitTextToSize(fix.recommendation, pageWidth - margin * 2 - 8);
    doc.text(recShort.slice(0, 1), margin + 4, y + 14);

    y += 21;
  }

  // --- AI Crawler Access Matrix ---
  checkPageBreak(40);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('3. AI Crawler Access Matrix', margin, y);
  y += 6;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Crawler', margin + 3, y + 5);
  doc.text('Owner / Engine', margin + 35, y + 5);
  doc.text('Bot Type', margin + 95, y + 5);
  doc.text('robots.txt', margin + 125, y + 5);
  doc.text('Status', margin + 155, y + 5);
  y += 8;

  for (const bot of report.crawlerMatrix.slice(0, 10)) {
    checkPageBreak(6.5);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(30, 41, 59);

    doc.text(bot.name, margin + 3, y + 4);
    doc.text(bot.owner.slice(0, 28), margin + 35, y + 4);
    doc.text(bot.botType, margin + 95, y + 4);
    doc.text(bot.robotsStatus, margin + 125, y + 4);

    if (bot.isBlocked) {
      doc.setTextColor(220, 38, 38);
      doc.text('BLOCKED', margin + 155, y + 4);
    } else {
      doc.setTextColor(22, 101, 52);
      doc.text('ALLOWED', margin + 155, y + 4);
    }

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + 6, pageWidth - margin, y + 6);
    y += 6.5;
  }

  // --- Footer / Disclaimer ---
  checkPageBreak(25);
  y += 6;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text('Methodology & Framing Note:', margin, y);
  y += 4.5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  const disclaimer =
    'This audit speaks strictly of readiness and best practice, never guaranteed rankings or citations. AI answer engines use private, evolving retrieval algorithms. Analysis evaluated raw server HTML without JavaScript execution, matching standard crawler behavior.';
  const splitDisc = doc.splitTextToSize(disclaimer, pageWidth - margin * 2);
  doc.text(splitDisc, margin, y);

  const domain = new URL(report.meta.url).hostname.replace(/[^a-z0-9]/gi, '-');
  doc.save(`citeify-report-${domain}.pdf`);
}

