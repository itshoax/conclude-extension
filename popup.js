document.addEventListener("DOMContentLoaded", () => {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const statusEl = document.getElementById("status");
  const resultEl = document.getElementById("result");

  function renderStructuredResult(summary, inShort, conclusion) {
    const container = document.createElement("div");

    // Summary
    if (summary && summary.length) {
      const h = document.createElement("h4");
      h.textContent = "Summary";
      container.appendChild(h);

      const ul = document.createElement("ul");
      summary.forEach(point => {
        const li = document.createElement("li");
        li.textContent = point;
        ul.appendChild(li);
      });
      container.appendChild(ul);
    }

    // In short
    if (inShort) {
      const div = document.createElement("div");
      div.className = "in-short";
      div.textContent = "In short: " + inShort;
      container.appendChild(div);
    }

    // Conclusion
    if (conclusion) {
      const h = document.createElement("h4");
      h.textContent = "Conclusion";
      container.appendChild(h);

      const p = document.createElement("p");
      p.textContent = conclusion;
      container.appendChild(p);
    }

    return container;
  }


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

        const { summary, in_short, conclusion } = data;

        resultEl.innerHTML = "";
        resultEl.appendChild(
          renderStructuredResult(summary, in_short, conclusion)
        );
      } catch (err) {
        console.error(err);
        statusEl.textContent = "Request failed.";
        resultEl.textContent = String(err);
      }
    });
  });
});
