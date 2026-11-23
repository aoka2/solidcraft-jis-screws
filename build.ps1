# Builds jis-hex-bolt.zip: tests, merges src into one file (componentize-js can't load a second
# module here), builds bolt.wasm, then zips it with plugin.json.
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

node test/spec.test.mjs
if ($LASTEXITCODE -ne 0) { throw 'tests failed' }

New-Item -ItemType Directory -Force dist | Out-Null
$spec = (Get-Content src/spec.js -Raw) -replace '(?m)^export ', ''
$main = (Get-Content src/bolt.js -Raw) -replace "(?m)^import .* from './spec.js';\r?\n", ''
Set-Content dist/bolt.js ($spec + "`n" + $main) -Encoding utf8NoBOM

npx jco componentize dist/bolt.js --wit wit/plugin.wit --world-name bolt-plugin --out dist/bolt.wasm `
    --disable stdio random clocks http fetch-event
if ($LASTEXITCODE -ne 0) { throw 'componentize failed' }

node tools/gen-icons.mjs
if ($LASTEXITCODE -ne 0) { throw 'icons failed' }
Copy-Item plugin.json dist/plugin.json
Remove-Item dist/icons -Recurse -ErrorAction SilentlyContinue
Copy-Item icons dist/icons -Recurse
Remove-Item jis-hex-bolt.zip -ErrorAction SilentlyContinue
Compress-Archive -Path dist/plugin.json, dist/bolt.wasm, dist/icons -DestinationPath jis-hex-bolt.zip
"built jis-hex-bolt.zip ($([math]::Round((Get-Item jis-hex-bolt.zip).Length/1MB,2)) MB)"
