import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { safeFetch } from '@/lib/fetcher/safe-fetch';
import { evaluateCrawlerAccess } from '@/lib/checks/crawler-access';
import { XMLParser } from 'fast-xml-parser';
import { SiteAnalyzeResponse } from '@/types/audit';

const requestSchema = z.object({
  url: z.string().min(3).max(2048),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = requestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { code: 'INVALID_URL', message: 'Valid URL is required.' },
        { status: 400 }
      );
    }

    const { url } = parsed.data;
    let origin: string;
    try {
      origin = new URL(url).origin;
    } catch {
      return NextResponse.json({ code: 'INVALID_URL', message: 'Cannot parse origin.' }, { status: 400 });
    }

    // 1. Fetch robots.txt
    const robotsUrl = `${origin}/robots.txt`;
    const robotsRes = await safeFetch(robotsUrl, { timeoutMs: 5000 });
    const robotsFound = robotsRes.ok && robotsRes.status === 200;
    const robotsTxtBody = robotsFound ? robotsRes.body : '';

    // Extract sitemap URL from robots.txt or default to /sitemap.xml
    let sitemapUrl = `${origin}/sitemap.xml`;
    if (robotsFound && robotsTxtBody) {
      const match = robotsTxtBody.match(/^sitemap:\s*(https?:\/\/[^\s]+)/im);
      if (match && match[1]) {
        sitemapUrl = match[1].trim();
      }
    }

    // 2. Fetch & Parse Sitemap XML
    let sitemapFound = false;
    let sitemapLastmodCount = 0;
    try {
      const sitemapRes = await safeFetch(sitemapUrl, { timeoutMs: 5000 });
      if (sitemapRes.ok && sitemapRes.status === 200 && sitemapRes.body) {
        sitemapFound = true;
        const xmlParser = new XMLParser({ ignoreAttributes: false });
        const xmlObj = xmlParser.parse(sitemapRes.body);

        // Check <urlset> or <sitemapindex>
        const urlset = xmlObj.urlset?.url || xmlObj.sitemapindex?.sitemap;
        if (Array.isArray(urlset)) {
          sitemapLastmodCount = urlset.filter((item: any) => Boolean(item.lastmod)).length;
        } else if (urlset && typeof urlset === 'object') {
          sitemapLastmodCount = urlset.lastmod ? 1 : 0;
        }
      }
    } catch {
      // Non-fatal sitemap parsing failure
    }

    // 3. Fetch & Parse /llms.txt
    const llmsTxtUrl = `${origin}/llms.txt`;
    let llmsTxtFound = false;
    let llmsTxtValid = false;
    try {
      const llmsRes = await safeFetch(llmsTxtUrl, { timeoutMs: 4000 });
      if (llmsRes.ok && llmsRes.status === 200 && llmsRes.body.trim().length > 0) {
        llmsTxtFound = true;
        // Check for standard markdown H1 title and links
        const hasH1 = /^#\s+.+/m.test(llmsRes.body);
        const hasLinks = /\[.+\]\(.+\)/.test(llmsRes.body);
        llmsTxtValid = hasH1 && hasLinks;
      }
    } catch {
      // Non-fatal llms.txt fetch failure
    }

    // 4. Run Crawler Access & Bot Matrix Evaluation
    const { checks, matrix } = await evaluateCrawlerAccess({
      targetUrl: url,
      robotsTxtBody,
      robotsHttpFound: robotsFound,
      robotsUrl,
      sitemapFound,
      sitemapUrl,
      sitemapLastmodCount,
      llmsTxtFound,
      llmsTxtValid,
      llmsTxtUrl,
    });

    const responsePayload: SiteAnalyzeResponse = {
      robotsFound,
      robotsUrl,
      sitemapFound,
      sitemapUrl: sitemapFound ? sitemapUrl : undefined,
      sitemapLastmodCount,
      llmsTxtFound,
      llmsTxtUrl: llmsTxtFound ? llmsTxtUrl : undefined,
      llmsTxtValid,
      checks,
      crawlerMatrix: matrix,
    };

    return NextResponse.json(responsePayload);
  } catch (err: any) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err.message || 'Error occurred during site files analysis.' },
      { status: 500 }
    );
  }
}

