$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $PSScriptRoot
Push-Location $workspaceRoot
try {
    & (Join-Path $PSScriptRoot 'start-oneportal-verification.ps1') -Stop
    dotnet build BE/OnePortal.sln --nologo --verbosity quiet
    if ($LASTEXITCODE -ne 0) { throw 'Verification build failed.' }
    dotnet run --project BE/tools/VerificationSeed --no-build -- --reset
    if ($LASTEXITCODE -ne 0) { throw 'Disposable database setup failed.' }
    $runtimePath = Join-Path $workspaceRoot 'PromtAI/.codex/results/multi-tenant-20261114/runtime'
    New-Item -ItemType Directory -Path $runtimePath -Force | Out-Null
    $keysPath = Join-Path $runtimePath 'test-keys.json'
    if (-not (Test-Path -LiteralPath $keysPath)) {
        $rsa = [System.Security.Cryptography.RSA]::Create(2048)
        try {
            @{privateKeyPem=$rsa.ExportRSAPrivateKeyPem();publicKeyPem=$rsa.ExportRSAPublicKeyPem()} |
                ConvertTo-Json | Set-Content -LiteralPath $keysPath -Encoding utf8
        } finally { $rsa.Dispose() }
    }
    Write-Output 'Local E2E setup is ready. Start scripts/start-oneportal-verification.ps1, then npm run test:e2e in FE_Tenant.'
} finally { Pop-Location }
