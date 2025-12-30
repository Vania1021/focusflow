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
                <button id="trigger-ocr" style="background:#10a37f; color:white; border:none; padding:10px; border-radius:8px; margin-bottom:10px; cursor:pointer;">🔍 Select from Video</button>
                <button id="trigger-shredder" style="background:#0ea5e9; color:white; border:none; padding:10px; border-radius:8px; margin-bottom:10px; cursor:pointer;">✂️ Shred to Flowchart</button>
                <div id="visual-output" style="flex:1; overflow-y:auto; background:#f8fafc; padding:10px; border-radius:8px; border:1px solid #e2e8f0; font-size:14px;">
                    Visual insights or flowcharts will appear here...
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

    // Visual Tab: Video Shredder Trigger
    document.getElementById('trigger-shredder').onclick = async () => {
        const output = document.getElementById('visual-output');
        output.innerText = "Generating flowchart...";
        try {
            const res = await fetch('http://localhost:3000/vision/shredder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transcript: transcriptText })
            });
            const data = await res.json();
            output.innerText = data.mermaidCode;
        } catch (e) { output.innerText = "Error generating flowchart."; }
    };
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


function applyBionic(text) {
    if (!text) return "";
    // Use a DOM parser to only apply bionic to text nodes, preserving HTML tags
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

// Update updateUI to use the new formatter
function updateUI() {
    const feed = document.getElementById('live-transcript-area');
    const nugget = document.getElementById('nugget-content');
    if (feed) feed.innerHTML = bionicActive ? applyBionic(transcriptText) : transcriptText;
    if (nugget) nugget.innerHTML = formatADHD(currentNuggetContent); // Uses advanced formatting
}

// function applyBionic(text) {
//     if (!text) return "";
//     return text.split(/([\s\n]+)/).map(w => {
//         if (w.trim().length < 2) return w;
//         const m = Math.ceil(w.length / 2);
//         return `<b>${w.slice(0, m)}</b>${w.slice(m)}`;
//     }).join('').replace(/\n/g, '<br>');
// }

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