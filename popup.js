const shortenButton = document.getElementById("shortenButton");
const resultElement = document.getElementById("result");
const copyElement = document.getElementById("copy");
const messageTypes = [
  "message-error",
  "message-success",
  "message-warning",
  "message-info",
];

function setMessage(element, message, type) {
  element.textContent = message;
  element.classList.remove(...messageTypes);
  if (type) element.classList.add(`message-${type}`);
}

shortenButton.addEventListener("click", async () => {
  shortenButton.disabled = true;
  setMessage(resultElement, "");
  setMessage(copyElement, "");

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
    setMessage(resultElement, `Shortened URL: ${shortURL}`, "success");

    try {
      await navigator.clipboard.writeText(shortURL);
      setMessage(copyElement, "URL copied to clipboard.", "success");
    } catch {
      setMessage(
        copyElement,
        "Could not copy automatically. Select and copy the URL above.",
        "warning",
      );
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
    setMessage(
      resultElement,
      error.message || "Unable to shorten this URL.",
      "error",
    );
  } finally {
    shortenButton.disabled = false;
  }
});
