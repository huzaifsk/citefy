declare module "robots-parser" {
  interface Robot {
    isAllowed(url: string, userAgent?: string): boolean | undefined;
    isDisallowed(url: string, userAgent?: string): boolean | undefined;
    getMatchingLineNumber(url: string, userAgent?: string): number | undefined;
    getCrawlDelay(userAgent?: string): number | undefined;
    getSitemaps(): string[];
    getPreferredHost(): string | null;
  }
  export default function robotsParser(url: string, robotsTxt: string): Robot;
}

declare module "html2canvas" {
  const html2canvas: (element: HTMLElement, options?: any) => Promise<HTMLCanvasElement>;
  export default html2canvas;
}

