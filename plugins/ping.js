export default {
  name: 'ping',
  description: 'Responde pong',
  execute: async (sock, msg, conn) => {
    await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' }, { quoted: msg });
  }
};