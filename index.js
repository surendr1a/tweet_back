import express from "express";
import cors from "cors";
import puppeteer from "puppeteer";

const app = express();
// app.use(cors());
app.use(cors({
  origin: "https://tweet2pic.vercel.app"  // frontend ki exact URL yahan daalo
}));
app.use(express.json());

app.post("/generate", async (req, res) => {
  console.log("📩 Request received at /generate");

  const { tweetUrl } = req.body;
  console.log("📝 Tweet URL received:", tweetUrl);

  if (!tweetUrl) {
    console.warn("⚠️ No Tweet URL provided");
    return res.status(400).json({ error: "Tweet URL is required" });
  }

  try {
    console.log("🚀 Launching Puppeteer...");
    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // executablePath: '/usr/bin/google-chrome-stable'  // Render ke liye Chrome path
    });

    console.log("🌐 Opening new page...");
    const page = await browser.newPage();

    console.log(`🔗 Navigating to: ${tweetUrl}`);
    await page.goto(tweetUrl, { waitUntil: "networkidle2" });
    console.log("✅ Page loaded successfully");

    console.log("📸 Taking screenshot...");
    const screenshotBuffer = await page.screenshot({ fullPage: true });
    console.log("✅ Screenshot captured");

    console.log("🛑 Closing browser...");
    await browser.close();
    console.log("✅ Browser closed");

    const base64Image = `data:image/png;base64,${screenshotBuffer.toString("base64")}`;
    console.log("📦 Image converted to Base64");

    console.log("📤 Sending image response to frontend");
    res.json({ image: base64Image, message: "✅ Screenshot generated successfully" });

  } catch (error) {
    console.error("❌ Error occurred while capturing tweet image:", error);
    res.status(500).json({ error: "Failed to capture tweet image" });
  }
});

app.listen(5000, () => {
  console.log("✅ Server running on http://localhost:5000");
});
