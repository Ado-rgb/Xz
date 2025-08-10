import { IncomingForm } from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo POST permitido' });
  }

  const uploadsDir = '/tmp'; // ✅ Permitido en Vercel

  const form = new IncomingForm({ uploadDir: uploadsDir, keepExtensions: true });

  form.parse(req, (err, fields, files) => {
    if (err || !files.file) {
      return res.status(400).json({ error: 'Error al procesar archivo' });
    }

    const file = files.file[0];
    const ext = path.extname(file.originalFilename || '');
    const newFilename = uuidv4() + ext;
    const newPath = path.join(uploadsDir, newFilename);

    fs.renameSync(file.filepath, newPath);

    // Devuelve una URL API que servirá el archivo desde /tmp
    const fileUrl = `${req.headers.origin}/api/file/${newFilename}`;
    res.status(200).json({ success: true, url: fileUrl });
  });
}
