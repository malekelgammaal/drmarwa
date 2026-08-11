const fs = require('fs');
const path = require('path');

const gaSnippet = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-07XVN01PR3"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-07XVN01PR3');
    </script>
`;

const dir = path.join(__dirname);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing GA snippet to avoid duplicates
    content = content.replace(/<!-- Google tag \(gtag\.js\) -->[\s\S]*?gtag\('config',\s*'G-07XVN01PR3'\);\s*<\/script>/gi, '');

    // Inject before </head>
    if (content.includes('</head>')) {
        content = content.replace('</head>', gaSnippet + '</head>');
        fs.writeFileSync(filePath, content);
        console.log('Injected GA into', file);
    } else {
        console.log('No </head> found in', file);
    }
});
