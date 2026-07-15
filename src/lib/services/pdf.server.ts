import type { MailAttachment } from '$types/mail.types';
import htmlToPdfmake from 'html-to-pdfmake';
import { JSDOM } from 'jsdom';
import pdfmake from 'pdfmake';

const STANDARD_FONTS = [
  'Helvetica',
  'Helvetica-Bold',
  'Helvetica-Oblique',
  'Helvetica-BoldOblique'
];

pdfmake.addFonts({
  Helvetica: {
    normal: STANDARD_FONTS[0],
    bold: STANDARD_FONTS[1],
    italics: STANDARD_FONTS[2],
    bolditalics: STANDARD_FONTS[3]
  }
});

// Form input is interpolated into the mail HTML unescaped, so a submitted field
// could inject in a balise (E.g. <img src="file:///...">) or an external URL.
pdfmake.setUrlAccessPolicy(() => false);
pdfmake.setLocalAccessPolicy((path) => STANDARD_FONTS.includes(path));

/**
 * Converts html to pdf, returns null on fail
 */
export const generatePdf = async ({
  html,
  filename
}: {
  html: string;
  filename: string;
}): Promise<MailAttachment | null> => {
  try {
    const { window } = new JSDOM('');
    const content = htmlToPdfmake(html, { window });

    const pdf = pdfmake.createPdf({
      content,
      defaultStyle: { font: 'Helvetica' }
    });

    return {
      name: filename,
      type: 'application/pdf',
      content: await pdf.getBase64()
    };
  } catch (error) {
    console.error('PDF generation failed', error);
    return null;
  }
};
