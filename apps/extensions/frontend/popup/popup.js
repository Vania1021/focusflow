document.addEventListener('DOMContentLoaded', () => {
    const bionicToggle = document.getElementById('bionic-toggle');
    const meetToggle = document.getElementById('meet-toggle');

    // 1. Load saved states from storage
    chrome.storage.local.get(['bionicEnabled', 'meetEnabled'], (result) => {
        bionicToggle.checked = result.bionicEnabled || false;
        meetToggle.checked = result.meetEnabled || false;
    });

    // 2. Bionic Reading Logic (Web Pages)
    bionicToggle.addEventListener('change', () => {
        const isEnabled = bionicToggle.checked;
        chrome.storage.local.set({ bionicEnabled: isEnabled });
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, { 
                    type: 'TOGGLE_BIONIC', 
                    value: isEnabled 
                });
            }
        });
    });

    // 3. Meet Assistant Logic (Audio Capture)
    meetToggle.addEventListener('change', async () => {
        const isEnabled = meetToggle.checked;
        chrome.storage.local.set({ meetEnabled: isEnabled });

        if (isEnabled) {
            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
            const tab = tabs[0];

            if (!tab || !tab.url || tab.url.startsWith('chrome://')) {
                alert("Please use FocusFlow on a valid website (Google Meet, YouTube, etc).");
                meetToggle.checked = false;
                return;
            }
            
            // Request tab capture permission
            chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id }, (streamId) => {
                if (chrome.runtime.lastError) {
                    console.warn("Capture failed:", chrome.runtime.lastError.message);
                    meetToggle.checked = false;
                    return;
                }

                // Start recording loop in background.js
                chrome.runtime.sendMessage({ 
                    type: 'START_RECORDING', 
                    streamId: streamId 
                });

                // Notify meet.js to show the dashboard
                chrome.tabs.sendMessage(tab.id, { type: 'RECORDING_STATUS', status: 'active' });
            });

        } else {
            // Stop recording logic
            chrome.runtime.sendMessage({ type: 'STOP_RECORDING' });
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs[0]?.id) {
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'RECORDING_STATUS', status: 'inactive' });
                }
            });
        }
    });
});