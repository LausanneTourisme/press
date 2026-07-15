import { describe, expect, it } from 'vitest';
import { generatePdf } from './pdf.server';

// 1x1 PNG
const IMG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

const wrap = (body: string) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><title>Formulaire</title></head>
<body>${body}</body></html>`;

const decode = (base64: string) => Buffer.from(base64, 'base64');

describe('generatePdf', () => {
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
    const attachment = await generatePdf({
      html: wrap('<img src="file:///etc/passwd" />'),
      filename: 'injection.pdf'
    });

    expect(attachment).toBeNull();
  });

  it('returns null instead of fetching external URLs provided from the form input', async () => {
    const attachment = await generatePdf({
      html: wrap('<img src="http://123.254.65.43/latest/meta-data/" />'),
      filename: 'ssrf.pdf'
    });

    expect(attachment).toBeNull();
  });
});
