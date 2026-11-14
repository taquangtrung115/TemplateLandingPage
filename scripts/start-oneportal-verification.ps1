param([switch]$Stop, [switch]$Production)
$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path -Parent $PSScriptRoot
$runtimePath = Join-Path $workspaceRoot 'PromtAI/.codex/results/multi-tenant-20261114/runtime'
$pidPath = Join-Path $runtimePath 'verification-processes.json'
if ($Stop) {
    if (Test-Path -LiteralPath $pidPath) {
        $processIds = Get-Content -LiteralPath $pidPath -Raw | ConvertFrom-Json
        foreach ($processId in $processIds) {
            $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId = $processId" -ErrorAction SilentlyContinue
            if ($processInfo -and ($processInfo.CommandLine -like "*$workspaceRoot*OnePortal*" -or $processInfo.CommandLine -like "*$workspaceRoot*storage-server.mjs*")) { Stop-Process -Id $processId -ErrorAction SilentlyContinue }
        }
    }
    return
}
$keys = Get-Content -LiteralPath (Join-Path $runtimePath 'test-keys.json') -Raw | ConvertFrom-Json
$env:ASPNETCORE_ENVIRONMENT = if ($Production) { 'Production' } else { 'Development' }
$env:ConnectionStrings__DefaultConnection = if ($env:ONEPORTAL_E2E_CONNECTION_STRING) { $env:ONEPORTAL_E2E_CONNECTION_STRING } else { 'Host=127.0.0.1;Port=55432;Username=template_test;Database=oneportal_e2e' }
$env:Jwt__PrivateKeyPem = $keys.privateKeyPem
$env:Jwt__PublicKeyPem = $keys.publicKeyPem
$env:Jwt__Issuer = 'OnePortal.Verification'
$env:Jwt__Audience = 'OnePortal.Verification'
$env:DatabaseInitialization__Mode = 'Verify'
$env:SeedData__Enabled = 'false'
$env:Supabase__Url = 'http://127.0.0.1:55440'
$env:Supabase__ServiceRoleKey = 'synthetic-storage-key'
$env:Supabase__Bucket = 'quotations'
$env:Quoting__Images__SupabaseUrl = 'http://127.0.0.1:55440'
$env:Quoting__Images__SecretKey = 'synthetic-storage-key'
$env:Quoting__Storage__AllowLocalFallback = 'false'
$apiDll = Join-Path $workspaceRoot 'BE/src/API/bin/Debug/net10.0/OnePortal.API.dll'
$processIds = @()
$storageFixture = Join-Path $workspaceRoot 'FE_Tenant/e2e/fixtures/storage-server.mjs'
$storage = Start-Process -FilePath 'node' -ArgumentList @($storageFixture) -WorkingDirectory $workspaceRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimePath 'storage-fixture.log') -RedirectStandardError (Join-Path $runtimePath 'storage-fixture.err.log') -PassThru
$processIds += $storage.Id
foreach ($port in @(54621, 54623)) {
    $process = Start-Process -FilePath 'dotnet' -ArgumentList @($apiDll, '--urls', "http://127.0.0.1:$port") -WorkingDirectory (Join-Path $workspaceRoot 'BE/src/API') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimePath "backend-$port.log") -RedirectStandardError (Join-Path $runtimePath "backend-$port.err.log") -PassThru
    $processIds += $process.Id
}
Remove-Item Env:Jwt__PrivateKeyPem
foreach ($variable in @('ConnectionStrings__DefaultConnection', 'Supabase__Url', 'Supabase__ServiceRoleKey', 'Quoting__Images__SupabaseUrl', 'Quoting__Images__SecretKey')) {
    Remove-Item "Env:$variable" -ErrorAction SilentlyContinue
}
$env:RateLimits__AuthPermitLimit = '1000'
$env:Cors__AllowedOrigins__0 = 'http://127.0.0.1:5183'
$env:Cors__AllowedOrigins__1 = 'http://127.0.0.1:5184'
$env:Cors__AllowedOrigins__2 = 'http://127.0.0.1:5185'
foreach ($cluster in @('platform', 'landing', 'quoting')) {
    [Environment]::SetEnvironmentVariable("ReverseProxy__Clusters__${cluster}__Destinations__backend__Address", 'http://127.0.0.1:54621/', 'Process')
}
$env:ReverseProxy__Clusters__quoting__Destinations__replica2__Address = 'http://127.0.0.1:54623/'
$gatewayDll = Join-Path $workspaceRoot 'BE/src/Gateway/bin/Debug/net10.0/OnePortal.Gateway.dll'
$gateway = Start-Process -FilePath 'dotnet' -ArgumentList @($gatewayDll, '--urls', 'http://127.0.0.1:54622') -WorkingDirectory (Join-Path $workspaceRoot 'BE/src/Gateway') -WindowStyle Hidden -RedirectStandardOutput (Join-Path $runtimePath 'gateway.log') -RedirectStandardError (Join-Path $runtimePath 'gateway.err.log') -PassThru
$processIds += $gateway.Id
$processIds | ConvertTo-Json | Set-Content -LiteralPath $pidPath
Write-Output 'Verification API replicas and Gateway started on loopback ports 54621, 54623 and 54622.'
