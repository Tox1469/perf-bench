export interface BenchResult {
  name: string;
  opsPerSec: number;
  avgNs: number;
  iterations: number;
  durationMs: number;
}

export interface BenchOptions {
  duration?: number;
  warmup?: number;
  minIterations?: number;
}

function now(): bigint {
  return process.hrtime.bigint();
}

export async function bench(
  name: string,
  fn: () => unknown | Promise<unknown>,
  opts: BenchOptions = {}
): Promise<BenchResult> {
  const duration = opts.duration ?? 1000;
  const warmup = opts.warmup ?? 100;
  const minIter = opts.minIterations ?? 10;

  for (let i = 0; i < warmup; i++) await fn();

  let iterations = 0;
  const start = now();
  const deadline = Date.now() + duration;
  while (Date.now() < deadline || iterations < minIter) {
    await fn();
    iterations++;
  }
  const end = now();

  const totalNs = Number(end - start);
  const avgNs = totalNs / iterations;
  const opsPerSec = 1e9 / avgNs;
  return {
    name,
    opsPerSec,
    avgNs,
    iterations,
    durationMs: totalNs / 1e6,
  };
}

export class Suite {
  private cases: { name: string; fn: () => unknown | Promise<unknown> }[] = [];
  constructor(public name: string, private opts: BenchOptions = {}) {}

  add(name: string, fn: () => unknown | Promise<unknown>) {
    this.cases.push({ name, fn });
    return this;
  }

  async run(): Promise<BenchResult[]> {
    const results: BenchResult[] = [];
    for (const c of this.cases) {
      results.push(await bench(c.name, c.fn, this.opts));
    }
    return results;
  }
}

export function format(results: BenchResult[]): string {
  const sorted = [...results].sort((a, b) => b.opsPerSec - a.opsPerSec);
  const fastest = sorted[0]?.opsPerSec ?? 1;
  return sorted
    .map((r) => {
      const rel = ((r.opsPerSec / fastest) * 100).toFixed(1);
      return `${r.name.padEnd(30)} ${r.opsPerSec.toFixed(0).padStart(12)} ops/sec  (${rel}%)`;
    })
    .join("\n");
}
