// PDF text extraction with page metadata. ResumeFUT accepts at most three PDF pages.
export async function extractPdfTextWithMetadata(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  if (pdf.numPages > 3) {
    const error = new Error(`This resume has ${pdf.numPages} pages. ResumeFUT accepts resumes up to 3 pages.`);
    error.code = 'TOO_MANY_PAGES';
    error.pageCount = pdf.numPages;
    throw error;
  }

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    fullText += `${reconstructLines(content.items)}\n`;
  }

  return { text: fullText.trim(), pageCount: pdf.numPages };
}

// Backwards-compatible helper for any existing imports.
export async function extractPdfText(file) {
  const result = await extractPdfTextWithMetadata(file);
  return result.text;
}

function reconstructLines(items, yTolerance = 3) {
  const rows = [];
  for (const item of items) {
    if (!item.str || !item.str.trim()) continue;
    const x = item.transform[4];
    const y = item.transform[5];
    let row = rows.find((r) => Math.abs(r.y - y) < yTolerance);
    if (!row) {
      row = { y, fragments: [] };
      rows.push(row);
    }
    row.fragments.push({ x, str: item.str });
  }
  rows.sort((a, b) => b.y - a.y);
  return rows
    .map((row) => row.fragments.sort((a, b) => a.x - b.x).map((f) => f.str).join(' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}
