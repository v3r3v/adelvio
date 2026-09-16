"""Integration checks against a running LOCAL Wrangler demo; never production."""
import http.cookiejar
import json
from pathlib import Path
import sqlite3
import urllib.error
import urllib.request

BASE = 'http://127.0.0.1:8787'
jar = http.cookiejar.CookieJar()
client = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
checks = 0

def call(path, payload=None, expected=200, origin=BASE):
    global checks
    request = urllib.request.Request(BASE + path, data=json.dumps(payload).encode() if payload is not None else None,
        headers={'Origin': origin, 'Content-Type': 'application/json'})
    try:
        response = client.open(request, timeout=15)
    except urllib.error.HTTPError as error:
        response = error
    assert response.status == expected, (path, response.status, response.read().decode())
    body = response.read()
    checks += 1
    if response.headers.get('content-type', '').startswith('application/json'):
        assert 'no-store' in response.headers.get('cache-control', '')
        return json.loads(body)
    return body.decode()

for route in ['/portal', '/portal/login', '/portal/support', '/portal/support/REQ-1042', '/portal/settings']:
    assert 'portal-root' in call(route)
assert 'hero-title' in call('/')
manifest=json.loads(call('/portal/manifest.webmanifest'))
assert manifest['display']=='standalone'
assert 'caches.open' not in call('/portal/sw.js')
call('/api/portal/snapshot', expected=401)
call('/api/portal/login', {'profile':'client'}, expected=403, origin='https://untrusted.example')
call('/api/portal/login', {'profile':'client'})
first=call('/api/portal/snapshot')
assert first['actor']['role']=='client'
assert all(not m['internal'] for t in first['tickets'] for m in t['messages'])
call('/api/portal/snapshot?tenant=lino', expected=403)
ticket=call('/api/portal/tickets', {'tenantId':'atelier','websiteId':'web-atelier','category':'Cambiar texto','subject':'HTTP workflow example','description':'Synthetic content only.','page':'/example','priority':'Normal','attachments':[]}, expected=201)
endpoint='/api/portal/tickets/'+ticket['id']
call(endpoint, {'action':'message','text':'Client test message'})
call(endpoint, {'action':'message','text':'Denied internal note','internal':True}, expected=403)
call('/api/portal/role', {'profile':'admin'})
call(endpoint, {'action':'message','text':'Admin private example','internal':True})
call(endpoint, {'action':'estimate','amount':175,'scope':'Synthetic scope','approvalRequired':True})
call(endpoint, {'action':'status','status':'In Progress'}, expected=409)
call('/api/portal/role', {'profile':'client'})
assert 'Admin private example' not in json.dumps(call(endpoint))
call(endpoint, {'action':'approve','revision':1})
call(endpoint, {'action':'approve','revision':1}, expected=409)
call('/api/portal/role', {'profile':'admin'})
call(endpoint, {'action':'status','status':'In Progress'})
call(endpoint, {'action':'status','status':'Completed','completion':'Example verified'})
assert call(endpoint)['completedAt']
call('/api/portal/workspace', {'tenantId':'lino','status':'Maintenance','used':10,'announcement':'Synthetic maintenance notice'})
call('/api/portal/role', {'profile':'second'})
call(endpoint, expected=403)
second=call('/api/portal/snapshot')
assert second['workspace']['websites'][0]['health']['status']=='Maintenance'
assert not second['tickets']
call('/api/portal/logout', {})
call('/api/portal/snapshot', expected=401)

# The proposed schema compiles and its composite foreign keys block cross-tenant writes.
db=sqlite3.connect(':memory:')
db.executescript(Path('migrations/portal/0001_proposed.sql').read_text())
db.execute("INSERT INTO clients VALUES ('a','A','now')")
db.execute("INSERT INTO clients VALUES ('b','B','now')")
db.execute("INSERT INTO websites VALUES ('w','a','A','a.example')")
try:
    db.execute("INSERT INTO incidents VALUES ('i','b','w','test','now',NULL)")
    raise AssertionError('Cross-tenant foreign key accepted')
except sqlite3.IntegrityError:
    pass
print(f'{checks} local HTTP checks passed; proposed SQL schema and tenant foreign keys verified.')
