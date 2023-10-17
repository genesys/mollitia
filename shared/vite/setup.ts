// Helpers
import { expect } from 'vitest';

// Matchers
expect.extend({
  async toBeAround (received: number, expected: number, round: number) {
    return new Promise((resolve) => {
      const min = received - round;
      const max = received + round;
      resolve({
        pass: (expected > min && expected < max),
        message: () => `Expected ${received} to be around ${expected}`
      });
    });
  }
});
