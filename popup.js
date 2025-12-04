document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const statusEl = document.getElementById("status");
  const resultEl = document.getElementById("result");

  analyzeBtn.addEventListener("click", async () => {
    statusEl.textContent = "Getting current tab...";
    resultEl.textContent = "";

    // Get current active tab
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];

      if (!tab || !tab.url) {
        statusEl.textContent = "Could not detect current tab URL.";
        return;
      }

      const url = tab.url;

      if (!url.includes("youtube.com/watch")) {
        statusEl.textContent = "Please open a YouTube video (watch page).";
        return;
      }

      statusEl.textContent = "Sending to backend for analysis...";

      try {
        const response = await fetch("https://conclude-854031402358.europe-west1.run.app/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_url: url })
        });

        const data = await response.json();

        if (!response.ok) {
          statusEl.textContent = "Backend error.";
          resultEl.textContent =
            data.detail ||
            data.error ||
            JSON.stringify(data, null, 2);
          return;
        }

        statusEl.textContent = "Done ✅";

        // Your FastAPI currently returns: video_id, message, transcript_excerpt, analysis
        const { analysis, transcript_excerpt } = data;

        resultEl.textContent =
          (analysis || "No analysis returned.") +
          "\n\n---\n\nTranscript preview:\n" +
          (transcript_excerpt || "[no preview]");
      } catch (err) {
        console.error(err);
        statusEl.textContent = "Request failed.";
        resultEl.textContent = String(err);
      }
    });
  });
});
