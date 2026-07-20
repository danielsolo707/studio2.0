import { describe, expect, it } from 'vitest';
import { readLimitedJson, RequestBodyTooLargeError } from '@/lib/security/request-body';

describe('limited JSON body reader', () => {
  it('parses a body within the configured limit', async () => {
    const request = new Request('https://example.test', {
      method: 'POST',
      body: JSON.stringify({ ok: true }),
    });
    await expect(readLimitedJson(request, 100)).resolves.toEqual({ ok: true });
  });

  it('rejects an oversized streamed body', async () => {
    const request = new Request('https://example.test', {
      method: 'POST',
      body: JSON.stringify({ value: 'x'.repeat(100) }),
    });
    await expect(readLimitedJson(request, 20)).rejects.toBeInstanceOf(RequestBodyTooLargeError);
  });
});
