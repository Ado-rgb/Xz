const term = new Terminal();
term.open(document.getElementById('terminal'));

const socket = new WebSocket(`ws://${location.host}`);

term.onData(data => socket.send(data));
socket.onmessage = e => term.write(e.data);
