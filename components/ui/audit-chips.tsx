'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  AlertCircle,
  Zap,
  Wrench,
  ShieldAlert,
  Sparkles,
  Check,
  Bot,
  Search,
} from 'lucide-react';
import {
  AuditSection,
  CheckSeverity,
  CheckStatus,
  EffortLevel,
  GradeLevel,
} from '@/types/audit';

// Shared status colors matching WCAG AA tokens
export const AUDIT_COLORS = {
  status: {
    pass: {
      lightBg: '#DCFCE7',
      lightText: '#166534',
      darkBg: '#052E16',
      darkText: '#86EFAC',
      chart: '#16a34a',
    },
    warn: {
      lightBg: '#FEF3C7',
      lightText: '#92400E',
      darkBg: '#451A03',
      darkText: '#FCD34D',
      chart: '#d97706',
    },
    fail: {
      lightBg: '#FEE2E2',
      lightText: '#991B1B',
      darkBg: '#450A0A',
      darkText: '#FCA5A5',
      chart: '#dc2626',
    },
    info: {
      lightBg: '#E0F2FE',
      lightText: '#075985',
      darkBg: '#082F49',
      darkText: '#7DD3FC',
      chart: '#0284c7',
    },
  },
  severity: {
    H: {
      lightBg: '#FFE4E6',
      lightText: '#9F1239',
      darkBg: '#4C0519',
      darkText: '#FDA4AF',
    },
    M: {
      lightBg: '#FFEDD5',
      lightText: '#9A3412',
      darkBg: '#431407',
      darkText: '#FDBA74',
    },
    L: {
      lightBg: '#F1F5F9',
      lightText: '#334155',
      darkBg: '#1E293B',
      darkText: '#CBD5E1',
    },
  },
  effort: {
    quickWin: {
      lightBg: '#CCFBF1',
      lightText: '#115E59',
      darkBg: '#042F2E',
      darkText: '#5EEAD4',
    },
    moderate: {
      lightBg: '#E0E7FF',
      lightText: '#3730A3',
      darkBg: '#1E1B4B',
      darkText: '#A5B4FC',
    },
    heavy: {
      lightBg: '#F3E8FF',
      lightText: '#6B21A8',
      darkBg: '#3B0764',
      darkText: '#D8B4FE',
    },
  },
  grade: {
    Excellent: {
      lightBg: '#DCFCE7',
      lightText: '#166534',
      darkBg: '#052E16',
      darkText: '#86EFAC',
      chart: '#10b981',
    },
    Good: {
      lightBg: '#ECFCCB',
      lightText: '#3F6212',
      darkBg: '#1A2E05',
      darkText: '#BEF264',
      chart: '#84cc16',
    },
    'Needs work': {
      lightBg: '#FEF3C7',
      lightText: '#92400E',
      darkBg: '#451A03',
      darkText: '#FCD34D',
      chart: '#f59e0b',
    },
    Poor: {
      lightBg: '#FEE2E2',
      lightText: '#991B1B',
      darkBg: '#450A0A',
      darkText: '#FCA5A5',
      chart: '#ef4444',
    },
  },
  category: {
    ai: {
      lightBg: '#EDE9FE',
      lightText: '#5B21B6',
      darkBg: '#2E1065',
      darkText: '#DDD6FE',
      chart: '#8b5cf6',
    },
    classic: {
      lightBg: '#DBEAFE',
      lightText: '#1E40AF',
      darkBg: '#172554',
      darkText: '#BFDBFE',
      chart: '#3b82f6',
    },
  },
};

/**
 * 1. StatusChip: Pass, Warn, Fail, Info
 */
export function StatusChip({
  status,
  label,
  className,
}: {
  status: CheckStatus;
  label?: string;
  className?: string;
}) {
  switch (status) {
    case 'pass':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#DCFCE7] text-[#166534] dark:bg-[#052E16] dark:text-[#86EFAC] font-semibold text-[11px] gap-1 px-2 py-0.5 inline-flex items-center',
            className
          )}
        >
          <CheckCircle2 className="size-3.5 shrink-0" />
          <span>{label || 'PASS'}</span>
        </Badge>
      );
    case 'warn':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#FEF3C7] text-[#92400E] dark:bg-[#451A03] dark:text-[#FCD34D] font-semibold text-[11px] gap-1 px-2 py-0.5 inline-flex items-center',
            className
          )}
        >
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>{label || 'WARN'}</span>
        </Badge>
      );
    case 'fail':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#FEE2E2] text-[#991B1B] dark:bg-[#450A0A] dark:text-[#FCA5A5] font-semibold text-[11px] gap-1 px-2 py-0.5 inline-flex items-center',
            className
          )}
        >
          <XCircle className="size-3.5 shrink-0" />
          <span>{label || 'FAIL'}</span>
        </Badge>
      );
    case 'info':
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#E0F2FE] text-[#075985] dark:bg-[#082F49] dark:text-[#7DD3FC] font-semibold text-[11px] gap-1 px-2 py-0.5 inline-flex items-center',
            className
          )}
        >
          <Info className="size-3.5 shrink-0" />
          <span>{label || 'INFO'}</span>
        </Badge>
      );
  }
}

/**
 * 2. SeverityChip: High, Medium, Low
 */
export function SeverityChip({
  severity,
  className,
}: {
  severity: CheckSeverity;
  className?: string;
}) {
  switch (severity) {
    case 'H':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#FFE4E6] text-[#9F1239] dark:bg-[#4C0519] dark:text-[#FDA4AF] font-medium text-[10px] gap-1 px-1.5 py-0 inline-flex items-center',
            className
          )}
        >
          <AlertCircle className="size-3 shrink-0" />
          <span>High Severity</span>
        </Badge>
      );
    case 'M':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#FFEDD5] text-[#9A3412] dark:bg-[#431407] dark:text-[#FDBA74] font-medium text-[10px] gap-1 px-1.5 py-0 inline-flex items-center',
            className
          )}
        >
          <AlertTriangle className="size-3 shrink-0" />
          <span>Med Severity</span>
        </Badge>
      );
    case 'L':
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#F1F5F9] text-[#334155] dark:bg-[#1E293B] dark:text-[#CBD5E1] font-medium text-[10px] gap-1 px-1.5 py-0 inline-flex items-center',
            className
          )}
        >
          <Info className="size-3 shrink-0" />
          <span>Low Severity</span>
        </Badge>
      );
  }
}

/**
 * 3. EffortChip: Quick win, Moderate, Heavy
 */
export function EffortChip({
  effort,
  className,
}: {
  effort: EffortLevel;
  className?: string;
}) {
  switch (effort) {
    case 'Quick win':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#CCFBF1] text-[#115E59] dark:bg-[#042F2E] dark:text-[#5EEAD4] font-medium text-[10px] gap-1 px-1.5 py-0 inline-flex items-center',
            className
          )}
        >
          <Zap className="size-3 shrink-0" />
          <span>Quick Win</span>
        </Badge>
      );
    case 'Moderate':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#E0E7FF] text-[#3730A3] dark:bg-[#1E1B4B] dark:text-[#A5B4FC] font-medium text-[10px] gap-1 px-1.5 py-0 inline-flex items-center',
            className
          )}
        >
          <Wrench className="size-3 shrink-0" />
          <span>Moderate Effort</span>
        </Badge>
      );
    case 'Heavy':
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#F3E8FF] text-[#6B21A8] dark:bg-[#3B0764] dark:text-[#D8B4FE] font-medium text-[10px] gap-1 px-1.5 py-0 inline-flex items-center',
            className
          )}
        >
          <ShieldAlert className="size-3 shrink-0" />
          <span>Heavy Lift</span>
        </Badge>
      );
  }
}

/**
 * 4. GradeChip: Excellent, Good, Needs work, Poor
 */
export function GradeChip({
  grade,
  score,
  className,
}: {
  grade: GradeLevel;
  score?: number;
  className?: string;
}) {
  switch (grade) {
    case 'Excellent':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#DCFCE7] text-[#166534] dark:bg-[#052E16] dark:text-[#86EFAC] font-bold text-xs gap-1.5 px-2.5 py-0.5 inline-flex items-center uppercase tracking-wide',
            className
          )}
        >
          <Sparkles className="size-3.5 shrink-0" />
          <span>Excellent{score != null ? ` (${score})` : ''}</span>
        </Badge>
      );
    case 'Good':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#ECFCCB] text-[#3F6212] dark:bg-[#1A2E05] dark:text-[#BEF264] font-bold text-xs gap-1.5 px-2.5 py-0.5 inline-flex items-center uppercase tracking-wide',
            className
          )}
        >
          <Check className="size-3.5 shrink-0" />
          <span>Good{score != null ? ` (${score})` : ''}</span>
        </Badge>
      );
    case 'Needs work':
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#FEF3C7] text-[#92400E] dark:bg-[#451A03] dark:text-[#FCD34D] font-bold text-xs gap-1.5 px-2.5 py-0.5 inline-flex items-center uppercase tracking-wide',
            className
          )}
        >
          <AlertTriangle className="size-3.5 shrink-0" />
          <span>Needs Work{score != null ? ` (${score})` : ''}</span>
        </Badge>
      );
    case 'Poor':
    default:
      return (
        <Badge
          variant="outline"
          className={cn(
            'border-transparent bg-[#FEE2E2] text-[#991B1B] dark:bg-[#450A0A] dark:text-[#FCA5A5] font-bold text-xs gap-1.5 px-2.5 py-0.5 inline-flex items-center uppercase tracking-wide',
            className
          )}
        >
          <XCircle className="size-3.5 shrink-0" />
          <span>Poor{score != null ? ` (${score})` : ''}</span>
        </Badge>
      );
  }
}

/**
 * 5. CategoryChip: AI SEO (Violet), Classic SEO (Blue)
 */
export function CategoryChip({
  section,
  label,
  className,
}: {
  section: AuditSection;
  label?: string;
  className?: string;
}) {
  if (section === 'ai') {
    return (
      <Badge
        variant="outline"
        className={cn(
          'border-transparent bg-[#EDE9FE] text-[#5B21B6] dark:bg-[#2E1065] dark:text-[#DDD6FE] font-semibold text-[11px] gap-1 px-2 py-0.5 inline-flex items-center',
          className
        )}
      >
        <Bot className="size-3.5 shrink-0" />
        <span>{label || 'AI SEO'}</span>
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent bg-[#DBEAFE] text-[#1E40AF] dark:bg-[#172554] dark:text-[#BFDBFE] font-semibold text-[11px] gap-1 px-2 py-0.5 inline-flex items-center',
        className
      )}
    >
      <Search className="size-3.5 shrink-0" />
      <span>{label || 'Classic SEO'}</span>
    </Badge>
  );
}
