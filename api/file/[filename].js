import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { filename } = req.query;
  const filePath = path.join('/tmp', filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('Archivo no encontrado');
  }

  const stat = fs.statSync(filePath);
  const fileStream = fs.createReadStream(filePath);

  res.setHeader('Content-Length', stat.size);
  res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
  res.setHeader('Content-Type', getMimeType(filename));

  fileStream.pipe(res);
}

function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.zip': 'application/zip',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
