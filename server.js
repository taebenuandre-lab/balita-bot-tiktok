const express = require("express");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ==============================
// TIKTOK CONFIG
// ==============================

const CLIENT_KEY = "sbawwfyv5bgmyzypwv";

// ISI SENDIRI CLIENT SECRET DI SINI.
// Jangan kirim Client Secret ke chat.
const CLIENT_SECRET = "tS5vOYDIf4aWwZJDtoSCnmAT7M02woPN";

// Setelah Render memberikan domain,
// ganti bagian ini.
// Contoh:
// https://balita-bot-tiktok.onrender.com
const DOMAIN = "https://sport-sad-monkey.abasthan.app";

const REDIRECT_URI = `${DOMAIN}/callback`;

// ==============================
// APP
// ==============================

app.disable("x-powered-by");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Penyimpanan state OAuth sementara.
const oauthStates = new Map();

// ==============================
// HELPER
// ==============================

function escapeHTML(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function cleanOldStates() {
  const now = Date.now();

  for (const [state, createdAt] of oauthStates.entries()) {
    if (now - createdAt > 10 * 60 * 1000) {
      oauthStates.delete(state);
    }
  }
}

function resultPage({
  title,
  badge,
  heading,
  content,
  error = false
}) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>${escapeHTML(title)} • BALITA BOT</title>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  padding: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  color: #fff;
  background: #050507;
}

body::before {
  content: "";
  position: fixed;
  inset: -30%;

  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(254, 44, 85, .20),
      transparent 28%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(37, 244, 238, .14),
      transparent 30%
    );

  filter: blur(30px);
  pointer-events: none;
}

.card {
  position: relative;

  width: min(760px, 100%);

  padding: 34px;

  border:
    1px solid
    rgba(255,255,255,.10);

  border-radius: 28px;

  background:
    rgba(13,13,18,.82);

  backdrop-filter: blur(25px);

  box-shadow:
    0 30px 100px
    rgba(0,0,0,.55);
}

.logo {
  width: 58px;
  height: 58px;

  display: grid;
  place-items: center;

  border-radius: 18px;

  font-size: 21px;
  font-weight: 950;

  background:
    linear-gradient(
      135deg,
      #fe2c55,
      #82142f
    );

  box-shadow:
    0 12px 35px
    rgba(254,44,85,.25);
}

.badge {
  display: inline-block;

  margin-top: 24px;
  margin-bottom: 12px;

  padding: 8px 12px;

  border-radius: 999px;

  border:
    1px solid
    ${error
      ? "rgba(255,59,92,.30)"
      : "rgba(37,244,238,.25)"};

  color:
    ${error ? "#ff3b5c" : "#25f4ee"};

  background:
    ${error
      ? "rgba(255,59,92,.05)"
      : "rgba(37,244,238,.05)"};

  font-size: 11px;
  font-weight: 900;

  letter-spacing: .10em;
}

h1 {
  margin: 8px 0 16px;

  font-size:
    clamp(32px, 7vw, 58px);

  line-height: 1;
  letter-spacing: -.05em;
}

p {
  color: #a7a7b2;
  line-height: 1.7;
}

.info {
  margin-top: 22px;
}

.info h3 {
  margin-bottom: 8px;
}

pre {
  padding: 17px;

  white-space: pre-wrap;
  word-break: break-word;

  border-radius: 15px;

  background: #08080c;

  border:
    1px solid
    rgba(255,255,255,.08);

  color: #dfe2e8;

  overflow-x: auto;
}

.btn {
  display: inline-block;

  margin-top: 18px;
  padding: 13px 18px;

  color: white;
  text-decoration: none;

  border-radius: 14px;

  font-weight: 850;

  background:
    linear-gradient(
      135deg,
      #fe2c55,
      #b9163d
    );
}

.note {
  margin-top: 18px;

  padding: 14px 16px;

  border-left:
    2px solid
    #25f4ee;

  color: #858591;

  background:
    rgba(37,244,238,.035);

  font-size: 12px;
  line-height: 1.6;
}

.small {
  color: #777782;
  font-size: 12px;
}
</style>
</head>

<body>

<main class="card">

  <div class="logo">
    BB
  </div>

  <div class="badge">
    ${escapeHTML(badge)}
  </div>

  <h1>
    ${escapeHTML(heading)}
  </h1>

  ${content}

</main>

</body>
</html>`;
}

// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "public", "index.html")
  );
});

// ==============================
// LOGIN
// ==============================

app.get("/login", (req, res) => {
  cleanOldStates();

  if (!CLIENT_SECRET) {
    return res.status(500).send(
      resultPage({
        title: "Configuration Error",
        badge: "SETUP REQUIRED",
        heading: "Client Secret belum diisi",
        error: true,
        content: `
          <p>
            Buka <b>server.js</b> lalu isi
            <b>CLIENT_SECRET</b> dengan Client Secret
            dari TikTok Developer Portal.
          </p>

          <a class="btn" href="/">
            Kembali
          </a>
        `
      })
    );
  }

  const state = crypto
    .randomBytes(32)
    .toString("hex");

  oauthStates.set(
    state,
    Date.now()
  );

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    response_type: "code",

    scope:
      "user.info.basic,video.list",

    redirect_uri:
      REDIRECT_URI,

    state
  });

  const authorizationURL =
    "https://www.tiktok.com/v2/auth/authorize/?" +
    params.toString();

  res.redirect(authorizationURL);
});

// ==============================
// CALLBACK
// ==============================

app.get("/callback", async (req, res) => {
  const {
    code,
    state,
    error,
    error_description
  } = req.query;

  // TikTok mengembalikan error.
  if (error) {
    return res.status(400).send(
      resultPage({
        title: "TikTok Error",
        badge: "TIKTOK ERROR",
        heading: "Authorization gagal",
        error: true,
        content: `
          <p>
            ${escapeHTML(
              error_description || error
            )}
          </p>

          <a class="btn" href="/">
            Kembali
          </a>
        `
      })
    );
  }

  // Code/state tidak ada.
  if (!code || !state) {
    return res.status(400).send(
      resultPage({
        title: "Invalid Request",
        badge: "INVALID REQUEST",
        heading: "Request tidak lengkap",
        error: true,
        content: `
          <p>
            TikTok tidak mengirim code atau state.
          </p>

          <a class="btn" href="/login">
            Authorize ulang
          </a>
        `
      })
    );
  }

  // Validasi OAuth state.
  if (!oauthStates.has(state)) {
    return res.status(400).send(
      resultPage({
        title: "Invalid State",
        badge: "SECURITY CHECK",
        heading: "OAuth state tidak valid",
        error: true,
        content: `
          <p>
            Session OAuth sudah kedaluwarsa atau
            state tidak cocok.
          </p>

          <a class="btn" href="/login">
            Authorize ulang
          </a>
        `
      })
    );
  }

  oauthStates.delete(state);

  try {

    // ==========================
    // EXCHANGE CODE → TOKEN
    // ==========================

    const tokenBody =
      new URLSearchParams({
        client_key:
          CLIENT_KEY,

        client_secret:
          CLIENT_SECRET,

        grant_type:
          "authorization_code",

        redirect_uri:
          REDIRECT_URI,

        code
      });

    const tokenResponse =
      await fetch(
        "https://open.tiktokapis.com/v2/oauth/token/",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },

          body: tokenBody
        }
      );

    const tokenData =
      await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      throw new Error(
        tokenData?.error_description ||
        tokenData?.error?.message ||
        `Token exchange HTTP ${tokenResponse.status}`
      );
    }

    const accessToken =
      tokenData.access_token;

    const refreshToken =
      tokenData.refresh_token || "";

    const scope =
      tokenData.scope || "";

    // ==========================
    // GET PROFILE
    // ==========================

    let profile = null;

    try {

      const profileURL =
        new URL(
          "https://open.tiktokapis.com/v2/user/info/"
        );

      profileURL.searchParams.set(
        "fields",
        [
          "open_id",
          "display_name",
          "avatar_url",
          "profile_deep_link"
        ].join(",")
      );

      const profileResponse =
        await fetch(profileURL, {
          headers: {
            Authorization:
              `Bearer ${accessToken}`
          }
        });

      const profileData =
        await profileResponse.json();

      if (
        profileResponse.ok &&
        profileData?.data?.user
      ) {
        profile =
          profileData.data.user;
      }

    } catch (profileError) {

      console.error(
        "Profile request error:",
        profileError.message
      );

    }

    // ==========================
    // TEST VIDEO.LIST
    // ==========================

    let videos = [];

    let videoMessage =
      "video.list belum diuji.";

    const scopes =
      scope
        .split(",")
        .map(s => s.trim());

    if (
      scopes.includes("video.list")
    ) {

      try {

const videoResponse =
  await fetch(
    "https://open.tiktokapis.com/v2/video/list/?fields=id,title,video_description,create_time,cover_image_url,share_url,embed_link",
    {
              method: "POST",

              headers: {
                Authorization:
                  `Bearer ${accessToken}`,

                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                max_count: 20
              })
            }
          );

        const videoData =
          await videoResponse.json();

        if (
          videoResponse.ok &&
          Array.isArray(
            videoData?.data?.videos
          )
        ) {

          videos =
            videoData.data.videos;

          videoMessage =
            `video.list aktif — ${videos.length} video berhasil dibaca.`;

        } else {

          videoMessage =
            videoData?.error?.message ||
            videoData?.message ||
            "video.list gagal diuji.";

        }

      } catch (videoError) {

        videoMessage =
          videoError.message;

      }

    } else {

      videoMessage =
        "Scope video.list tidak diberikan oleh TikTok.";

    }

    // ==========================
    // SUCCESS PAGE
    // ==========================

    const displayName =
      profile?.display_name ||
      "TikTok User";

    return res.send(
      resultPage({
        title: "TikTok Connected",
        badge: "OAUTH SUCCESS",
        heading: "TikTok berhasil terhubung.",
        content: `

          <p>
            <b>Akun:</b>
            ${escapeHTML(displayName)}
          </p>

          <p>
            <b>Scope:</b>
            ${escapeHTML(
              scope || "(tidak dikembalikan)"
            )}
          </p>

          <p>
            <b>Display API:</b>
            ${escapeHTML(videoMessage)}
          </p>

          <div class="info">

            <h3>
              Access Token
            </h3>

            <pre>${escapeHTML(
              accessToken
            )}</pre>

            <h3>
              Refresh Token
            </h3>

            <pre>${escapeHTML(
              refreshToken ||
              "(tidak tersedia)"
            )}</pre>

          </div>

          <div class="note">
            Access Token dan Refresh Token adalah
            kredensial sensitif. Jangan membagikannya.
          </div>

          <a class="btn" href="/">
            Selesai
          </a>
        `
      })
    );

  } catch (error) {

    console.error(
      "TikTok OAuth error:",
      error
    );

    return res.status(500).send(
      resultPage({
        title: "OAuth Failed",
        badge: "OAUTH FAILED",
        heading: "Gagal menghubungkan TikTok",
        error: true,
        content: `

          <p>
            ${escapeHTML(
              error.message ||
              String(error)
            )}
          </p>

          <a class="btn" href="/login">
            Authorize ulang
          </a>
        `
      })
    );
  }
});

// ==============================
// HEALTH CHECK
// ==============================

app.get("/health", (req, res) => {

  res.json({
    ok: true,
    service:
      "BALITA BOT TikTok OAuth",
    timestamp:
      new Date().toISOString()
  });

});

// ==============================
// START
// ==============================

app.listen(
  PORT,
  "0.0.0.0",
  () => {

    console.log(
      `BALITA BOT TikTok OAuth running on port ${PORT}`
    );

    console.log(
      `Redirect URI: ${REDIRECT_URI}`
    );

  }
);
