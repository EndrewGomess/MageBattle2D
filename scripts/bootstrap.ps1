$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
$nodeVersion = '24.21.0'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$architecture = $env:PROCESSOR_ARCHITEW6432
if ([string]::IsNullOrEmpty($architecture)) { $architecture = $env:PROCESSOR_ARCHITECTURE }
switch ($architecture.ToUpperInvariant()) {
    'AMD64' { $platform = 'x64'; $expectedHash = 'ba4e6d110e8c1592a1ecd390f6b05f3da124b13871a5be62b341a07a853c6c32' }
    'ARM64' { $platform = 'arm64'; $expectedHash = 'dff59da18b6ffe1bf1ca99e1d2af4906080c481740619f5b5098c0fca28bd9b7' }
    default { Write-Host 'O lancador automatico suporta Windows x64 ou ARM64.'; exit 1 }
}
function Get-Sha256([string] $path) {
    $stream = [IO.File]::OpenRead($path)
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose(); $stream.Dispose() }
}
$runtime = Join-Path $root ('.runtime\node-v' + $nodeVersion + '-win-' + $platform)
$node = Join-Path $runtime 'node.exe'
$temp = $null
try {
    [IO.Directory]::CreateDirectory($runtime) | Out-Null
    $valid = [IO.File]::Exists($node) -and ((Get-Sha256 $node) -eq $expectedHash)
    if (-not $valid) {
        Write-Host ('Preparando Node.js ' + $nodeVersion + ' portatil (' + $platform + ')... Internet necessaria.')
        $temp = Join-Path $runtime ('node-' + [Guid]::NewGuid().ToString('N') + '.tmp')
        $url = 'https://nodejs.org/download/release/v' + $nodeVersion + '/win-' + $platform + '/node.exe'
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        $client = New-Object Net.WebClient
        try { $client.DownloadFile($url, $temp) } finally { $client.Dispose() }
        if ((Get-Sha256 $temp) -ne $expectedHash) { throw 'Integridade do Node.js invalida. O arquivo nao sera executado; tente novamente com uma conexao confiavel.' }
        # Same-directory atomic replacement: never expose a partial executable as the cache.
        if ([IO.File]::Exists($node)) { [IO.File]::Replace($temp, $node, $null) }
        else { [IO.File]::Move($temp, $node) }
        $temp = $null
    }
    # Revalidate even cached binaries immediately before invoking the pinned runtime.
    if ((Get-Sha256 $node) -ne $expectedHash) { throw 'Integridade do Node.js local invalida; inicio cancelado.' }
    & $node (Join-Path $PSScriptRoot 'start.mjs')
    exit $LASTEXITCODE
} catch {
    Write-Host ('Nao foi possivel iniciar: ' + $_.Exception.Message)
    Write-Host 'Confira internet, acesso a nodejs.org e permissao de escrita nesta pasta. Consulte o guia.'
    exit 1
} finally {
    if ($temp -and [IO.File]::Exists($temp)) { [IO.File]::Delete($temp) }
}
