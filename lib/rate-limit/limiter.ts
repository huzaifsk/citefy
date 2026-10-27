interface RateLimitRecord {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 60 * 1000; // 1 hour window
const MAX_REQUESTS_PER_WINDOW = 10; // Generous default for dev / testing, PRD mentions 5-10

/**
 * Clean up stale entries every 15 minutes
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of memoryStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
      if (record.timestamps.length === 0) {
        memoryStore.delete(ip);
      }
    }
  }, 15 * 60 * 1000).unref?.();
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  error?: string;
}

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const safeIp = ip || '127.0.0.1';

  let record = memoryStore.get(safeIp);
  if (!record) {
    record = { timestamps: [] };
    memoryStore.set(safeIp, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  if (record.timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = record.timestamps[0];
    const resetTime = oldest + WINDOW_MS;
    const minutesLeft = Math.ceil((resetTime - now) / 60000);

    return {
      success: false,
      limit: MAX_REQUESTS_PER_WINDOW,
      remaining: 0,
      reset: resetTime,
      error: `Rate limit exceeded. You can perform ${MAX_REQUESTS_PER_WINDOW} audits per hour. Please retry in ${minutesLeft} minute${minutesLeft === 1 ? '' : 's'}.`,
    };
  }

  record.timestamps.push(now);

  return {
    success: true,
    limit: MAX_REQUESTS_PER_WINDOW,
    remaining: MAX_REQUESTS_PER_WINDOW - record.timestamps.length,
    reset: now + WINDOW_MS,
  };
}

