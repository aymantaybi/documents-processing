export class RateLimiter {
  private queue: number[] = [];
  private requestsPerMinute: number;

  constructor(options: { requestsPerMinute: number }) {
    this.requestsPerMinute = options.requestsPerMinute;
  }

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    // Remove timestamps older than 1 minute
    this.queue = this.queue.filter((time) => now - time < 60000);

    if (this.queue.length >= this.requestsPerMinute) {
      const oldestRequest = this.queue[0];
      const waitTime = 60000 - (now - oldestRequest);

      if (waitTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, waitTime));
        return this.waitForSlot();
      }
    }

    this.queue.push(now);
  }

  getQueueLength(): number {
    const now = Date.now();
    return this.queue.filter((time) => now - time < 60000).length;
  }

  reset(): void {
    this.queue = [];
  }

  setRequestsPerMinute(rpm: number): void {
    this.requestsPerMinute = rpm;
  }
}

// Global rate limiter instance
let rateLimiter: RateLimiter | null = null;

export const getRateLimiter = (requestsPerMinute: number = 10): RateLimiter => {
  if (!rateLimiter) {
    rateLimiter = new RateLimiter({ requestsPerMinute });
  } else {
    rateLimiter.setRequestsPerMinute(requestsPerMinute);
  }
  return rateLimiter;
};
