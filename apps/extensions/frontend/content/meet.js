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
        <div class="ff-header" id="ff-drag-handle">
            <strong>FocusFlow Meet</strong>
            <label style="font-size:12px; cursor:pointer;"><input type="checkbox" id="meet-bionic"> Bionic</label>
        </div>
        <div class="ff-tabs">
            <button id="t-a" class="active">Live Feed</button>
            <button id="t-b">Smart Nuggets</button>
            <button id="t-c">Assistant</button>
        </div>
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
                <div id="meet-chat-history"></div>
                <div style="display:flex; padding:10px; border-top:1px solid #eee; gap:5px;">
                    <input type="text" id="meet-chat-input" placeholder="Ask about lecture..." style="flex:1; padding:8px; border-radius:4px; border:1px solid #ddd;">
                    <button id="meet-send" style="background:#10a37f; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">➤</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(dashboard);
    makeDraggable(dashboard, document.getElementById('ff-drag-handle'));
    setupDashboardActions();
}

function setupDashboardActions() {
    const bionicToggle = document.getElementById('meet-bionic');
    if (bionicToggle) {
        bionicToggle.onchange = (e) => {
            bionicActive = e.target.checked;
            updateUI(); // Immediate re-render
        };
    }

    const tabs = ['t-a', 't-b', 't-c'];
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
                if (target) target.style.display = id === 't-c' ? 'flex' : 'block';
            };
        }
    });

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

    // Safety sync loop to pull live data
    setInterval(async () => {
        if (!dashboard) return; // FIX: Prevent "innerHTML of null" error if dashboard is closed
        try {
            const formatEl = document.getElementById('nugget-format');
            const format = formatEl ? formatEl.value : 'bullets';
            const res = await fetch(`http://localhost:3000/media/meeting-summary?format=${format}`);
            const data = await res.json();
            
            transcriptText = data.fullTranscript || transcriptText;
            currentNuggetContent = data.reply || currentNuggetContent;
            updateUI();
        } catch (e) { console.warn("Polling failed: Server unreachable."); }
    }, 10000);
}

function updateUI() {
    const feed = document.getElementById('live-transcript-area');
    const nugget = document.getElementById('nugget-content');
    // Safety checks for both elements
    if (feed) feed.innerHTML = bionicActive ? applyBionic(transcriptText) : transcriptText;
    if (nugget) nugget.innerHTML = bionicActive ? applyBionic(currentNuggetContent) : currentNuggetContent;
}

function applyBionic(text) {
    if (!text) return "";
    return text.split(/([\s\n]+)/).map(w => {
        if (w.trim().length < 2) return w;
        const m = Math.ceil(w.length / 2);
        return `<b>${w.slice(0, m)}</b>${w.slice(m)}`;
    }).join('').replace(/\n/g, '<br>');
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