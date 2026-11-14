#!/usr/bin/env bash
set -Eeuo pipefail

# Gateway is the only public listener. Keep this topology disposable so that
# the two executables can move to separate services without changing contracts.
app_root="${ONEPORTAL_APP_ROOT:-/app}"
api_pid=""
gateway_pid=""
cleanup() {
    trap - EXIT TERM INT
    for child in "$api_pid" "$gateway_pid"; do
        if [[ -n "$child" ]]; then kill -TERM "$child" 2>/dev/null || true; fi
    done
    wait 2>/dev/null || true
}
trap cleanup EXIT
trap 'exit 143' TERM
trap 'exit 130' INT

# Free instances have no pre-deploy hook. The initializer uses migration/seed
# locks and must succeed before either server accepts requests.
(cd "$app_root/api" && dotnet OnePortal.API.dll --initialize-database)

(
    cd "$app_root/api"
    export ASPNETCORE_ENVIRONMENT=Production
    export ASPNETCORE_URLS=http://127.0.0.1:54611
    export DatabaseInitialization__Mode=Verify
    export SeedData__Enabled=false
    exec dotnet OnePortal.API.dll
) &
api_pid=$!

(
    cd "$app_root/gateway"
    gateway_environment=()
    # An allowlist keeps DB/storage/private signing credentials out of the
    # Gateway process, even though Render supplies one environment to PID 1.
    while IFS= read -r variable; do
        case "$variable" in
            Jwt__PublicKeyPem|Jwt__Issuer|Jwt__Audience|Jwt__KeyId|Cors__AllowedOrigins__*|RateLimits__AuthPermitLimit|Logging__LogLevel__*)
                gateway_environment+=("$variable=${!variable}") ;;
        esac
    done < <(compgen -e)
    exec env -i PATH="$PATH" HOME="${HOME:-/tmp}" \
        ASPNETCORE_ENVIRONMENT=Production ASPNETCORE_URLS="http://0.0.0.0:${PORT:-8080}" \
        DOTNET_EnableDiagnostics=0 \
        "${gateway_environment[@]}" \
        ReverseProxy__Clusters__platform__Destinations__backend__Address=http://127.0.0.1:54611/ \
        ReverseProxy__Clusters__landing__Destinations__backend__Address=http://127.0.0.1:54611/ \
        ReverseProxy__Clusters__quoting__Destinations__backend__Address=http://127.0.0.1:54611/ \
        dotnet OnePortal.Gateway.dll
) &
gateway_pid=$!

# Restart the whole instance if either executable stops; do not serve a healthy
# edge in front of a dead API or leave an unproxied API process running alone.
set +e
wait -n "$api_pid" "$gateway_pid"
exit_code=$?
set -e
if [[ "$exit_code" -eq 0 ]]; then exit_code=1; fi
exit "$exit_code"
