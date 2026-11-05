// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generatePdf } from './pdf.server';

// 1x1 PNG
const IMG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const wrap = (body: string) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Formulaire</title></head>
<body>${body}</body></html>`;

const decode = (base64: string) => Buffer.from(base64, 'base64');

const silenceConsoleError = () => vi.spyOn(console, 'error').mockImplementation(() => {});

const policyDenial = (src: string) =>
  expect.objectContaining({
    message: `Access to local file denied by resource access policy: ${src}`
  });

describe('generatePdf', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the form mail HTML into a PDF attachment', async () => {
    const attachment = await generatePdf({
      html: wrap(
        `<h1>Retombées médiatiques</h1><p>Café à Lausanne - * — ïôû</p><ul><li>Instagram</li></ul><img src="${IMG}" />`
      ),
      filename: '[Formulaire] - Retombées médiatiques.pdf'
    });

    expect(attachment).not.toBeNull();
    expect(attachment?.name).toBe('[Formulaire] - Retombées médiatiques.pdf');
    expect(attachment?.type).toBe('application/pdf');
    expect(decode(attachment!.content).subarray(0, 5).toString('latin1')).toBe('%PDF-');
  });

  it('returns null instead of reading local files instead injection', async () => {
    const consoleError = silenceConsoleError();

    const attachment = await generatePdf({
      html: wrap('<img src="file:///etc/passwd" />'),
      filename: 'injection.pdf'
    });

    expect(attachment).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      'PDF generation failed',
      policyDenial('file:///etc/passwd')
    );
  });

  it('returns null instead of fetching external URLs provided from the form input', async () => {
    const consoleError = silenceConsoleError();

    const attachment = await generatePdf({
      html: wrap('<img src="http://123.254.65.43/latest/meta-data/" />'),
      filename: 'ssrf.pdf'
    });

    expect(attachment).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      'PDF generation failed',
      policyDenial('http://123.254.65.43/latest/meta-data/')
    );
  });
});
