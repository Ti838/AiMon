function triggerDownload(filename, href) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function downloadCsv(filename, rows) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const escapeCell = (value) => {
    const str = value == null ? '' : String(value);
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
    return str;
  };

  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCell(row[h])).join(','));
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(filename, url);
  URL.revokeObjectURL(url);
}

export async function exportElementAsPng(element, filename) {
  if (!element) throw new Error('Export target not found');
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(element, {
    useCORS: true,
    backgroundColor: null,
    scale: Math.max(2, window.devicePixelRatio || 1),
  });
  const dataUrl = canvas.toDataURL('image/png');
  triggerDownload(filename, dataUrl);
}
