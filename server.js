const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('ws');
const pty = require('node-pty');

const app = express();
const server = http.createServer(app);
const wss = new Server({ server });

app.use(express.static('public'));

wss.on('connection', function connection(ws) {
  const shell = 'bash';

  const ptyProcess = pty.spawn(shell, ['--login'], {
    name: 'xterm-color',
    cols: 80,
    rows: 24,
    cwd: '/app',
    env: {
      ...process.env,
      TERM: 'xterm-256color',
    }
  });

  ptyProcess.onData(data => ws.send(data));
  ws.on('message', msg => ptyProcess.write(msg));
  ws.on('close', () => ptyProcess.kill());
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Adonix Terminal escuchando en http://localhost:${PORT}`);
});
