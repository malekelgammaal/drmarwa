$gaSnippet = @"
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-07XVN01PR3"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-07XVN01PR3');
    </script>
</head>
"@

$htmlFiles = Get-ChildItem -Path . -Filter *.html

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Remove existing GA snippet
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, '<!-- Google tag \(gtag\.js\) -->[\s\S]*?gtag\(''config'',\s*''G-07XVN01PR3''\);\s*</script>', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    
    # Also remove some older standalone script tags if they exist
    $content = [System.Text.RegularExpressions.Regex]::Replace($content, '<script async src="https://www.googletagmanager.com/gtag/js\?id=G-07XVN01PR3"></script>', '', [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)

    if ($content -match '</head>') {
        $content = $content -replace '</head>', $gaSnippet
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Injected GA into $($file.Name)"
    } else {
        Write-Host "No </head> found in $($file.Name)"
    }
}
