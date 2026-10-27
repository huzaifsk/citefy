'use client';

import * as React from 'react';
import { CrawlerMatrixItem } from '@/types/audit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Bot } from 'lucide-react';

interface CrawlerMatrixProps {
  matrix: CrawlerMatrixItem[];
}

export function CrawlerMatrix({ matrix }: CrawlerMatrixProps) {
  return (
    <Card className="border-border/80 shadow-xs bg-card/70 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              AI Crawler Access Matrix
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Cross-referencing robots.txt rules against live simulated HTTP user-agent probes
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="size-3.5" /> Allowed
            </span>
            <span className="flex items-center gap-1 text-destructive font-medium">
              <ShieldAlert className="size-3.5" /> Blocked
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="rounded-lg border border-border/70 overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-xs font-semibold">Bot / User-Agent</TableHead>
                <TableHead className="text-xs font-semibold">Owner / Engine</TableHead>
                <TableHead className="text-xs font-semibold">Role</TableHead>
                <TableHead className="text-xs font-semibold">robots.txt Rule</TableHead>
                <TableHead className="text-xs font-semibold">Live Probe</TableHead>
                <TableHead className="text-xs font-semibold text-right">Verdict</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.map((bot) => {
                const isSearch = bot.botType === 'search';
                const isDisallowed = bot.robotsStatus === 'disallowed';
                const isBlocked = bot.isBlocked || isDisallowed;

                return (
                  <TableRow key={bot.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-medium text-foreground py-2.5">
                      <div className="flex items-center gap-1.5">
                        <Bot className="size-3.5 text-muted-foreground" />
                        <span>{bot.name}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground py-2.5">
                      {bot.owner}
                    </TableCell>

                    <TableCell className="py-2.5">
                      <Badge
                        variant={isSearch ? 'default' : 'secondary'}
                        className="text-[10px] px-1.5 py-0 font-normal"
                      >
                        {isSearch ? 'Search & Answer' : 'Model Training'}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs font-medium py-2.5">
                      {bot.robotsStatus === 'allowed' && (
                        <span className="text-emerald-600 dark:text-emerald-400">Allowed</span>
                      )}
                      {bot.robotsStatus === 'disallowed' && (
                        <span className="text-destructive font-semibold">Disallowed</span>
                      )}
                      {bot.robotsStatus === 'unspecified' && (
                        <span className="text-muted-foreground">Unspecified (Allowed)</span>
                      )}
                    </TableCell>

                    <TableCell className="text-xs py-2.5 font-mono">
                      {typeof bot.liveFetchStatus === 'number' ? (
                        <span className={bot.liveFetchStatus === 200 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}>
                          HTTP {bot.liveFetchStatus}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{bot.liveFetchStatus}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-right py-2.5">
                      {isBlocked ? (
                        <Badge variant="destructive" className="text-[10px] gap-1 px-1.5 py-0">
                          <ShieldAlert className="size-3" />
                          Blocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-[10px] gap-1 px-1.5 py-0">
                          <ShieldCheck className="size-3" />
                          Allowed
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

