import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
const ScreenshotGenerator = ({ user }) => {
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileType, setFileType] = useState("png"); // State for file type selection

  // Toggle states for hiding elements
  const [hideComments, setHideComments] = useState(false);
  const [hideBookmarks, setHideBookmarks] = useState(false);
  const [hideLikes, setHideLikes] = useState(false);
  const [hideRetweets, setHideRetweets] = useState(false);

  const handleGenerate = async () => {
    if (!url.trim()) {
      setError("Please enter a valid URL.");
      return;
    }
    setLoading(true);
    setError("");
    setScreenshot(null);

    try {
      const response = await fetch("/api/twitter/screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          hideLikes,
          hideComments,
          hideBookmarks,
          hideRetweets,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setScreenshot(data.screenshotUrl);
      } else {
        setError(data.error || "Failed to generate screenshot.");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (screenshot) {
      const link = document.createElement("a");
      link.href = screenshot;
      link.download = `screenshot.${fileType}`; // Set the file name based on selected type
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 bg-white rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">
        X Screenshots in 1-Click
      </h2>

      <div className="flex flex-col gap-4">
        {/* ✅ Input field for URL */}
        <input
          type="text"
          placeholder="Enter Tweet or Instagram Post URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input input-bordered input-primary border-2  w-full p-4 mt-4 "
        />

        {/* ✅ Toggle switches for customization */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-3">
            Customize Screenshot{" "}
            {user.subscriptionPlan === "free" && "(Upgrade to customize)"}
          </h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideComments}
                onChange={() =>
                  user.subscriptionPlan !== "free" &&
                  setHideComments(!hideComments)
                }
                className={`toggle toggle-primary ${
                  user.subscriptionPlan === "free"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                disabled={user.subscriptionPlan === "free"}
              />
              <span>Hide Comments</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideRetweets}
                onChange={() =>
                  user.subscriptionPlan !== "free" &&
                  setHideRetweets(!hideRetweets)
                }
                className={`toggle toggle-primary ${
                  user.subscriptionPlan === "free"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                disabled={user.subscriptionPlan === "free"}
              />
              <span>Hide Retweets</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideLikes}
                onChange={() =>
                  user.subscriptionPlan !== "free" && setHideLikes(!hideLikes)
                }
                className={`toggle toggle-primary ${
                  user.subscriptionPlan === "free"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                disabled={user.subscriptionPlan === "free"}
              />
              <span>Hide Likes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideBookmarks}
                onChange={() =>
                  user.subscriptionPlan !== "free" &&
                  setHideBookmarks(!hideBookmarks)
                }
                className={`toggle toggle-primary ${
                  user.subscriptionPlan === "free"
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                disabled={user.subscriptionPlan === "free"}
              />
              <span>Hide Bookmarks</span>
            </label>
          </div>
        </div>

        {user.screenshotsLeft > 0 ? (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn btn-primary w-full "
          >
            {loading
              ? "Generating screenshot..."
              : screenshot && user.subscriptionPlan !== "free"
              ? "Customize Screenshot"
              : "Generate Screenshot"}
          </button>
        ) : (
          <Link href="/dashboard/pricing">
            <button className="btn btn-success text-white">
              You have no screenshots left. Upgrade for unlimited screenshots!
            </button>
          </Link>
        )}

        {user.subscriptionPlan === "free" && !screenshot && (
          <Link href="/dashboard/pricing">
            <button className="btn btn-success  text-white w-full">
              Upgrade to customize
            </button>
          </Link>
        )}
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {screenshot && (
        <div className="mt-6 flex flex-col items-center ">
          <Image
            src={screenshot}
            alt="Generated Screenshot"
            width={500}
            height={300}
            className="mt-4 border rounded-lg shadow-2xl"
          />
          <div className="flex flex-col ">
            {screenshot && (
              <div className="flex items-center mt-4 ">
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="select select-bordered p-2 w-full text-center "
                >
                  <option value=""></option>
                  <option value="png">PNG</option>
                  <option value="jpg">JPG</option>
                  <option value="jpeg">JPEG</option>
                </select>
                <button
                  className="ml-3 btn btn-primary"
                  onClick={handleDownload}
                >
                  Download Image
                </button>
              </div>
            )}

            {user.subscriptionPlan === "free" && (
              <Link href="/dashboard/pricing">
                <button className="btn btn-success text-white mt-4">
                  Remove Watermark + Unlimited Screenshots
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGenerator;
