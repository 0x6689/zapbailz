zapbailz

<p align="center">
<img src="https://raw.githubusercontent.com/0x6689/zapbailz/main/Media/logo.png" alt="zapbailz logo" width="280" />
</p> <p align="center">
  <strong>Modified WhatsApp Web API for Node.js and TypeScript</strong>
</p> <p align="center">
  <a href="https://github.com/0x6689/zapbailz">GitHub</a> ·
  <a href="https://www.typescriptlang.org/">TypeScript</a> ·
  <a href="https://nodejs.org/">Node.js</a>
</p>

zapbailz adalah fork dan pengembangan lanjutan berbasis Baileys untuk berkomunikasi dengan WhatsApp Web melalui WebSocket. Project ini menyediakan API TypeScript strict, dukungan multi-device, Signal Protocol, LID mapping, media, groups, communities, newsletters, business API, GraphQL/MEX, interactive messages, SQLite store, dan helper pengujian.


Gunakan project ini secara bertanggung jawab. Pastikan penggunaan bot dan automation Anda mematuhi Terms of Service WhatsApp serta hukum yang berlaku.

Fitur utama

•
WebSocket client WhatsApp Web tanpa Selenium atau Chromium.

•
Dukungan Node.js >=20 dan module ESM.

•
Source TypeScript lengkap dengan generated declaration .d.ts.

•
QR dan pairing-code authentication melalui event connection.update.

•
Multi-file auth state, JSON/in-memory store, dan SQLite auth/store.

•
Caching Signal key store dengan makeCacheableSignalKeyStore.

•
Pesan text, image, video, audio, document, sticker, poll, reaction, location, contact, event, album, native-flow, buttons, lists, product, dan interactive messages.

•
sendFakeMessage untuk simulasi event messages.upsert tanpa mengirim pesan ke jaringan.

•
WhatsApp username API melalui MEX dan USync.

•
Groups, communities, newsletters, broadcast, business catalog, GraphQL, interop, registration, dan managed-account API.

•
LID-to-PN mapping dan dukungan protokol Signal multi-device.

•
Helper splitPayment yang dikonversi ke native protobuf splitPaymentMessage.

•
WAProto terbaru tersedia melalui export utama dan subpath WAProto.

Persyaratan

•
Node.js 20 atau lebih baru.

•
npm, pnpm, atau Yarn Berry.

•
Akun WhatsApp untuk autentikasi.

•
Untuk media tertentu, install dependency optional yang sesuai seperti sharp, jimp, audio-decode, atau link-preview-js.

•
Untuk SQLite built-in, gunakan Node.js yang menyediakan module node:sqlite.

Instalasi

Dari GitHub

Bash


npm install github:0x6689/zapbailz



Bash


yarn add github:0x6689/zapbailz



Bash


pnpm add github:0x6689/zapbailz



Nama package di source saat ini adalah xbailz. Jika meng-install dari source GitHub, import default tetap dapat digunakan seperti contoh di bawah. Jika package name nantinya diubah menjadi zapbailz, cukup ganti nama import package pada aplikasi Anda.

Dari source

Bash


git clone https://github.com/0x6689/zapbailz.git
cd zapbailz
corepack enable
corepack yarn install
corepack yarn build



Quick start TypeScript

Contoh berikut menggunakan multi-file auth state dan memproses event koneksi secara manual.

TypeScript


import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
} from 'xbailz'
import { Boom } from '@hapi/boom'

async function startBot(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState('./auth_info')
  const { version } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    auth: state,
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      // Tampilkan QR dengan library pilihan Anda.
      console.log('QR tersedia:', qr)
    }

    if (connection === 'open') {
      console.log('WhatsApp connected')
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
      if (statusCode !== DisconnectReason.loggedOut) {
        void startBot()
      } else {
        console.error('Session logout. Hapus auth_info jika ingin pairing ulang.')
      }
    }
  })

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const message of messages) {
      const jid = message.key.remoteJid
      const text = message.message?.conversation

      if (!message.key.fromMe && jid && text) {
        console.log(`${jid}: ${text}`)
        await sock.sendMessage(jid, { text: `Echo: ${text}` })
      }
    }
  })
}

void startBot()




printQRInTerminal masih tersedia untuk kompatibilitas, tetapi sudah deprecated. Disarankan membaca nilai qr dari event connection.update dan menampilkannya dengan library QR pilihan Anda.

Pairing code

Pairing code dapat diminta setelah socket dibuat dan credentials belum terdaftar:

TypeScript


const phoneNumber = '6281234567890'

if (!sock.authState.creds.registered) {
  const code = await sock.requestPairingCode(phoneNumber)
  console.log('Pairing code:', code)
}



Gunakan format nomor internasional tanpa tanda +, spasi, atau tanda baca.

Mengirim pesan

TypeScript


await sock.sendMessage(jid, { text: 'Halo dari zapbailz' })

await sock.sendMessage(jid, {
  image: { url: './image.jpg' },
  caption: 'Gambar dari bot',
})

await sock.sendMessage(jid, {
  document: { url: './report.pdf' },
  fileName: 'report.pdf',
  mimetype: 'application/pdf',
})

await sock.sendMessage(jid, {
  text: 'Pesan dengan mention @user',
  mentions: ['6281234567890@s.whatsapp.net'],
})



Poll

TypeScript


await sock.sendMessage(jid, {
  poll: {
    name: 'Pilihan Anda?',
    values: ['A', 'B', 'C'],
    selectableCount: 1,
  },
})



Reaction dan reply

TypeScript


await sock.sendMessage(jid, {
  react: {
    text: '👍',
    key: quotedMessage.key,
  },
})

await sock.sendMessage(jid, {
  text: 'Ini balasan',
  quoted: quotedMessage,
})



Split payment

splitPayment adalah helper ergonomis yang dikonversi ke bentuk protobuf native splitPaymentMessage.

TypeScript


await sock.sendMessage(jid, {
  splitPayment: {
    splitId: 'makan-01',
    total: 100000,
    currency: 'IDR',
    description: 'Makan bersama',
    requesterJid: '6281234567890@s.whatsapp.net',
    participants: [
      {
        jid: '628111111111@s.whatsapp.net',
        amount: 50000,
        status: 'PENDING',
      },
      {
        jid: '628222222222@s.whatsapp.net',
        amount: 50000,
        status: 'PAID',
      },
    ],
  },
})



Untuk akses langsung ke bentuk protobuf, gunakan splitPaymentMessage pada content message sesuai definisi WAProto.

Store dan authentication

Multi-file auth state

TypeScript


import { useMultiFileAuthState } from 'xbailz'

const { state, saveCreds } = await useMultiFileAuthState('./auth_info')



Simpan folder auth dengan aman dan jangan commit ke Git. Tambahkan folder berikut ke .gitignore:

Plain Text


auth_info/
*.db
*.sqlite
*.sqlite3



SQLite auth state

TypeScript


import makeWASocket, { useSQLiteAuthState } from 'xbailz'

const { state, saveCreds, close } = useSQLiteAuthState('./auth.db')
const sock = makeWASocket({ auth: state })

sock.ev.on('creds.update', saveCreds)

// Panggil close() ketika aplikasi benar-benar berhenti.



In-memory dan SQLite store

TypeScript


import { makeInMemoryStore, makeSQLiteStore } from 'xbailz'

const memoryStore = makeInMemoryStore({ logger })
const sqliteStore = makeSQLiteStore({
  location: './whatsapp-store.db',
  logger,
})



Nama alias yang tersedia adalah makeInMemmoryStore dan makeInMemoryStore. Gunakan ejaan makeInMemoryStore untuk kode baru.

Message simulation

sendFakeMessage membuat event message lokal untuk testing pipeline, tanpa mengirim pesan melalui jaringan WhatsApp.

TypeScript


await sock.sendFakeMessage(
  '6281234567890@s.whatsapp.net',
  { text: 'Pesan simulasi' },
  {
    pn: '6281234567890@s.whatsapp.net',
    lid: '123456789012345@lid',
  },
)



Gunakan API ini untuk menguji handler messages.upsert, routing, parser, dan store tanpa perlu mengirim pesan sungguhan.

Username API

Socket menyediakan API username berikut melalui MEX dan USync:

TypeScript


const result = await sock.checkUsername('namaanda')

if (result.available) {
  await sock.setUsername('namaanda')
}

const current = await sock.getMyUsername()
const user = await sock.findUserByUsername('kontak')



API lain yang tersedia meliputi checkAndSetUsername, deleteUsername, setUsernamePin, fetchContactUsernames, checkUsernameMulti, dan getUsernameRecommendations.

API export penting

TypeScript


import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateMessageIDV2,
  makeCacheableSignalKeyStore,
  makeInMemoryStore,
  makeSQLiteStore,
  proto,
  useMultiFileAuthState,
  useSQLiteAuthState,
} from 'xbailz'



Semua definisi protobuf juga tersedia melalui:

TypeScript


import { proto } from 'xbailz/WAProto'



Development commands

Bash


# Install dependency
corepack yarn install

# Compile TypeScript, generate JavaScript, dan declaration files
corepack yarn build

# Type-check tanpa emit
corepack yarn tsc --noEmit -p tsconfig.json

# Jalankan unit test
corepack yarn test --runInBand

# Jalankan contoh
corepack yarn example

# Generate static WAProto
corepack yarn gen:protobuf

# Format source
corepack yarn format



Struktur project

Plain Text


src/          Source TypeScript utama
lib/          Hasil build JavaScript dan declaration files
WAProto/      Protobuf schema dan generated protobuf runtime
Example/      Contoh penggunaan
src/Store/    In-memory, JSON, dan SQLite store
src/Socket/   Socket layer, messaging, groups, business, MEX, GraphQL
src/Utils/    Auth, crypto, media, message, dan protocol utilities



Status kompatibilitas

Project ini menggunakan ESM dan membutuhkan Node.js 20 atau lebih baru. Gunakan corepack agar versi Yarn sesuai dengan deklarasi packageManager pada package.json.

Build dan unit test telah divalidasi terhadap source update terbaru. End-to-end test membutuhkan akun WhatsApp dan environment yang sesuai, sehingga tidak dijalankan sebagai bagian dari validasi lokal biasa.

License

MIT. Lihat file LICENSE.

