document.getElementById('shortenButton').addEventListener('click', async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const currentTab = tabs[0];
        const url = currentTab.url;

        if (url) {
            try {
                const response = await fetch('https://shortme-backend.onrender.com/url', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url: url })
                });
                const data = await response.json();
                const shortURL = `https://shortme-backend.onrender.com/${data.id}`;
                const resultElement = document.getElementById('result');
                const copyElement = document.getElementById('copy');
                const copy = await navigator.clipboard.writeText(shortURL);
                resultElement.innerHTML = `<span style='color:red; font-weight:bold'>Shortened URL</span>:<span style='font-weight:bold'>${shortURL}</span>`;
                if (copyElement) {
                    copyElement.innerHTML = `<span style='color:green; font-weight:bold'>URL has been copied to clipboard</span>`;
                }

                document.getElementById('shareOnWhatsApp').onclick = () => {
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shortURL)}`, '_blank');
                };

                document.getElementById('shareOnGmail').onclick = () => {
                    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=Hello From ShortMe&body=${encodeURIComponent(shortURL)}`, '_blank');
                };

                document.getElementById('shareOnTwitter').onclick = () => {
                    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shortURL)}`, '_blank');
                };


            } catch (error) {
                document.getElementById('result').innerText = `Error shortening URL ${error}`;
            }
        } else {
            document.getElementById('result').innerText = 'Please enter a URL';
        }

    });
});
