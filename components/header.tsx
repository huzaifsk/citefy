'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bot, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/theme-toggle';
import { MethodologyDialog } from '@/components/methodology-dialog';

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90 active:scale-[0.98]"
        >
          <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-xs">
            <Bot className="size-4.5" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold tracking-tight text-lg text-foreground">Citeify</span>
            <Badge variant="secondary" className="text-[10px] h-4.5 px-1.5 font-medium">
              AI SEO
            </Badge>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <MethodologyDialog />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

