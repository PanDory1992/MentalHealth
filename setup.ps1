$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
$nodeDir = Join-Path $root "node"
$nodeExe = Join-Path $nodeDir "node.exe"
$nodeVersion = "v24.19.0"
$zipUrl = "https://nodejs.org/dist/$nodeVersion/node-$nodeVersion-win-x64.zip"
$zipPath = Join-Path $env:TEMP "personal-reflection-node-runtime.zip"
$extractDir = Join-Path $env:TEMP "personal-reflection-node-extract"

Write-Host "Personal Reflection Bridge - setup"
Write-Host "==================================="
Write-Host ""

# Files extracted from a downloaded ZIP carry Windows' "mark of the web" and can
# trigger a SmartScreen prompt the first time something in here gets executed.
# Strip that flag proactively so nothing pops up later.
Get-ChildItem -Path $root -Recurse -File -ErrorAction SilentlyContinue | Unblock-File -ErrorAction SilentlyContinue

if (-not (Test-Path $nodeExe)) {
    Write-Host "Krok 1/2: pobieram lokalny silnik Node.js (jednorazowo, okolo 50 MB)..."
    New-Item -ItemType Directory -Force -Path $nodeDir | Out-Null
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath -UseBasicParsing
    } catch {
        Write-Host ""
        Write-Host "Pobieranie nie powiodlo sie. Sprawdz polaczenie z internetem i uruchom ten skrypt ponownie."
        Write-Host "Blad: $($_.Exception.Message)"
        Read-Host "Nacisnij Enter, aby zamknac to okno"
        exit 1
    }

    if (Test-Path $extractDir) { Remove-Item $extractDir -Recurse -Force }
    Expand-Archive -Path $zipPath -DestinationPath $extractDir -Force

    $extractedNodeExe = Get-ChildItem -Path $extractDir -Filter "node.exe" -Recurse | Select-Object -First 1
    if (-not $extractedNodeExe) {
        Write-Host "Nie znalazlem node.exe w pobranym archiwum. Setup przerwany."
        Read-Host "Nacisnij Enter, aby zamknac to okno"
        exit 1
    }
    Copy-Item $extractedNodeExe.FullName -Destination $nodeExe -Force
    Unblock-File -Path $nodeExe -ErrorAction SilentlyContinue

    Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
    Remove-Item $extractDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Silnik Node.js gotowy."
} else {
    Write-Host "Krok 1/2: silnik Node.js juz jest na miejscu - pomijam pobieranie."
}

Write-Host ""
Write-Host "Krok 2/2: konfiguruje Claude Desktop..."

try {
    # Claude Desktop on Windows exists in two different packagings, and each reads
    # its config from a different folder:
    #   - classic (Squirrel) build  -> %APPDATA%\Claude
    #   - MSIX build (current official installer, since ~Feb 2026) -> the real,
    #     MSIX-virtualized profile at
    #     %LOCALAPPDATA%\Packages\<PackageFamilyName>\LocalCache\Roaming\Claude
    # On an MSIX install, the "Edit Config" button in Settings -> Developer can
    # still point at (or create) the classic path even though the app itself
    # never reads it - confirmed on a real machine on 8.08.2026. Writing only to
    # %APPDATA%\Claude on such a machine produces a config file that looks
    # correct but is silently ignored. So: write to the classic path always
    # (harmless if unused), and ALSO write to the MSIX path whenever an MSIX
    # Claude package is found, so this works regardless of which build is
    # installed.
    $configDirs = New-Object System.Collections.Generic.List[string]
    $configDirs.Add((Join-Path $env:APPDATA "Claude"))

    $packagesRoot = Join-Path $env:LOCALAPPDATA "Packages"
    if (Test-Path $packagesRoot) {
        $msixPackage = Get-ChildItem -Path $packagesRoot -Directory -Filter "Claude_*" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($msixPackage) {
            $msixConfigDir = Join-Path $msixPackage.FullName "LocalCache\Roaming\Claude"
            $configDirs.Add($msixConfigDir)
            Write-Host "Wykryto MSIX-owa wersje Claude Desktop, konfiguruje takze: $msixConfigDir"
        }
    }

    $entry = New-Object PSObject
    $entry | Add-Member -NotePropertyName "command" -NotePropertyValue $nodeExe
    $entry | Add-Member -NotePropertyName "args" -NotePropertyValue @((Join-Path $root "server.mjs"))

    $writtenTo = New-Object System.Collections.Generic.List[string]
    foreach ($configDir in $configDirs) {
        $configPath = Join-Path $configDir "claude_desktop_config.json"

        if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Force -Path $configDir | Out-Null }

        if (Test-Path $configPath) {
            $raw = Get-Content -Path $configPath -Raw
            if ([string]::IsNullOrWhiteSpace($raw)) {
                $config = New-Object PSObject
            } else {
                $config = $raw | ConvertFrom-Json
            }
        } else {
            $config = New-Object PSObject
        }

        if (-not (Get-Member -InputObject $config -Name "mcpServers" -MemberType NoteProperty)) {
            $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue (New-Object PSObject)
        }

        if (Get-Member -InputObject $config.mcpServers -Name "personal-reflection" -MemberType NoteProperty) {
            $config.mcpServers.'personal-reflection' = $entry
        } else {
            $config.mcpServers | Add-Member -NotePropertyName "personal-reflection" -NotePropertyValue $entry
        }

        # Set-Content -Encoding UTF8 writes a BOM in Windows PowerShell 5.1 (the .NET UTF8Encoding
        # default used here does not). A BOM at the start of this file can make some JSON parsers -
        # including plain JSON.parse, which is what most Electron apps use - fail to read it at all,
        # potentially breaking every MCP server in the config, not just this one. Write explicitly
        # without a BOM to avoid that.
        $json = $config | ConvertTo-Json -Depth 10
        $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
        [System.IO.File]::WriteAllText($configPath, $json, $utf8NoBom)

        $writtenTo.Add($configPath)
    }

    Write-Host "Config zapisany:"
    foreach ($p in $writtenTo) { Write-Host "  - $p" }
} catch {
    Write-Host ""
    Write-Host "Konfiguracja Claude Desktop nie powiodla sie."
    Write-Host "Blad: $($_.Exception.Message)"
    Write-Host ""
    Write-Host "Najczestsza przyczyna: plik configu juz istnieje i jest uszkodzony (np. po recznej edycji)."
    Write-Host "Otworz go w Notatniku, sprawdz czy to poprawny JSON, i uruchom ten skrypt ponownie."
    Read-Host "Nacisnij Enter, aby zamknac to okno"
    exit 1
}
Write-Host ""
Write-Host "Gotowe."
Write-Host "Zamknij Claude Desktop calkowicie (ikona w zasobniku systemowym - prawy klawisz - Zamknij / Quit)"
Write-Host "i otworz je ponownie. Bridge pojawi sie jako 'personal-reflection'."
Write-Host ""
Read-Host "Nacisnij Enter, aby zamknac to okno"
