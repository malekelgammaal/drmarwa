const fs = require('fs');
const path = require('path');

const files = [
    'course-dbt-course.html',
    'course-cbt-course.html',
    'course-act-course.html',
    'course-healing-journey-program.html',
    'course-personality-disorders-course.html'
];

const themeCSS = [
    '        /* Theme toggle icons */',
    '        [data-theme="dark"]  #theme-icon-light { display: none; }',
    '        [data-theme="dark"]  #theme-icon-dark  { display: inline; }',
    '        [data-theme="light"] #theme-icon-light { display: inline; }',
    '        [data-theme="light"] #theme-icon-dark  { display: none; }'
].join('\n') + '\n';

files.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    if (c.includes('[data-theme="dark"]  #theme-icon-light')) {
        console.log('SKIP ' + f);
        return;
    }
    c = c.replace('        body{margin:0;}', '        body{margin:0;}\n' + themeCSS);
    fs.writeFileSync(f, c, 'utf8');
    console.log('OK ' + f);
});

// Rebuild dist
const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
function cp(s, d) {
    if (!fs.existsSync(s)) return;
    if (fs.statSync(s).isDirectory()) {
        fs.mkdirSync(d, {recursive: true});
        fs.readdirSync(s).forEach(f2 => cp(path.join(s, f2), path.join(d, f2)));
    } else {
        fs.mkdirSync(path.dirname(d), {recursive: true});
        fs.copyFileSync(s, d);
    }
}
if (fs.existsSync(DIST)) fs.rmSync(DIST, {recursive: true, force: true});
fs.mkdirSync(DIST, {recursive: true});

const htmlFiles = [
    'index.html','admin.html','blog.html','checkout.html','my-courses.html',
    'reset-password.html','privacy-policy.html','course-act-course.html',
    'course-cbt-course.html','course-dbt-course.html',
    'course-healing-journey-program.html','course-personality-disorders-course.html',
    'course-tri-therapy-bundle.html','gammal-tech.html','terms.html','refund-policy.html'
];
htmlFiles.forEach(f => { if (fs.existsSync(f)) fs.copyFileSync(f, path.join(DIST, f)); });
['css','js','images','fonts'].forEach(d => { if (fs.existsSync(d)) cp(d, path.join(DIST, d)); });

let count = 0;
function countF(dir) { fs.readdirSync(dir, {withFileTypes:true}).forEach(e => { e.isDirectory() ? countF(path.join(dir,e.name)) : count++; }); }
countF(DIST);
console.log('dist rebuilt — ' + count + ' files');
