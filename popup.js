const shortenButton = document.getElementById("shortenButton");
const resultElement = document.getElementById("result");
const copyElement = document.getElementById("copy");

shortenButton.addEventListener("click", async () => {
  shortenButton.disabled = true;
  resultElement.textContent = "";
  copyElement.textContent = "";

  try {
    const [currentTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!currentTab?.url) {
      throw new Error("Could not read the active tab URL.");
    }

    const response = await fetch("https://shortme-backend.onrender.com/url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: currentTab.url }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.error || data.message || `Request failed (${response.status}).`,
      );
    }
    if (typeof data.id !== "string" || !data.id) {
      throw new Error("The server returned an invalid short URL.");
    }

    const shortURL = `https://shortme-backend.onrender.com/${data.id}`;
    resultElement.textContent = `Shortened URL: ${shortURL}`;

    try {
      await navigator.clipboard.writeText(shortURL);
      copyElement.textContent = "URL copied to clipboard.";
    } catch {
      copyElement.textContent =
        "Could not copy automatically. Select and copy the URL above.";
    }

    document.getElementById("shareOnWhatsApp").onclick = () => {
      window.open(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(shortURL)}`,
        "_blank",
      );
    };
    document.getElementById("shareOnGmail").onclick = () => {
      window.open(
        `https://mail.google.com/mail/?view=cm&fs=1&su=Hello From ShortMe&body=${encodeURIComponent(shortURL)}`,
        "_blank",
      );
    };
    document.getElementById("shareOnTwitter").onclick = () => {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shortURL)}`,
        "_blank",
      );
    };
  } catch (error) {
    resultElement.textContent = error.message || "Unable to shorten this URL.";
  } finally {
    shortenButton.disabled = false;
  }
});
