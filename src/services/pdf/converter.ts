import * as pdfjsLib from 'pdfjs-dist';

// Set worker source - using CDN for simplicity
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFConversionOptions {
  scale?: number; // Resolution scale (default: 2 for high quality)
  maxPages?: number; // Max pages to convert (default: unlimited)
}

export const convertPDFToImages = async (
  file: File,
  options: PDFConversionOptions = {}
): Promise<string[]> => {
  const { scale = 2, maxPages } = options;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const images: string[] = [];
  const numPages = maxPages ? Math.min(pdf.numPages, maxPages) : pdf.numPages;

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport,
    }).promise;

    const imageData = canvas.toDataURL('image/png');
    images.push(imageData);
  }

  return images;
};

export const convertPDFPageToImage = async (
  file: File,
  pageNumber: number,
  scale: number = 2
): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (pageNumber < 1 || pageNumber > pdf.numPages) {
    throw new Error(`Invalid page number: ${pageNumber}`);
  }

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Failed to get canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return canvas.toDataURL('image/png');
};

export const getPDFInfo = async (
  file: File
): Promise<{ numPages: number; title?: string; author?: string }> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const metadata = await pdf.getMetadata();
  const info = metadata.info as any;

  return {
    numPages: pdf.numPages,
    title: info?.Title,
    author: info?.Author,
  };
};
