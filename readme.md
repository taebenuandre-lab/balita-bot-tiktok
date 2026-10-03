BALITA BOT — TikTok OAuth

Project OAuth TikTok untuk BALITA BOT menggunakan Node.js + Express dan siap dideploy ke Render.

Struktur Project

balita-tiktok/
├── server.js
├── package.json
├── README.md
└── public/
    └── index.html

1. Konfigurasi TikTok

Buka:

server.js

Cari:

const CLIENT_KEY = "sbawwfyv5bgmyzypwv";
const CLIENT_SECRET = "GANTI_CLIENT_SECRET_DI_SINI";
const DOMAIN = "https://GANTI-DOMAIN-RENDER";

Isi "CLIENT_SECRET" dengan Client Secret dari TikTok Developer Portal.

Kemudian setelah mendapatkan domain Render, ubah:

const DOMAIN = "https://GANTI-DOMAIN-RENDER";

menjadi contoh:

const DOMAIN = "https://balita-bot-tiktok.onrender.com";

Jangan membagikan Client Secret, Access Token, atau Refresh Token.

2. Redirect URI TikTok

Jika domain Render adalah:

https://balita-bot-tiktok.onrender.com

maka Redirect URI:

https://balita-bot-tiktok.onrender.com/callback

Masukkan URL tersebut ke konfigurasi OAuth TikTok.

Pastikan URL yang digunakan TikTok sama persis dengan "REDIRECT_URI" di "server.js".

3. Scope

Project ini meminta:

user.info.basic
video.list

Scope tersebut digunakan untuk:

- membaca informasi dasar akun TikTok
- membaca video publik akun TikTok

4. Upload ke GitHub

Buat repository baru di GitHub.

Upload:

server.js
package.json
README.md
public/index.html

Pastikan "server.js" berada di root repository.

Contoh:

repository/
├── server.js
├── package.json
├── README.md
└── public/
    └── index.html

5. Deploy ke Render

Di Render:

New
→ Web Service

Hubungkan repository GitHub.

Gunakan:

Runtime

Node

Build Command

npm install

Start Command

npm start

Kemudian deploy.

Tidak membutuhkan:

netlify.toml

Tidak membutuhkan:

dist/

Tidak membutuhkan:

netlify/functions/

6. Setelah Deploy

Misalnya Render memberikan:

https://balita-bot-tiktok.onrender.com

Buka:

https://balita-bot-tiktok.onrender.com/

Halaman utama BALITA BOT akan muncul.

Untuk memulai OAuth:

https://balita-bot-tiktok.onrender.com/login

Callback:

https://balita-bot-tiktok.onrender.com/callback

Health check:

https://balita-bot-tiktok.onrender.com/health

Health check harus menghasilkan JSON seperti:

{
  "ok": true,
  "service": "BALITA BOT TikTok OAuth"
}

7. Alur OAuth

Alurnya:

BALITA BOT Website
        ↓
     /login
        ↓
TikTok Authorization
        ↓
User memberikan izin
        ↓
     /callback
        ↓
TikTok Token API
        ↓
Access Token
Refresh Token
        ↓
TikTok Display API
        ↓
Profile + Video

8. Setelah OAuth Berhasil

Halaman callback akan menampilkan:

TikTok Account
Scope
Display API status
Access Token
Refresh Token

Token tersebut adalah kredensial sensitif.

Jangan mengirim token ke orang lain atau memasukkannya ke repository GitHub.

9. Integrasi ke BALITA BOT

Setelah OAuth berhasil, Access Token dan Refresh Token dapat digunakan oleh BALITA BOT untuk mengakses TikTok Display API.

Endpoint yang digunakan:

/v2/user/info/

dan:

/v2/video/list/

BALITA BOT kemudian dapat menggunakan data video untuk sistem notifikasi Discord.

10. Troubleshooting

Error "redirect_uri"

Pastikan Redirect URI TikTok sama persis dengan:

https://DOMAIN-RENDER-KAMU/callback

Jangan menggunakan:

/netlify/functions/tiktok-callback

Project ini sudah tidak menggunakan Netlify.

Error "scope_not_authorized"

Pastikan aplikasi TikTok sudah memiliki:

user.info.basic
video.list

dan akun TikTok sudah memberikan izin yang diperlukan.

Error "Client Secret belum diisi"

Buka:

server.js

kemudian isi:

const CLIENT_SECRET = "CLIENT_SECRET_TIKTOK_KAMU";

Website tidak terbuka

Periksa Render Logs.

Pastikan Start Command:

npm start

dan "package.json" memiliki:

"scripts": {
  "start": "node server.js"
}

Port error

Jangan mengganti port secara manual.

Server sudah menggunakan:

const PORT = process.env.PORT || 3000;

Render akan memberikan "PORT" secara otomatis.

11. Keamanan

Jangan pernah memasukkan data berikut ke GitHub:

Client Secret
Access Token
Refresh Token

Jika salah satu kredensial tersebut terlanjur tersebar, lakukan rotate/revoke melalui layanan terkait.

12. Teknologi

Project menggunakan:

- Node.js
- Express
- TikTok Login Kit
- TikTok Display API
- Render
- GitHub

Status

Frontend       ✓
Express Server ✓
TikTok Login   ✓
OAuth Callback ✓
Profile API    ✓
Video API      ✓
Render Ready   ✓