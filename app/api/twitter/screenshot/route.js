import puppeteer from "puppeteer";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export async function POST(req) {
  await connectMongo();
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return Response.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const { url } = await req.json();

    if (!url.includes("x.com") && !url.includes("instagram.com")) {
      return Response.json(
        { error: "Invalid URL. Only Twitter & Instagram are supported." },
        { status: 400 }
      );
    }

    // Launch Puppeteer with anti-detection settings
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--enable-webgl",
        "--window-size=1200,800",
        "--disable-dev-shm-usage",
      ],
    });

    const page = await browser.newPage();

    // ✅ Spoof real browser behavior
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );
    await page.setViewport({ width: 1200, height: 800 });

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    // ✅ Go to the tweet URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // ✅ Wait for the tweet container to appear
    await page.waitForSelector("article"); // Tweets are inside <article> tags
    await page.evaluate(() => {
      document.querySelector(
        "#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > div.css-175oi2r.r-aqfbo4.r-gtdqiz.r-1gn8etr.r-1g40b8q > div:nth-child(1) > div > div > div > div > div"
      ).style.display = "none";
    });
    await page.evaluate(() => {
      document.querySelector(
        "#react-root > div > div > div.css-175oi2r.r-1f2l425.r-13qz1uu.r-417010.r-18u37iz > main > div > div > div > div > div > div.css-175oi2r.r-aqfbo4.r-gtdqiz.r-1gn8etr.r-1g40b8q > div:nth-child(1) > div > div > div > div"
      ).style.display = "none";
    });
    // ✅ Hide annoying popups before taking a screenshot
    await page.evaluate(() => {
      const popup = document.querySelector(
        "#layers > div > div:nth-child(1) > div > div > div"
      ); // X popups usually have this role
      if (popup) {
        popup.style.display = "none";
      }
    });
    // ✅ Select the tweet element
    const tweetElement = await page.$("article");

    if (!tweetElement) {
      throw new Error("Tweet not found.");
    }

    // ✅ Take a screenshot of ONLY the tweet
    const screenshotBuffer = await tweetElement.screenshot({
      encoding: "base64",
    });

    console.log("before", user.screenshotsLeft);
    user.screenshotsLeft -= 1;
    console.log("after", user.screenshotsLeft);
    await user.save();

    await browser.close();

    return Response.json(
      { screenshotUrl: `data:image/png;base64,${screenshotBuffer}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("Screenshot error:", error);
    return Response.json(
      { error: "Failed to capture tweet." },
      { status: 500 }
    );
  }
}
