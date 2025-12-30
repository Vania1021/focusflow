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

// apps/extensions/frontend/content/vision.js

async function captureAndAnalyze(video, rect) {
    const captureCanvas = document.createElement('canvas');
    
    // FIX: Math.abs and Math.max prevent "undefined" or 0 dimensions
    captureCanvas.width = Math.max(1, Math.abs(rect.w));
    captureCanvas.height = Math.max(1, Math.abs(rect.h));
    
    const ctx = captureCanvas.getContext('2d');
    const videoRect = video.getBoundingClientRect();
    const scaleX = video.videoWidth / videoRect.width;
    const scaleY = video.videoHeight / videoRect.height;

    // FIX: Correctly identifies the top-left corner regardless of drag direction
    const sourceX = (Math.min(rect.x, rect.x + rect.w) - videoRect.left) * scaleX;
    const sourceY = (Math.min(rect.y, rect.y + rect.h) - videoRect.top) * scaleY;

    ctx.drawImage(video, 
        sourceX, sourceY, 
        Math.abs(rect.w) * scaleX, Math.abs(rect.h) * scaleY, 
        0, 0, captureCanvas.width, captureCanvas.height
    );

    const base64Image = captureCanvas.toDataURL('image/jpeg');
    window.postMessage({ type: 'OCR_CAPTURE_READY', image: base64Image }, "*");
}