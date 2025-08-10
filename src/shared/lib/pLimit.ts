// src/shared/lib/pLimit.ts

export function pLimit(concurrency: number) {
  if (concurrency < 1) throw new Error('Concurrency must be at least 1');

  const queue: Array<() => void> = [];
  let activeCount = 0;

  const next = () => {
    activeCount = Math.max(0, activeCount - 1);
    const runTask = queue.shift();
    if (runTask) {
      queueMicrotask(runTask);
    }
  };

  const run = async <T>(
    fn: () => Promise<T>,
    resolve: (value: T) => void,
    reject: (reason: unknown) => void
  ) => {
    activeCount++;
    try {
      const result = await fn();
      resolve(result);
    } catch (err) {
      reject(err);
    } finally {
      next();
    }
  };

  const enqueue = <T>(fn: () => Promise<T>) =>
    new Promise<T>((resolve, reject) => {
      const task = () => void run(fn, resolve, reject);
      if (activeCount < concurrency) {
        task();
      } else {
        queue.push(task);
      }
    });

  const limiter = <T>(fn: () => Promise<T>) => enqueue(fn);
  // helpers
  Object.defineProperties(limiter, {
    activeCount: { get: () => activeCount },
    pendingCount: { get: () => queue.length },
    clear: { value: () => queue.splice(0) },
  });

  return limiter as (<T>(fn: () => Promise<T>) => Promise<T>) & {
    readonly activeCount: number;
    readonly pendingCount: number;
    clear: () => void;
  };
}
