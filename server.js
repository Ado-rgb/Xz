const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('ws');
const pty = require('node-pty');

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

app.use(express.static('public'));

wss.on('connection', (ws) => {
  const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env
  });

  ptyProcess.onData(data => ws.send(data));
  ws.on('message', msg => ptyProcess.write(msg));
  ws.on('close', () => ptyProcess.kill());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Terminal corriendo en http://localhost:${PORT}`));
