export function downloadFile(res: any): any {
  let fileName = '';
  let contentDispositionHeader = res.headers.get('content-disposition');
  if (contentDispositionHeader) {
    let filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
      contentDispositionHeader
    );
    if (filenameMatch != null && filenameMatch[1]) {
      fileName = filenameMatch[1].replace(/['"]/g, '');
    }
  }

  if (!fileName) {
    // Fallback option if filename not found in the header
    fileName = 'downloaded_file';
  }

  const blob: Blob = res.body as Blob;
  if (!blob) {
    // Handle error when the blob is null or invalid
    return;
  }

  const a = document.createElement('a');
  a.download = fileName;
  a.href = window.URL.createObjectURL(blob);
  document.body.appendChild(a); // Append the link to the DOM to make it clickable

  a.click();

  // Remove the link and release the object URL after the download is complete
  document.body.removeChild(a);
  window.URL.revokeObjectURL(a.href);
}
