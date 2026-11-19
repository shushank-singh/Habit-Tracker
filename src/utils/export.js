// Export SVG and PNG utilities

export function exportToSVG(svgElement, filename = 'habit-tracker.svg') {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  let source = serializer.serializeToString(svgElement);

  // Add namespaces if not present
  if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if (!source.match(/^<svg[^>]+xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/)) {
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  // Prepend XML declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
  const downloadLink = document.createElement('a');
  downloadLink.href = url;
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export function exportToPNG(svgElement, filename = 'habit-tracker.png', scale = 2.5) {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);

  const img = new Image();
  const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  img.onload = () => {
    const canvas = document.createElement('canvas');
    const width = svgElement.viewBox.baseVal.width || 743;
    const height = svgElement.viewBox.baseVal.height || 1024;

    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.scale(scale, scale);
    ctx.drawImage(img, 0, 0);

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

  img.src = url;
}
