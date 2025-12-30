let isSelecting = false;
let startX, startY, canvasOverlay;

function startVisualSelection() {
    const video = document.querySelector('video');
    if (!video) return alert("No active video stream found.");

    canvasOverlay = document.createElement('canvas');
    canvasOverlay.style.cssText = `position:fixed; top:0; left:0; z-index:2147483647; cursor:crosshair; width:100%; height:100%;`;
    canvasOverlay.width = window.innerWidth;
    canvasOverlay.height = window.innerHeight;
    document.body.appendChild(canvasOverlay);

    const ctx = canvasOverlay.getContext('2d');

    canvasOverlay.onmousedown = (e) => {
        isSelecting = true;
        startX = e.clientX;
        startY = e.clientY;
    };

    canvasOverlay.onmousemove = (e) => {
        if (!isSelecting) return;
        ctx.clearRect(0, 0, canvasOverlay.width, canvasOverlay.height);
        ctx.strokeStyle = '#10a37f';
        ctx.lineWidth = 3;
        ctx.setLineDash([6]);
        ctx.strokeRect(startX, startY, e.clientX - startX, e.clientY - startY);
    };

    canvasOverlay.onmouseup = (e) => {
        isSelecting = false;
        const rect = { x: startX, y: startY, w: e.clientX - startX, h: e.clientY - startY };
        captureAndAnalyze(video, rect);
        canvasOverlay.remove();
    };
}

async function captureAndAnalyze(video, rect) {
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = rect.w;
    captureCanvas.height = rect.h;
    const ctx = captureCanvas.getContext('2d');

    // Account for video element scaling
    const videoRect = video.getBoundingClientRect();
    const scaleX = video.videoWidth / videoRect.width;
    const scaleY = video.videoHeight / videoRect.height;

    ctx.drawImage(video, 
        (rect.x - videoRect.left) * scaleX, (rect.y - videoRect.top) * scaleY, rect.w * scaleX, rect.h * scaleY, 
        0, 0, rect.w, rect.h
    );

    const base64Image = captureCanvas.toDataURL('image/jpeg');
    
    // Send to Tab D (Visual) in meet.js
    window.postMessage({ type: 'OCR_CAPTURE_READY', image: base64Image }, "*");
}