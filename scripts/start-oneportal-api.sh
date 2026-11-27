#!/bin/sh
set -eu

# A single Render Free API has no pre-deploy step.
if [ "${ONEPORTAL_INITIALIZE_ON_START:-false}" = true ]; then
    dotnet OnePortal.API.dll --initialize-database
    export DatabaseInitialization__Mode=Verify
    export SeedData__Enabled=false
fi

exec dotnet OnePortal.API.dll "$@"
