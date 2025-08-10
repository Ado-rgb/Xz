
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { v4: uuidv4 } = require("uuid");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const OUTPUT_DIR = path.join(__dirname, "output");
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/generate", async (req, res) => {
  const { prompt } = req.body;
  const id = uuidv4();
  const dirPath = path.join(OUTPUT_DIR, id);
  fs.mkdirSync(dirPath);

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const filePath = path.join(dirPath, "index.html");
    fs.writeFileSync(filePath, text);

    const zipPath = path.join(OUTPUT_DIR, `${id}.zip`);
    const output = fs.createWriteStream(zipPath);
    const archive = archiver("zip");
    archive.pipe(output);
    archive.directory(dirPath, false);
    await archive.finalize();

    res.json({ file: `${id}.zip` });
  } catch (error) {
    console.error("Error con Gemini:", error);
    res.status(500).json({ error: "Error generando contenido con Gemini." });
  }
});

app.get("/download/:filename", (req, res) => {
  const file = req.params.filename;
  const filePath = path.join(OUTPUT_DIR, file);
  res.download(filePath);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Servidor en puerto ${PORT}`));
