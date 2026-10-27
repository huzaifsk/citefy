import { AuditReport } from '@/types/audit';

export function downloadJsonReport(report: AuditReport): void {
  const jsonStr = JSON.stringify(report, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  const domain = new URL(report.meta.url).hostname.replace(/[^a-z0-9]/gi, '-');
  a.href = url;
  a.download = `citeify-audit-${domain}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

