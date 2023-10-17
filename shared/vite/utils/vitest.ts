// Helpers
import { vi } from 'vitest';

export const successAsync = vi.fn().mockImplementation((res: unknown, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(res);
    }, delay);
  });
});

export const multiSuccessAsync = vi.fn().mockImplementation((res: unknown, res2: unknown, delay = 1) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ res, res2 });
    }, delay);
  });
});

export const failureAsync = vi.fn().mockImplementation((res: unknown, delay = 1) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(res);
    }, delay);
  });
});
