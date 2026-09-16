const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const YOUR_TELEGRAM_ID = "1889752716";

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is missing");
  process.exit(1);
}

app.use(express.json({ limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

app.post("/send-photo", async (req, res) => {
  try {
    const { image } = req.body;

    if (!image || !image.startsWith("data:image/")) {
      return res.status(400).json({
        ok: false,
        error: "Invalid image"
      });
    }

    const base64 = image.split(",")[1];
    const buffer = Buffer.from(base64, "base64");

    const form = new FormData();

    form.append("chat_id", YOUR_TELEGRAM_ID);

    form.append(
      "photo",
      new Blob([buffer], { type: "image/jpeg" }),
      "photo.jpg"
    );

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`,
      {
        method: "POST",
        body: form
      }
    );

    const result = await telegramResponse.json();

    if (!result.ok) {
      console.error(result);

      return res.status(500).json({
        ok: false,
        error: "Telegram error"
      });
    }

    res.json({ ok: true });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      error: "Server error"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
