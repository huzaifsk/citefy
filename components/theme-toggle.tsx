'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Toggle theme"
        className="size-8 rounded-lg active:scale-[0.98] transition-transform duration-150 ease-out"
      >
        <span className="size-4" />
      </Button>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="size-8 rounded-lg active:scale-[0.98] transition-transform duration-150 ease-out"
    >
      {isDark ? (
        <Sun className="size-4 text-amber-400 transition-transform duration-200" />
      ) : (
        <Moon className="size-4 text-slate-700 transition-transform duration-200" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

