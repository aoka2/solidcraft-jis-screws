# Builds one design per language from the master template and translations.json.
# Usage: pwsh ./build-languages.ps1   (writes hex-bolt-<lang>.sc next to this script)
param(
    [string]$Master = "$PSScriptRoot/hex-bolt-template.sc",
    [string]$Table  = "$PSScriptRoot/translations.json",
    [string]$Cli    = (Get-Command solidcraft-cli -ErrorAction Stop).Source
)
$ErrorActionPreference = 'Stop'

$langs = Get-Content $Table -Raw -Encoding utf8 | ConvertFrom-Json -AsHashtable
foreach ($lang in $langs.Keys) {
    $steps = foreach ($param in $langs[$lang].Keys) {
        $t = $langs[$lang][$param]
        if ($t.name -ne $param) {
            @{ command = 'parameters.rename'; params = @{ name = $param; new_name = $t.name } }
        }
        @{ command = 'parameters.comment'; params = @{ name = $t.name; comment = $t.comment } }
    }
    $script = New-TemporaryFile
    ConvertTo-Json @($steps) -Depth 5 | Set-Content $script -Encoding utf8NoBOM
    $out = "$PSScriptRoot/hex-bolt-$lang.sc"
    # The CLI writes nothing when any step fails (e.g. a name missing from the master).
    & $Cli run $script --in $Master --save $out --quiet
    Remove-Item $script
    if ($LASTEXITCODE -ne 0) { throw "build failed for '$lang' (exit $LASTEXITCODE)" }
    "built $out"
}
