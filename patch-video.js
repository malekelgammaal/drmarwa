const fs = require('fs');
const path = require('path');
const ROOT = __dirname;

const files = [
    'course-dbt-course.html',
    'course-act-course.html',
    'course-healing-journey-program.html',
    'course-personality-disorders-course.html',
    'course-tri-therapy-bundle.html'
];

const NEW_VIDEO_BOX = `            <div class="video-box" id="video-container">
                <!-- Video loaded dynamically by loadModule() -->
                <p style="color:var(--muted);font-size:0.85rem;z-index:1;">Loading video...</p>
            </div>`;

const RENDER_FN = `
    function renderVideo(videoUrl, title) {
        const container = document.getElementById('video-container');
        if (!container) return;
        if (videoUrl) {
            container.innerHTML = '<iframe src="' + videoUrl + '" title="' + title + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border-radius:var(--border-radius);"></iframe>';
        } else {
            container.innerHTML = '<div style="text-align:center;z-index:1;"><i class="ph ph-video-camera-slash" style="font-size:2.5rem;color:var(--muted);"></i><p style="color:var(--muted);margin:0.5rem 0 0;font-size:0.85rem;">Video coming soon — check back soon!</p></div>';
        }
    }

`;

let ok = 0;

files.forEach(f => {
    const fp = path.join(ROOT, f);
    if (!fs.existsSync(fp)) { console.log('  MISSING: ' + f); return; }
    let html = fs.readFileSync(fp, 'utf8');

    // 1. Replace old video-box (button alert) with new id=video-container
    const vidBoxRx = /<div class="video-box">[\s\S]*?<\/div>/;
    if (vidBoxRx.test(html)) {
        html = html.replace(vidBoxRx, NEW_VIDEO_BOX);
    }

    // 2. Add renderVideo() before loadModule if not present
    if (!html.includes('function renderVideo(')) {
        html = html.replace('    function loadModule(', RENDER_FN + '    function loadModule(');
    }

    // 3. Replace vid-label line with renderVideo call
    html = html.replace(
        /document\.getElementById\('vid-label'\)\.textContent = [^\n]+\n/,
        "        renderVideo(m.videoUrl || '', m.title);\n"
    );

    // 4. Add videoUrl field after each duration line (if not already there)
    if (!html.includes('videoUrl:')) {
        html = html.replace(
            /(            duration: '[^']+',\n)(            body:)/g,
            "$1            videoUrl: '', // YouTube embed URL: https://www.youtube.com/embed/XXXX\n$2"
        );
    }

    fs.writeFileSync(fp, html, 'utf8');
    console.log('  OK: ' + f);
    ok++;
});

console.log('\nDone — ' + ok + '/' + files.length + ' files updated.');
