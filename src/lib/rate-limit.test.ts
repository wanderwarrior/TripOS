import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { rateLimit, clientIpFrom } from "./rate-limit";

describe("rateLimit", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows up to the limit, then blocks within the window", () => {
    const key = `t-${Math.random()}`;
    expect(rateLimit(key, 3, 1000).ok).toBe(true);
    expect(rateLimit(key, 3, 1000).ok).toBe(true);
    const third = rateLimit(key, 3, 1000);
    expect(third.ok).toBe(true);
    expect(third.remaining).toBe(0);

    const blocked = rateLimit(key, 3, 1000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("resets after the window elapses", () => {
    const key = `t-${Math.random()}`;
    rateLimit(key, 1, 1000);
    expect(rateLimit(key, 1, 1000).ok).toBe(false);
    vi.advanceTimersByTime(1001);
    expect(rateLimit(key, 1, 1000).ok).toBe(true);
  });
});

describe("clientIpFrom", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIpFrom(h)).toBe("1.2.3.4");
  });
  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(clientIpFrom(new Headers({ "x-real-ip": "9.9.9.9" }))).toBe("9.9.9.9");
    expect(clientIpFrom(new Headers())).toBe("unknown");
  });
});
