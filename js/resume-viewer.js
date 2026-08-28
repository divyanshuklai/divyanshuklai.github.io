// A small PDF viewer for the resume, built on pdf.js.
//
// The browser's own viewer is unreadable on a phone and cannot be themed, so
// this renders the page to a canvas instead: fit to width by default, sharp on
// high-DPI screens because the bitmap is sized in device pixels rather than by
// CSS, and with pdf.js's text layer on top so the text stays selectable.
//
// pdf.js is ~1.6 MB, so it is only fetched once the viewer scrolls into view.

const MAX_DPR = 2;                       // beyond this the canvas costs more than it shows
const MAX_CANVAS_PIXELS = 16 * 1024 * 1024;  // phones fail to allocate much past this
const ZOOM_STEP = 1.25;
const ZOOM_MIN = 0.2;
const ZOOM_MAX = 6;

const viewer = document.getElementById('resume-viewer');
if (viewer) setup(viewer);

function setup(root) {
    const el = (role) => root.querySelector(`[data-pdf-role="${role}"]`);
    const stage = el('stage');
    const pageBox = el('page');
    const canvas = el('canvas');
    const textLayerDiv = el('text');
    const zoomLabel = el('zoom');
    const status = el('status');
    const src = root.dataset.pdfSrc;

    let pdfjs = null;
    let page = null;
    let baseViewport = null;   // the page at scale 1
    let scale = 1;
    let fitMode = true;        // follow the container width until the reader zooms
    let renderTask = null;
    let textLayer = null;
    let renderToken = 0;

    const say = (msg) => { status.textContent = msg; status.hidden = !msg; };

    const fail = (err) => {
        console.error('resume viewer:', err);
        root.classList.add('is-failed');
        status.hidden = false;
        status.innerHTML =
            'The viewer could not load. ' +
            `<a href="${src}" download>Download the resume (PDF)</a> instead.`;
    };

    // Load pdf.js only once someone actually scrolls to the viewer.
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            if (entries.some((e) => e.isIntersecting)) {
                io.disconnect();
                load();
            }
        }, { rootMargin: '200px' });
        io.observe(root);
    } else {
        load();
    }

    async function load() {
        try {
            pdfjs = await import('./vendor/pdfjs/pdf.min.js');
            pdfjs.GlobalWorkerOptions.workerSrc =
                new URL('./vendor/pdfjs/pdf.worker.min.js', import.meta.url).toString();

            const doc = await pdfjs.getDocument({ url: src }).promise;
            page = await doc.getPage(1);
            baseViewport = page.getViewport({ scale: 1 });

            root.classList.add('is-ready');
            say('');
            await fit();
            wire();
        } catch (err) {
            fail(err);
        }
    }

    function fitScale() {
        const style = getComputedStyle(stage);
        const inner = stage.clientWidth
            - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
        return clamp(inner / baseViewport.width);
    }

    function clamp(value) {
        return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
    }

    async function renderAt(next) {
        scale = clamp(next);
        const token = ++renderToken;

        if (renderTask) {
            renderTask.cancel();
            renderTask = null;
        }
        if (textLayer) {
            textLayer.cancel();
            textLayer = null;
        }

        const viewport = page.getViewport({ scale });
        const cssWidth = Math.floor(viewport.width);
        const cssHeight = Math.floor(viewport.height);

        // Size the bitmap in device pixels, the box in CSS pixels. Doing this
        // the other way round is what makes canvas-rendered PDFs look blurry.
        let dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
        const area = cssWidth * cssHeight * dpr * dpr;
        if (area > MAX_CANVAS_PIXELS) {
            dpr *= Math.sqrt(MAX_CANVAS_PIXELS / area);
        }

        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        pageBox.style.width = `${cssWidth}px`;
        pageBox.style.height = `${cssHeight}px`;

        updateZoomLabel();

        const ctx = canvas.getContext('2d', { alpha: false });
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        renderTask = page.render({
            canvasContext: ctx,
            viewport,
            transform: dpr === 1 ? null : [dpr, 0, 0, dpr, 0, 0],
        });

        try {
            await renderTask.promise;
        } catch (err) {
            if (err && err.name === 'RenderingCancelledException') return;
            throw err;
        }
        if (token !== renderToken) return;
        renderTask = null;

        textLayerDiv.replaceChildren();
        textLayerDiv.style.setProperty('--total-scale-factor', String(scale));
        textLayerDiv.style.width = `${cssWidth}px`;
        textLayerDiv.style.height = `${cssHeight}px`;

        textLayer = new pdfjs.TextLayer({
            textContentSource: await page.getTextContent(),
            container: textLayerDiv,
            viewport,
        });
        await textLayer.render();
    }

    function updateZoomLabel() {
        // 100% means the page at its physical size on a 96dpi screen, which is
        // what every other PDF viewer means by it.
        const css = pdfjs.PixelsPerInch.PDF_TO_CSS_UNITS;
        zoomLabel.textContent = `${Math.round((scale / css) * 100)}%`;
    }

    function zoomBy(factor, anchor) {
        fitMode = false;
        const before = scale;
        const next = clamp(before * factor);
        if (next === before) return;
        keepAnchored(before, next, anchor, () => renderAt(next));
    }

    // Keep whatever the reader was looking at under the same point on screen.
    function keepAnchored(before, after, anchor, apply) {
        const rect = stage.getBoundingClientRect();
        const ax = anchor ? anchor.x - rect.left : rect.width / 2;
        const ay = anchor ? anchor.y - rect.top : rect.height / 2;
        const cx = (stage.scrollLeft + ax) / before;
        const cy = (stage.scrollTop + ay) / before;

        Promise.resolve(apply()).then(() => {
            stage.scrollLeft = cx * after - ax;
            stage.scrollTop = cy * after - ay;
        });
    }

    async function fit() {
        fitMode = true;
        await renderAt(fitScale());
        // The vertical scrollbar only appears once there is a rendered page to
        // scroll, and it narrows the stage. Correct once instead of leaving a
        // stray few pixels of horizontal scroll.
        if (stage.scrollWidth > stage.clientWidth + 1) {
            await renderAt(fitScale());
        }
    }

    function wire() {
        root.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-pdf-action]');
            if (!btn) return;
            const action = btn.dataset.pdfAction;
            if (action === 'zoom-in') zoomBy(ZOOM_STEP);
            else if (action === 'zoom-out') zoomBy(1 / ZOOM_STEP);
            else if (action === 'fit') fit();
            else if (action === 'fullscreen') toggleFullscreen();
        });

        stage.addEventListener('keydown', (e) => {
            if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomBy(ZOOM_STEP); }
            else if (e.key === '-') { e.preventDefault(); zoomBy(1 / ZOOM_STEP); }
            else if (e.key === '0') { e.preventDefault(); fit(); }
        });

        // Trackpad pinch and ctrl+wheel arrive as a wheel event with ctrlKey.
        stage.addEventListener('wheel', (e) => {
            if (!e.ctrlKey) return;
            e.preventDefault();
            zoomBy(e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP, { x: e.clientX, y: e.clientY });
        }, { passive: false });

        wirePinch();

        // Re-fit when the column changes width, but only while following it.
        if ('ResizeObserver' in window) {
            let timer = null;
            let lastWidth = stage.clientWidth;
            new ResizeObserver(() => {
                if (!fitMode || stage.clientWidth === lastWidth) return;
                lastWidth = stage.clientWidth;
                clearTimeout(timer);
                timer = setTimeout(fit, 150);
            }).observe(stage);
        }

        document.addEventListener('fullscreenchange', () => {
            root.classList.toggle('is-fullscreen', document.fullscreenElement === root);
            if (fitMode) setTimeout(fit, 50);
        });
    }

    // Two-finger pinch: scale the existing bitmap for instant feedback, then
    // re-render once at the final scale so it ends up sharp rather than smeared.
    function wirePinch() {
        let startDist = 0;
        let startScale = 0;
        let anchor = null;

        const dist = (t) => Math.hypot(
            t[0].clientX - t[1].clientX,
            t[0].clientY - t[1].clientY,
        );
        const mid = (t) => ({
            x: (t[0].clientX + t[1].clientX) / 2,
            y: (t[0].clientY + t[1].clientY) / 2,
        });

        stage.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 2) return;
            startDist = dist(e.touches);
            startScale = scale;
            anchor = mid(e.touches);
            pageBox.style.transformOrigin = '0 0';
        }, { passive: true });

        stage.addEventListener('touchmove', (e) => {
            if (e.touches.length !== 2 || !startDist) return;
            e.preventDefault();
            const k = clamp(startScale * (dist(e.touches) / startDist)) / startScale;
            pageBox.style.transform = `scale(${k})`;
        }, { passive: false });

        const end = () => {
            if (!startDist) return;
            const k = parseFloat((pageBox.style.transform.match(/scale\(([\d.]+)\)/) || [])[1]);
            pageBox.style.transform = '';
            pageBox.style.transformOrigin = '';
            startDist = 0;
            if (!k || Math.abs(k - 1) < 0.01) return;
            fitMode = false;
            const before = startScale;
            const after = clamp(before * k);
            keepAnchored(before, after, anchor, () => renderAt(after));
        };

        stage.addEventListener('touchend', end, { passive: true });
        stage.addEventListener('touchcancel', end, { passive: true });
    }

    function toggleFullscreen() {
        if (document.fullscreenElement === root) {
            document.exitFullscreen();
        } else if (root.requestFullscreen) {
            root.requestFullscreen().catch(() => {});
        }
    }
}
