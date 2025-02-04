import { useState } from "react";
import Image from "next/image";

const ScreenshotGenerator = () => {
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      link.download = "screenshot.png"; // Set the default file name
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 bg-white rounded-lg">
      <h2 className="text-3xl font-bold text-center mb-6">
        Generate Social Media Screenshots
      </h2>

      <div className="flex flex-col gap-4">
        {/* ✅ Input field for URL */}
        <input
          type="text"
          placeholder="Enter Tweet or Instagram Post URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input input-bordered w-full p-3"
        />

        {/* ✅ Toggle switches for customization */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-lg mb-3">Customize Screenshot</h3>
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideComments}
                onChange={() => setHideComments(!hideComments)}
                className="toggle toggle-primary"
              />
              <span>Hide Comments</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideRetweets}
                onChange={() => setHideRetweets(!hideRetweets)}
                className="toggle toggle-primary"
              />
              <span>Hide Retweets</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideLikes}
                onChange={() => setHideLikes(!hideLikes)}
                className="toggle toggle-primary"
              />
              <span>Hide Likes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hideBookmarks}
                onChange={() => setHideBookmarks(!hideBookmarks)}
                className="toggle toggle-primary"
              />
              <span>Hide Bookmarks</span>
            </label>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading
            ? "Generating screenshot..."
            : screenshot
            ? "Update Screenshot"
            : "Generate Screenshot"}
        </button>
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
          <button className="mt-4 btn btn-primary" onClick={handleDownload}>
            Download Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGenerator;
