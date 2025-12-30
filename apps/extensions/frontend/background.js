chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    
    if (msg.type === 'CHAT_REQUEST') {
        
        fetch('http://localhost:3000/chat/explain', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(msg.payload)
        })
        .then(res => res.json())
        .then(data => {
            // Backend returns { reply: "..." }, so we send data.reply back
            sendResponse({ success: true, data: data.reply });
        })
        .catch(err => {
            console.error("Fetch Error:", err);
            sendResponse({ success: false, error: "Backend error: " + err.message });
        });

        return true; 
    }

    if (msg.type === 'START_RECORDING') {
        setupOffscreen().then(() => {
            chrome.runtime.sendMessage({ 
                type: 'INIT_STREAM', 
                streamId: msg.streamId 
            });
        });
    }
});

async function setupOffscreen() {
    if (await chrome.offscreen.hasDocument()) return;
    await chrome.offscreen.createDocument({
        url: 'src/offscreen.html',
        reasons: ['USER_MEDIA'],
        justification: 'Recording meeting audio'
    });
}