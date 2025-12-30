// apps/extensions/frontend/src/offscreen.js

let recording = false;
let mediaStream = null;

chrome.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === 'INIT_STREAM') startRecording(msg.streamId);
    else if (msg.type === 'STOP_RECORDING') stopRecording();
});

async function startRecording(streamId) {
    if (recording) return;
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: { mandatory: { chromeMediaSource: 'tab', chromeMediaSourceId: streamId } },
            video: false
        });

        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(mediaStream);
        source.connect(audioCtx.destination);
        recording = true;
        recordSegment();
    } catch (e) { console.error("MediaStream Capture Error:", e); }
}

function recordSegment() {
    if (!recording || !mediaStream) return;
    const recorder = new MediaRecorder(mediaStream, { mimeType: 'audio/webm' });
    const chunks = [];

    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
    
    recorder.onstop = async () => {
        if (chunks.length > 0) {
            const formData = new FormData();
            formData.append('audio', new Blob(chunks, { type: 'audio/webm' }), 'chunk.webm');
            
            try {
                const response = await fetch('http://localhost:3000/media/process-audio', { 
                    method: 'POST', 
                    body: formData 
                });
                if (!response.ok) throw new Error("Server error: " + response.status);
                console.log("Chunk sent successfully");
            } catch (err) { 
                console.error("Backend unreachable. Ensure 'npm run dev' is active.", err); 
            }
        }
        if (recording) recordSegment();
    };

    recorder.start();
    setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, 10000); 
}

function stopRecording() {
    recording = false;
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}