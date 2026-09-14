import { describe, it, expect, vi, afterEach } from 'vitest';
import { analyzeDocument, analyzeQuestion, validateDocument } from './legal';

const okResponse = (body: unknown) =>
  ({ ok: true, json: () => Promise.resolve(body) } as Response);

const errResponse = (detail: string) =>
  ({
    ok: false,
    status: 503,
    json: () => Promise.resolve({ detail }),
  } as Response);

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('validateDocument', () => {
  it('rejects unsupported file types', () => {
    const file = new File(['hello'], 'note.exe', { type: 'application/x-msdownload' });
    expect(validateDocument(file)).toBe('Choose a PDF, PNG, JPEG, WebP, or text file.');
  });

  it('rejects files larger than 8 MB', () => {
    const file = new File([new Uint8Array(9 * 1024 * 1024)], 'big.pdf', { type: 'application/pdf' });
    expect(validateDocument(file)).toBe('Document must be 8 MB or smaller.');
  });

  it('accepts a supported type under the size limit', () => {
    const pdf = new File(['%PDF-1.4 fake pdf'], 'lease.pdf', { type: 'application/pdf' });
    expect(validateDocument(pdf)).toBeUndefined();
    const text = new File(['rental agreement terms'], 'notes.txt', { type: 'text/plain' });
    expect(validateDocument(text)).toBeUndefined();
  });
});

describe('analyzeQuestion', () => {
  it('POSTs the message and language as JSON', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse({ issue: 'Employment', source_status: 'Unverified AI Guidance', verified_sources: [] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await analyzeQuestion('My salary has not been paid.', 'English');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/api/legal/analyze');
    expect((init as RequestInit).method).toBe('POST');
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.message).toBe('My salary has not been paid.');
    expect(body.language).toBe('English');
    expect(result.issue).toBe('Employment');
  });

  it('throws a safe message when the API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(errResponse('Too many requests. Please wait a minute and try again.')));

    await expect(analyzeQuestion('My salary has not been paid.', 'English')).rejects.toThrow(
      'Too many requests. Please wait a minute and try again.',
    );
  });

  it('maps network failures to an actionable user message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));

    await expect(analyzeQuestion('My salary has not been paid.', 'English')).rejects.toThrow(
      'Cannot reach the legal assistance service. Please check your connection and try again.',
    );
  });

  it('aborts a request that exceeds the 30 second timeout', async () => {
    vi.useFakeTimers();
    try {
      vi.stubGlobal(
        'fetch',
        vi.fn((_url: string, init?: RequestInit) => {
          const signal = init?.signal as AbortSignal;
          return new Promise((_resolve, reject) => {
            if (signal.aborted) reject(new DOMException('Aborted', 'AbortError'));
            signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
          });
        }) as unknown as typeof fetch,
      );

      const pending = analyzeQuestion('My salary has not been paid.', 'English');
      const assertion = expect(pending).rejects.toThrow(
        'Cannot reach the legal assistance service. Please check your connection and try again.',
      );
      await vi.advanceTimersByTimeAsync(30_000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });

  it('returns a safe message when the API body is not valid JSON', async () => {
    const invalidBody = { ok: true, json: () => Promise.reject(new SyntaxError('Unexpected token')) } as unknown as Response;
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(invalidBody));

    await expect(analyzeQuestion('My salary has not been paid.', 'English')).rejects.toThrow(
      'The legal assistance service sent an invalid response. Please try again.',
    );
  });
});

describe('analyzeDocument', () => {
  it('uploads the file as FormData to the document endpoint', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      okResponse({ issue: 'Rental/Housing', source_status: 'Unverified AI Guidance', verified_sources: [] }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const file = new File(['rental agreement'], 'lease.txt', { type: 'text/plain' });
    await analyzeDocument(file, 'Hindi');

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/api/legal/document?language=Hindi');
    expect((init as RequestInit).method).toBe('POST');
    expect((init as RequestInit).body).toBeInstanceOf(FormData);
  });
});