// Extracts text from a PDF File object entirely in the browser using
// pdfjs-dist. The PDF itself is never uploaded anywhere — only the
// resulting plain text is sent to /api/analyze for scoring.
//
// pdf.js gives us individual text fragments with x/y positions, not lines.
// Naively joining every fragment with a single space collapses an entire
// page into one long line, which breaks anything that relies on line
// structure (name detection, section headers). Instead we group fragments
// by their y-position into rows, sort each row left-to-right, and join rows
// with newlines — much closer to how the resume actually reads.
export async function extractPdfText(file) {
  const pdfjsLib = await import('pdfjs-dist/build/pdf');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    fullText += `${reconstructLines(content.items)}\n`;
  }
  return fullText.trim();
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

  // PDF y-coordinates increase upward, so sort top of page first.
  rows.sort((a, b) => b.y - a.y);

  return rows
    .map((row) =>
      row.fragments
        .sort((a, b) => a.x - b.x)
        .map((f) => f.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean)
    .join('\n');
}
