
import React, { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLink, setDownloadLink] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setLoading(true);

    const response = await fetch("/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await response.json();
    const botMessage = { sender: "bot", text: "Código generado. Descárgalo abajo." };
    setMessages((prev) => [...prev, botMessage]);
    setDownloadLink(`/download/${data.file}`);
    setInput("");
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>CodeFixer AI</h1>
      <div className="chatbox">
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender === "user" ? "user-msg" : "bot-msg"}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe tu proyecto o pega tu código..."
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "Generando..." : "Enviar"}
        </button>
      </div>
      {downloadLink && (
        <div className="download-section">
          <a href={downloadLink} download>
            <button>Descargar ZIP</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
