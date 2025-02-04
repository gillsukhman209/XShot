import { useState } from "react";
import Image from "next/image";

const ScreenshotGenerator = () => {
  const [url, setUrl] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({ url }),
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

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">
        Generate Social Media Screenshots
      </h2>

      <div className="flex flex-col gap-4">
        {/* ✅ UPDATED INPUT FIELD */}
        <input
          type="text"
          placeholder="Enter Tweet or Instagram Post URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="input input-bordered w-full p-3"
        />

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="btn btn-primary w-full"
        >
          {loading ? "Generating screenshot..." : "Generate Screenshot"}
        </button>
      </div>

      {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {screenshot && (
        <div className="mt-6 flex flex-col items-center">
          <h3 className="text-lg font-semibold">Preview</h3>
          <Image
            src={screenshot}
            alt="Generated Screenshot"
            width={500}
            height={300}
            className="mt-4 border rounded-lg shadow-md"
          />
          <button
            className="mt-4 btn btn-success"
            onClick={() => window.open(screenshot, "_blank")}
          >
            Download Image
          </button>
        </div>
      )}
    </div>
  );
};

export default ScreenshotGenerator;
