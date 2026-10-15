$ErrorActionPreference = 'Stop'
$appRoot = $PSScriptRoot
$appUrl = 'http://127.0.0.1:47831'
$ready = $false
try { $ready = (Invoke-WebRequest "$appUrl/__fretlight" -UseBasicParsing -TimeoutSec 2).Content -eq 'fretlight-local' } catch {}
if (-not $ready) {
    if (-not (Test-Path -LiteralPath (Join-Path $appRoot 'dist/index.html'))) { throw 'The app has not been built. Run npm install and npm run build in this folder.' }
    $nodePath = (Get-Command node.exe).Source
    $serverPath = Join-Path $appRoot 'serve.mjs'
    Start-Process -FilePath $nodePath -ArgumentList @('"' + $serverPath + '"') -WorkingDirectory $appRoot -WindowStyle Hidden
    for ($attempt = 0; $attempt -lt 15; $attempt++) {
        Start-Sleep -Milliseconds 300
        try { $ready = (Invoke-WebRequest "$appUrl/__fretlight" -UseBasicParsing -TimeoutSec 1).Content -eq 'fretlight-local' } catch {}
        if ($ready) { break }
    }
}
if (-not $ready) { throw 'Fretlight could not start. Port 47831 may be in use.' }
Start-Process $appUrl
