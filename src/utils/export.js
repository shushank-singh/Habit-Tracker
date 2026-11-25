// Export SVG and PNG utilities formatted for A4 Landscape (297mm x 210mm)

const A4_PNG_WIDTH = 3508;  // 297mm at 300 DPI
const A4_PNG_HEIGHT = 2480; // 210mm at 300 DPI

function normalizeSvgAttributes(source, widthAttr, heightAttr) {
  let result = source;

  if (!result.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    result = result.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!result.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    result = result.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  // Replace existing width/height attributes on root <svg> if present, else insert them
  result = result.replace(/^(<svg\b[^>]*?)\s+width="[^"]*"/i, '$1');
  result = result.replace(/^(<svg\b[^>]*?)\s+height="[^"]*"/i, '$1');
  result = result.replace(/^<svg/, `<svg width="${widthAttr}" height="${heightAttr}"`);

  return result;
}

export function exportToSVG(svgElement, filename = 'habit-tracker-a4.svg') {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  let source = normalizeSvgAttributes(
    serializer.serializeToString(svgElement),
    '297mm',
    '210mm'
  );

  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export function exportToPNG(svgElement, filename = 'habit-tracker-a4.png') {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  const source = normalizeSvgAttributes(
    serializer.serializeToString(svgElement),
    `${A4_PNG_WIDTH}`,
    `${A4_PNG_HEIGHT}`
  );

  const img = new Image();
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = A4_PNG_WIDTH;
    canvas.height = A4_PNG_HEIGHT;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, A4_PNG_WIDTH, A4_PNG_HEIGHT);

    URL.revokeObjectURL(url);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const pngUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = filename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(pngUrl);
    }, 'image/png');
  };

  img.onerror = () => {
    URL.revokeObjectURL(url);
  };

  img.src = url;
}
