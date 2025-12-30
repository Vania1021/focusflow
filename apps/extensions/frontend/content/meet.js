// apps/extensions/frontend/content/meet.js

let dashboard = null;
let bionicActive = false;
let transcriptText = "";
let currentNuggetContent = "";
let meetChatHistory = [];

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'RECORDING_STATUS') {
        if (msg.status === 'active') createDashboard();
        else if (dashboard) { dashboard.remove(); dashboard = null; }
    }
});

function createDashboard() {
    if (dashboard) return;
    dashboard = document.createElement('div');
    dashboard.className = "ff-dashboard"; 
    dashboard.style.cssText = `position: fixed; bottom: 80px; right: 20px; width: 450px; height: 550px;`;

    dashboard.innerHTML = `
        <div class="ff-header" id="ff-drag-handle" style="background:#10a37f; color:white; padding:12px; cursor:move; display:flex; justify-content:space-between; align-items:center;">
            <strong>FocusFlow Meet</strong>
            <label style="font-size:12px; cursor:pointer;"><input type="checkbox" id="meet-bionic"> Bionic Mode</label>
        </div>
        <div class="ff-tabs">
            <button id="t-a" class="active">Live Feed</button>
            <button id="t-b">Smart Nuggets</button>
            <button id="t-c">Assistant</button>
            <button id="t-d">Visual</button> </div>
        <div id="ff-meet-body" style="height: calc(100% - 100px); overflow: hidden;">
            <div id="v-a" class="view" style="height: 100%; overflow-y: auto;">
                <div id="live-transcript-area">Waiting for audio stream...</div>
            </div>
            <div id="v-b" class="view" style="display:none; height: 100%; overflow-y: auto;">
                <select id="nugget-format" style="width:100%; padding:8px; margin-bottom:10px;">
                    <option value="bullets">Bullets</option>
                    <option value="para">Paragraph</option>
                </select>
                <div id="nugget-content">Analyzing lecture context...</div>
            </div>
            <div id="v-c" class="view" style="display:none; flex-direction:column; height:100%;">
                <div id="meet-chat-history" style="flex:1; overflow-y:auto;"></div>
                <div style="display:flex; padding:10px; border-top:1px solid #eee; gap:5px;">
                    <input type="text" id="meet-chat-input" placeholder="Ask about lecture..." style="flex:1; padding:8px; border-radius:4px; border:1px solid #ddd;">
                    <button id="meet-send" style="background:#10a37f; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">➤</button>
                </div>
            </div>
<div id="v-d" class="view" style="display:none; flex-direction:column; height:100%;">
    <div style="display:flex; gap:5px; margin-bottom:10px;">
        <button id="trigger-ocr" style="flex:2; background:#10a37f; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">🔍 Select Area</button>
        <button id="visual-shredder" style="flex:1; background:#0ea5e9; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">✂️ Shred</button>
        <button id="visual-onenote" style="flex:1; background:#773b9a; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer;">💜 OneNote</button>
    </div>
    <div id="visual-output" style="max-height:120px; overflow-y:auto; background:#f0f9ff; padding:8px; border-radius:5px; font-size:13px; margin-bottom:10px;">Select area to explain...</div>
    
    <div id="visual-chat-history" style="flex:1; overflow-y:auto; border-top:1px solid #ddd; padding-top:10px;"></div>
    <div style="display:flex; padding:10px; gap:5px; border-top:1px solid #eee;">
        <input type="text" id="visual-chat-input" placeholder="Ask about selection..." style="flex:1; padding:8px; border-radius:4px; border:1px solid #ddd;">
        <button id="visual-chat-send" style="background:#10a37f; color:white; border:none; padding:0 15px; border-radius:4px; cursor:pointer;">➤</button>
    </div>
</div>
        </div>
    `;
    document.body.appendChild(dashboard);
    makeDraggable(dashboard, document.getElementById('ff-drag-handle'));
    setupDashboardActions();
}

function setupDashboardActions() {
    // Bionic Toggle
    const bionicToggle = document.getElementById('meet-bionic');
    if (bionicToggle) {
        bionicToggle.onchange = (e) => {
            bionicActive = e.target.checked;
            updateUI(); 
        };
    }

    // Tab Switching (Updated to include t-d and v-d)
    const tabs = ['t-a', 't-b', 't-c', 't-d'];
    tabs.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.onclick = () => {
                tabs.forEach(t => {
                    document.getElementById(t).classList.remove('active');
                    const view = document.getElementById('v-' + t.split('-')[1]);
                    if (view) view.style.display = 'none';
                });
                btn.classList.add('active');
                const target = document.getElementById('v-' + id.split('-')[1]);
                if (target) target.style.display = (id === 't-c' || id === 't-d') ? 'flex' : 'block';
            };
        }
    });

    // Assistant Chat Logic
    const sendBtn = document.getElementById('meet-send');
    const input = document.getElementById('meet-chat-input');
    if (sendBtn) {
        sendBtn.onclick = async () => {
            const text = input.value.trim();
            if (!text) return;
            addMeetMsg(text, 'user');
            input.value = '';
            try {
                const res = await fetch('http://localhost:3000/media/meet-chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text, history: meetChatHistory })
                });
                const data = await res.json();
                addMeetMsg(data.reply, 'bot');
                meetChatHistory.push({ role: "user", content: text }, { role: "assistant", content: data.reply });
            } catch (e) { addMeetMsg("Assistant offline. Check server connectivity.", 'bot'); }
        };
    }

    // Polling for Smart Nuggets
    setInterval(async () => {
    if (!dashboard) return; 
    try {
        const formatEl = document.getElementById('nugget-format');
        const format = formatEl ? formatEl.value : 'bullets';
        
        const res = await fetch(`http://localhost:3000/media/meeting-summary?format=${format}`);
        if (!res.ok) throw new Error("Backend Error: " + res.status);
        
        const data = await res.json();
        
        // Ensure transcript is updating even if summary fails
        transcriptText = data.fullTranscript || transcriptText;
        currentNuggetContent = data.reply || currentNuggetContent;
        
        updateUI();
    } catch (e) { 
        console.warn("Polling failed:", e.message); 
    }
}, 10000);

    // Visual Tab: OCR Trigger
    document.getElementById('trigger-ocr').onclick = () => {
        if (typeof startVisualSelection === "function") {
            startVisualSelection(); 
        } else {
            console.error("FocusFlow: vision.js logic not loaded.");
        }
    };

// Use securityLevel: 'loose' if you need to render HTML labels
mermaid.initialize({ 
    startOnLoad: false, 
    theme: 'neutral',
    securityLevel: 'loose' 
});

// 2. Updated Shredder logic using mermaid.run()
document.getElementById('trigger-shredder').onclick = async () => {
    const output = document.getElementById('visual-output');
    output.innerHTML = "Generating flowchart...";
    try {
        const res = await fetch('http://localhost:3000/vision/shredder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: transcriptText })
        });
        const data = await res.json();
        
        // Use textContent to prevent XSS or parsing issues
        output.innerHTML = `<pre class="mermaid">${data.mermaidCode}</pre>`;
        
        // Use mermaid.run() instead of init()
        await mermaid.run({
            nodes: output.querySelectorAll('.mermaid')
        });
    } catch (e) { 
        output.innerHTML = "Error: " + e.message; 
    }
};

// Variable to store the context for the visual chat
let lastOcrResult = "";
let visualChatHistory = [];

// 1. Mermaid v10 Fix (Use run instead of init)
const handleShredder = async () => {
    const output = document.getElementById('visual-output');
    output.innerHTML = "Generating flowchart...";
    try {
        const res = await fetch('http://localhost:3000/media/shredder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript: transcriptText })
        });
        const data = await res.json();
        output.innerHTML = `<pre class="mermaid">${data.mermaidCode}</pre>`;
        // FIX: Re-run mermaid for the new element
        await mermaid.run({ nodes: output.querySelectorAll('.mermaid') });
    } catch (e) { output.innerHTML = "Error: " + e.message; }
};
document.getElementById('visual-shredder').onclick = handleShredder;
document.getElementById('trigger-shredder').onclick = handleShredder;

// 2. Visual Chat logic
document.getElementById('visual-chat-send').onclick = async () => {
    const input = document.getElementById('visual-chat-input');
    const text = input.value.trim();
    if (!text || !lastOcrResult) return;
    
    addVisualMsg(text, 'user');
    input.value = '';
    
    const res = await fetch('http://localhost:3000/vision/ocr-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, ocrContext: lastOcrResult, history: visualChatHistory })
    });
    const data = await res.json();
    addVisualMsg(data.reply, 'bot');
    visualChatHistory.push({ role: "user", content: text }, { role: "assistant", content: data.reply });
};

// 3. Shared OneNote Logic
const triggerOneNote = () => {
    const content = document.getElementById('nugget-content').innerText || document.getElementById('visual-output').innerText;
    exportToOneNote(content); // Existing function
};
document.getElementById('visual-onenote').onclick = triggerOneNote;
}

// Listen for OCR results from vision.js
window.addEventListener("message", async (event) => {
    if (event.data.type === 'OCR_CAPTURE_READY') {
        const output = document.getElementById('visual-output');
        if (!output) return;
        
        output.innerText = "Analyzing selection...";
        try {
            const res = await fetch('http://localhost:3000/vision/ocr-explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: event.data.image })
            });
            const data = await res.json();
            output.innerHTML = bionicActive ? applyBionic(data.reply) : data.reply;
        } catch (e) { output.innerText = "OCR analysis failed."; }
    }
});

function addVisualMsg(text, sender) {
    const hist = document.getElementById('visual-chat-history');
    if (!hist) return;
    const msg = document.createElement('div');
    msg.className = `ff-msg ${sender}`;
    msg.innerHTML = bionicActive ? applyBionic(text) : text;
    hist.appendChild(msg);
    hist.scrollTop = hist.scrollHeight;
}

function applyBionic(text) {
    if (!text) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<span>${text}</span>`, 'text/html');
    
    const bionicifyNode = (node) => {
        if (node.nodeType === 3) { // Text node
            const words = node.textContent.split(/([\s\n]+)/);
            const bionicWords = words.map(w => {
                if (w.trim().length < 2) return w;
                const m = Math.ceil(w.length / 2);
                return `<b>${w.slice(0, m)}</b>${w.slice(m)}`;
            }).join('');
            
            const span = document.createElement('span');
            span.innerHTML = bionicWords;
            node.replaceWith(span);
        } else {
            node.childNodes.forEach(child => bionicifyNode(child));
        }
    };

    bionicifyNode(doc.body.firstChild);
    return doc.body.firstChild.innerHTML;
}

function formatADHD(text) {
    if (!text) return "";
    
    // 1. Spacing
    let html = text.replace(/\n\n/g, '<br><br>');

    // 2. Custom Highlights
    html = html.replace(/\[TASK\]/g, '<span class="highlight-task">TASK:</span>');
    html = html.replace(/\[DEF\]/g, '<span class="highlight-def">DEF:</span>');
    html = html.replace(/\[KEY\]/g, '<span class="highlight-key">KEY:</span>');

    // 3. APPLY BIONIC LAST
    return bionicActive ? applyBionic(html) : html;
}

function updateUI() {
    const feed = document.getElementById('live-transcript-area');
    const nugget = document.getElementById('nugget-content');
    if (feed) feed.innerHTML = bionicActive ? applyBionic(transcriptText) : transcriptText;
    if (nugget) nugget.innerHTML = formatADHD(currentNuggetContent); // Uses advanced formatting
}


function addMeetMsg(text, sender) {
    const hist = document.getElementById('meet-chat-history');
    if (!hist) return;
    const msg = document.createElement('div');
    msg.className = `ff-msg ${sender}`;
    msg.innerHTML = bionicActive ? applyBionic(text) : text;
    hist.appendChild(msg);
    hist.scrollTop = hist.scrollHeight;
}

function makeDraggable(el, handle) {
    let p1 = 0, p2 = 0, p3 = 0, p4 = 0;
    handle.onmousedown = (e) => {
        p3 = e.clientX; p4 = e.clientY;
        document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
        document.onmousemove = (e) => {
            p1 = p3 - e.clientX; p2 = p4 - e.clientY;
            p3 = e.clientX; p4 = e.clientY;
            el.style.top = (el.offsetTop - p2) + "px";
            el.style.left = (el.offsetLeft - p1) + "px";
            el.style.bottom = "auto"; el.style.right = "auto";
        };
    };
}


async function exportToOneNote() {
    const content = document.getElementById('nugget-content').innerText;
    // Simple POST to Microsoft Graph OneNote endpoint
    const res = await fetch('https://graph.microsoft.com/v1.0/me/onenote/pages', {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${userAccessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: "FocusFlow: " + new Date().toLocaleDateString(),
            content: `<html><body>${content}</body></html>`
        })
    });
    if(res.ok) alert("Exported to OneNote!");
}


let lastInteraction = Date.now();
const QUIZ_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Track user activity
['mousedown', 'keydown', 'scroll'].forEach(evt => {
    window.addEventListener(evt, () => { lastInteraction = Date.now(); });
});

// Check for inactivity periodically
setInterval(async () => {
    if (Date.now() - lastInteraction > QUIZ_INTERVAL && transcriptText.length > 500) {
        triggerActiveRecallQuiz();
    }
}, 60000); // Check every minute

async function triggerActiveRecallQuiz() {
    // 1. Visual Nudge: Flash the dashboard border
    dashboard.style.border = "5px solid #ff4444";
    setTimeout(() => dashboard.style.border = "3px solid #10a37f", 3000);

    // 2. Fetch Quiz from Groq
    const res = await fetch('http://localhost:3000/media/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: transcriptText.slice(-2000) })
    });
    const data = await res.json();

    // 3. Show Quiz in Assistant Tab
    switchTab('t-c');
    addMeetMsg("Focus Check: " + data.question, 'bot');
    lastInteraction = Date.now(); // Reset timer so it doesn't spam
}