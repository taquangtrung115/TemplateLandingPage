"""Local verification and encrypted backup; never prints database credentials or row data."""
from pathlib import Path
import base64
import ctypes as C
import gzip
import hashlib
import json
import os
import sys
import re
import subprocess
from datetime import datetime

ROOT = Path(__file__).resolve().parents[4]
OUTPUT = Path(__file__).resolve().parent
BIN = OUTPUT / 'tools/postgres/bin'
os.add_dll_directory(str(BIN))
pq = C.CDLL(str(BIN / 'libpq.dll'))
for name, args, result in [
    ('PQconnectdb', [C.c_char_p], C.c_void_p), ('PQstatus', [C.c_void_p], C.c_int),
    ('PQexec', [C.c_void_p, C.c_char_p], C.c_void_p), ('PQresultStatus', [C.c_void_p], C.c_int),
    ('PQntuples', [C.c_void_p], C.c_int), ('PQnfields', [C.c_void_p], C.c_int),
    ('PQfname', [C.c_void_p, C.c_int], C.c_char_p), ('PQgetvalue', [C.c_void_p, C.c_int, C.c_int], C.c_char_p),
    ('PQclear', [C.c_void_p], None), ('PQfinish', [C.c_void_p], None),
    ('PQresultErrorMessage', [C.c_void_p], C.c_char_p),
    ('PQexecParams', [C.c_void_p, C.c_char_p, C.c_int, C.c_void_p, C.POINTER(C.c_char_p), C.c_void_p, C.c_void_p, C.c_int], C.c_void_p),
]:
    function = getattr(pq, name); function.argtypes = args; function.restype = result

TABLES = [('public', name) for name in ['Users', 'Categories', 'Products', 'Templates', 'NavigationMenus', 'UserCustomizations', 'CustomizationVersions', 'CustomizationSlugAliases', 'RsvpEntries', 'GuestbookEntries']]
TABLES += [('quo', name) for name in ['ProductGroups', 'Products', 'Customers', 'QuotationTemplates', 'QuotationTemplateVersions', 'Quotations', 'QuotationItems', 'QuotationHistories', 'QuotationFiles', 'SupportRequests']]

def connect(cloud=False, database='postgres'):
    if cloud:
        raw = json.loads((ROOT / 'BE/src/API/appsettings.Development.json').read_text(encoding='utf-8-sig'))['ConnectionStrings']['DefaultConnection']
        values = dict(value.split('=', 1) for value in raw.split(';') if '=' in value)
        names = {'Host': 'host', 'Port': 'port', 'Database': 'dbname', 'Username': 'user', 'Password': 'password'}
        connection = ' '.join(names[name] + "='" + values[name].replace('\\', '\\\\').replace("'", "\\'") + "'" for name in names if name in values) + ' sslmode=require connect_timeout=10'
    else:
        connection = f'host=127.0.0.1 port=55432 user=template_test dbname={database} connect_timeout=10'
    handle = pq.PQconnectdb(connection.encode())
    if pq.PQstatus(handle) != 0: raise RuntimeError('Database connection unavailable; credentials were not logged.')
    return handle

def query(connection, sql, parameters=()):
    encoded = [str(value).encode() for value in parameters]
    result = pq.PQexecParams(connection, sql.encode(), len(encoded), None, (C.c_char_p * len(encoded))(*encoded), None, None, 0) if encoded else pq.PQexec(connection, sql.encode())
    if pq.PQresultStatus(result) not in (1, 2):
        message = pq.PQresultErrorMessage(result).decode(errors='replace')
        pq.PQclear(result)
        raise RuntimeError(message)
    fields = [pq.PQfname(result, i).decode() for i in range(pq.PQnfields(result))]
    rows = [{name: pq.PQgetvalue(result, row, column).decode() for column, name in enumerate(fields)} for row in range(pq.PQntuples(result))]
    pq.PQclear(result)
    return rows

class Blob(C.Structure):
    _fields_ = [('size', C.c_ulong), ('data', C.POINTER(C.c_ubyte))]

def protect(data, decrypt=False):
    buffer = (C.c_ubyte * len(data)).from_buffer_copy(data)
    source, target = Blob(len(data), buffer), Blob()
    function = C.windll.crypt32.CryptUnprotectData if decrypt else C.windll.crypt32.CryptProtectData
    if not function(C.byref(source), None, None, None, None, 0, C.byref(target)):
        raise RuntimeError('Windows user-bound backup encryption failed.')
    try: return C.string_at(target.data, target.size)
    finally: C.windll.kernel32.LocalFree(target.data)

def backup():
    connection = connect(True)
    query(connection, 'BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY')
    snapshot = {}
    for schema, table in TABLES:
        data = query(connection, f'SELECT coalesce(json_agg(row_to_json(record)), \'[]\'::json)::text AS data FROM {schema}."{table}" record')[0]['data']
        snapshot[f'{schema}.{table}'] = json.loads(data)
    query(connection, 'COMMIT'); pq.PQfinish(connection)
    directory = OUTPUT / 'runtime'; directory.mkdir(exist_ok=True)
    payload = json.dumps(snapshot, ensure_ascii=False).encode()
    encrypted = protect(gzip.compress(payload))
    (directory / 'supabase-before-multi-tenant.dpapi').write_bytes(encrypted)
    manifest = {'tables': {key: len(value) for key, value in snapshot.items()}, 'encryptedSha256': hashlib.sha256(encrypted).hexdigest(), 'encryption': 'Windows DPAPI current user'}
    (OUTPUT / 'backup-manifest.json').write_text(json.dumps(manifest, indent=2))
    print(json.dumps(manifest))

def restore_clone():
    snapshot = json.loads(gzip.decompress(protect((OUTPUT / 'runtime/supabase-before-multi-tenant.dpapi').read_bytes(), True)))
    connection = connect(database='oneportal_cloud_rehearsal')
    publication = []
    query(connection, 'BEGIN')
    try:
        # The rehearsal schema contains historical catalog seed rows, which are replaced by the encrypted snapshot.
        names = ', '.join(f'{schema}."{table}"' for schema, table in TABLES)
        query(connection, f'TRUNCATE {names}')
        for schema, table in TABLES:
            rows = snapshot[f'{schema}.{table}']
            if table == 'UserCustomizations':
                for row in rows:
                    if row.get('PublishedVersionId'): publication.append((row['Id'], row['PublishedVersionId']))
                    row['PublishedVersionId'] = None
            if rows: query(connection, f'INSERT INTO {schema}."{table}" SELECT * FROM json_populate_recordset(NULL::{schema}."{table}", $1::json)', [json.dumps(rows)])
        for site, version in publication:
            query(connection, 'UPDATE public."UserCustomizations" SET "PublishedVersionId" = $1::uuid WHERE "Id" = $2::uuid', [version, site])
        query(connection, 'COMMIT')
    except Exception:
        query(connection, 'ROLLBACK'); raise
    finally: pq.PQfinish(connection)
    print('Encrypted snapshot restored into disposable rehearsal database.')

def bootstrap_e2e():
    connection = connect(database='oneportal_e2e')
    salt = os.urandom(16)
    password_hash = base64.b64encode(salt).decode() + '.' + base64.b64encode(hashlib.pbkdf2_hmac('sha512', b'Synthetic-password-123!', salt, 100000, 64)).decode()
    query(connection, '''INSERT INTO public."Users" ("Id", "Email", "PasswordHash", "FullName", "Role", "Provider", "IsActive", "IsDeleted", "CreatedAtUtc", "IsPlatformAdmin")
        VALUES ('6ba7809b-1af1-42ad-80e7-a2da9d58c101', 'platform@oneportal.test', $1, 'Platform E2E', 'User', 'Local', TRUE, FALSE, CURRENT_TIMESTAMP, TRUE)
        ON CONFLICT ("Email") DO NOTHING''', [password_hash])
    query(connection, '''INSERT INTO platform."TenantMemberships" ("Id", "TenantId", "AppKey", "UserId", "Role", "IsActive")
        SELECT md5('e2e-membership:' || "AppKey")::uuid, "TenantId", "AppKey", '6ba7809b-1af1-42ad-80e7-a2da9d58c101', 'Admin', TRUE FROM platform."TenantApplications" ON CONFLICT DO NOTHING''')
    pq.PQfinish(connection); print('Synthetic E2E platform identity and default memberships ready.')

def verify_snapshot(cloud=False):
    snapshot = json.loads(gzip.decompress(protect((OUTPUT / 'runtime/supabase-before-multi-tenant.dpapi').read_bytes(), True)))
    connection = connect(cloud, 'oneportal_cloud_rehearsal')
    summary = {}
    def normalized(value):
        if isinstance(value, str) and re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}', value):
            try: return datetime.fromisoformat(value)
            except ValueError: pass
        return value
    for schema, table in TABLES:
        key = f'{schema}.{table}'
        current = json.loads(query(connection, f'SELECT coalesce(json_agg(row_to_json(record)), \'[]\'::json)::text AS data FROM {schema}."{table}" record')[0]['data'])
        lookup = {row['Id']: row for row in current}
        for original in snapshot[key]:
            if original['Id'] not in lookup: raise RuntimeError(f'Missing original row in {key}')
            restored = lookup[original['Id']]
            for field, value in original.items():
                if normalized(value) != normalized(restored[field]):
                    # Granting the approved platform privilege legitimately updates its account audit timestamp.
                    if cloud and key == 'public.Users' and field == 'ModifiedAtUtc' and original.get('Email') == 'admin@template.com' and restored.get('IsPlatformAdmin') is True:
                        continue
                    raise RuntimeError(f'Original field changed: {key}.{field}')
        if table != 'Users':
            expected = '6ba7809b-1af1-42ad-80e7-a2da9d58c002' if schema == 'quo' else '6ba7809b-1af1-42ad-80e7-a2da9d58c001'
            if any(row['TenantId'] != expected for row in current): raise RuntimeError(f'Unexpected tenant mapping in {key}')
        summary[key] = {'preserved': len(snapshot[key]), 'current': len(current)}
    summary['memberships'] = int(query(connection, 'SELECT count(*)::text AS count FROM platform."TenantMemberships"')[0]['count'])
    summary['readyApplications'] = int(query(connection, 'SELECT count(*)::text AS count FROM platform."TenantApplications" WHERE "ProvisioningStatus" = \'Ready\'')[0]['count'])
    pq.PQfinish(connection)
    (OUTPUT / ('supabase-verification.json' if cloud else 'rehearsal-verification.json')).write_text(json.dumps(summary, indent=2))
    print('Verified preservation of', sum(len(value) for value in snapshot.values()), 'original rows across', len(TABLES), 'tables; ready apps:', summary['readyApplications'])

def migrate_cloud():
    # This operation is invoked explicitly, after the approved populated-data rehearsal.
    connection = connect(True)
    administrators = query(connection, 'SELECT "Id"::text AS id FROM public."Users" WHERE "Email" = $1 AND "IsActive" AND NOT "IsDeleted"', ['admin@template.com'])
    if len(administrators) != 1: raise RuntimeError('The approved active administrator could not be uniquely identified.')
    applied = query(connection, 'SELECT count(*)::text AS count FROM public."__EFMigrationsHistory" WHERE "MigrationId" = $1', ['20261114080350_AddMultiTenantPlatform'])[0]['count']
    pq.PQfinish(connection)
    if applied == '1':
        verify_snapshot(True)
        print('Migration already applied; preserved the original encrypted backup.')
        return
    previous = OUTPUT / 'runtime/supabase-before-multi-tenant.dpapi'
    if previous.exists():
        (OUTPUT / 'runtime/supabase-rehearsal-snapshot.dpapi').write_bytes(previous.read_bytes())
    backup()
    environment = os.environ.copy()
    configuration = json.loads((ROOT / 'BE/src/API/appsettings.Development.json').read_text(encoding='utf-8-sig'))
    environment['TEMPLATE_MIGRATION_CONNECTION_STRING'] = configuration['ConnectionStrings']['DefaultConnection']
    environment['Tenancy__BootstrapPlatformAdminUserId'] = administrators[0]['id']
    environment['SeedData__Enabled'] = 'false'
    environment['Logging__LogLevel__Microsoft.EntityFrameworkCore.Database.Command'] = 'Warning'
    executable = ROOT / 'BE/src/API/bin/Debug/net10.0/OnePortal.API.dll'
    completed = subprocess.run(['dotnet', str(executable), '--initialize-database'], cwd=ROOT / 'BE/src/API', env=environment, capture_output=True, timeout=300)
    (OUTPUT / 'runtime/supabase-initialization.log').write_bytes(completed.stdout + completed.stderr)
    if completed.returncode: raise RuntimeError('Initialization failed. Inspect the private runtime log; no credentials were logged here.')
    verify_snapshot(True)
    connection = connect(True)
    status = query(connection, 'SELECT "IsPlatformAdmin"::text AS enabled FROM public."Users" WHERE "Id" = $1::uuid', [administrators[0]['id']])
    if status[0]['enabled'] != 'true': raise RuntimeError('Approved platform administrator was not initialized.')
    metadata = {
        'migration': query(connection, 'SELECT "MigrationId" FROM public."__EFMigrationsHistory" ORDER BY "MigrationId" DESC LIMIT 1')[0]['MigrationId'],
        'platformAdminEmail': 'admin@template.com', 'platformAdminEnabled': True,
        'applications': query(connection, 'SELECT "AppKey", "ProvisioningStatus", "SeedVersion"::text FROM platform."TenantApplications" ORDER BY "AppKey"'),
        'validatedForeignKeys': query(connection, "SELECT count(*)::text AS count FROM pg_constraint WHERE contype='f' AND convalidated AND connamespace IN ('public'::regnamespace, 'quo'::regnamespace, 'platform'::regnamespace)")[0]['count'],
    }
    pq.PQfinish(connection)
    (OUTPUT / 'supabase-initialization-summary.json').write_text(json.dumps(metadata, indent=2))
    print('Configured Supabase migration and approved platform administrator initialization completed.')

if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    action = sys.argv[1]
    if action == 'migrate-configured-supabase': migrate_cloud()
    elif action == 'backup': backup()
    elif action == 'restore-clone': restore_clone()
    elif action == 'bootstrap-e2e': bootstrap_e2e()
    elif action == 'verify-snapshot': verify_snapshot('--cloud' in sys.argv)
    elif action == 'reset-e2e':
        handle = connect()
        query(handle, 'DROP DATABASE IF EXISTS oneportal_e2e WITH (FORCE)')
        query(handle, "CREATE DATABASE oneportal_e2e TEMPLATE template0 LOCALE_PROVIDER icu ICU_LOCALE 'und'")
        pq.PQfinish(handle); print('Local disposable E2E database reset.')
    elif action == 'create-local':
        database = sys.argv[2]
        if database not in ('oneportal_e2e', 'oneportal_cloud_rehearsal'): raise ValueError('Unrecognized disposable database')
        handle = connect(); query(handle, f'CREATE DATABASE {database} TEMPLATE template0 LOCALE_PROVIDER icu ICU_LOCALE \'und\''); pq.PQfinish(handle); print('Disposable database created:', database)
