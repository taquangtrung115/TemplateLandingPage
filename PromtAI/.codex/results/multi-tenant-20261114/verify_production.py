"""Production-mode smoke test against the disposable local E2E database only."""
import json
import os
import subprocess
import time
import urllib.error
import urllib.request
import db_operations as database

root, output = database.ROOT, database.OUTPUT

def call(path, data=None, token=None, port=54622):
    request = urllib.request.Request('http://127.0.0.1:' + str(port) + path,
        data=None if data is None else json.dumps(data).encode(),
        headers={'Content-Type': 'application/json', **({'Authorization': 'Bearer ' + token} if token else {})})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read())
    except urllib.error.HTTPError as error:
        return error.code, None

def initialize_local():
    environment = os.environ.copy()
    environment['TEMPLATE_MIGRATION_CONNECTION_STRING'] = 'Host=127.0.0.1;Port=55432;Username=template_test;Database=oneportal_e2e'
    environment['Logging__LogLevel__Microsoft.EntityFrameworkCore.Database.Command'] = 'Warning'
    result = subprocess.run(['dotnet', str(root / 'BE/src/API/bin/Debug/net10.0/OnePortal.API.dll'), '--initialize-database'],
        cwd=root / 'BE/src/API', env=environment, capture_output=True, timeout=60)
    assert result.returncode == 0, 'Local recovery initializer failed'

if __name__ == '__main__':
    connection = database.connect(database='oneportal_e2e')
    database.query(connection, '''UPDATE platform."TenantApplications" SET "ProvisioningStatus" = 'Failed'
        WHERE "TenantId" = '6ba7809b-1af1-42ad-80e7-a2da9d58c001'::uuid AND "AppKey" = 'landing' ''')
    database.pq.PQfinish(connection)
    launcher = ['powershell', '-NoProfile', '-File', str(root / 'scripts/start-oneportal-verification.ps1')]
    try:
        subprocess.run(launcher + ['-Production'], cwd=root, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for attempt in range(20):
            try:
                if call('/health/ready', port=54621)[0] == 200: break
            except Exception: time.sleep(.5)
        else: raise RuntimeError('Production startup did not become ready')
        status, login = call('/api/v1/auth/login', {'email': 'platform@oneportal.test', 'password': 'Synthetic-password-123!'})
        assert status == 200
        assert call('/t/landing-default/api/v1/landing/templates')[0] == 503
        assert call('/t/quoting-default/api/v1/quoting/products', token=login['value']['token'])[0] == 200
        initialize_local()
        assert call('/t/landing-default/api/v1/landing/templates')[0] == 200
        summary = {'environment': 'Production', 'readyStatus': 200, 'rsaIdentityLogin': 200,
            'isolatedFailedTenantStatus': 503, 'otherTenantOperationalStatus': 200,
            'recoveredTenantStatus': 200, 'privateBackendInternalHttp': True}
        (output / 'production-startup-verification.json').write_text(json.dumps(summary, indent=2))
        print(json.dumps(summary))
    finally:
        initialize_local()
        subprocess.run(launcher + ['-Stop'], cwd=root, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
