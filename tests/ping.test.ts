/**
 * Test for ping tool
 */

import { pingTool } from '../src/tools/ping.js';

describe('Ping Tool', () => {
  it('should return "pong"', async () => {
    const result = await pingTool();
    expect(result).toBe('pong');
  });
});

