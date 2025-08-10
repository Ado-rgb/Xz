import express from 'express'
import { Boom } from '@hapi/boom'
import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'
import qrcode from 'qrcode'
import fs from 'fs'
import path from 'path'
import http from 'http'
import { WebSocketServer } from 'ws'
import moment from 'moment'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

const PORT = process.env.PORT || 3000
const statsPath = path.join(__dirname, 'database', 'stats.json')
let stats = fs.existsSync(statsPath) ? JSON.parse(fs.readFileSync(statsPath)) : {}

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
  res.render('index', { stats })
})

const sessions = {}

wss.on('connection', async function connection(ws) {
  ws.on('message', async function message(data) {
    const msg = JSON.parse(data)
    if (msg.type === 'connect') {
      const phone = msg.phone
      const sessionFolder = path.join(__dirname, 'sessions', phone)
      const { state, saveCreds } = await useMultiFileAuthState(sessionFolder)
      const { version } = await fetchLatestBaileysVersion()

      const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: false,
        defaultQueryTimeoutMs: undefined
      })

      sessions[phone] = sock

      sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update
        if (qr) {
          const qrImg = await qrcode.toDataURL(qr)
          ws.send(JSON.stringify({ type: 'qr', data: qrImg }))
        }
        if (connection === 'open') {
          const num = sock.user.id.split(':')[0]
          stats[num] = { lastSeen: moment().format('YYYY-MM-DD HH:mm:ss') }
          fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2))
          ws.send(JSON.stringify({ type: 'ready', data: num }))
        }
        if (connection === 'close') {
          if ((lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut) {
            makeWASocket({ auth: state })
          } else {
            ws.send(JSON.stringify({ type: 'closed' }))
          }
        }
      })

      sock.ev.on('creds.update', saveCreds)
      sock.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0]
        if (!m.message || m.key.fromMe) return
        const body = m.message.conversation || m.message.extendedTextMessage?.text
        if (!body) return
        const prefix = "!"
        if (!body.startsWith(prefix)) return

        const [cmd, ...args] = body.slice(1).split(' ')
        const pluginFile = path.join(__dirname, 'plugins', `${cmd}.js`)
        if (fs.existsSync(pluginFile)) {
          const plugin = (await import(`./plugins/${cmd}.js`)).default
          await plugin.execute(sock, m, sessions)
        }
      })
    }
  })
})

server.listen(PORT, () => {
  console.log(`✅ Adonix ProBot running on http://localhost:${PORT}`)
})