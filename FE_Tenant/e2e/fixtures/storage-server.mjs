// Loopback-only storage protocol fixture; all credentials and data are synthetic.
import { createServer } from 'node:http';
const objects = new Map();
const buckets = new Set(['quotations']);
createServer(async (request, response) => {
  const json = (status, value = {}) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(value)); };
  if (request.headers.apikey !== 'synthetic-storage-key') return json(401);
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname.startsWith('/storage/v1/bucket/') && request.method === 'GET') return json(buckets.has(url.pathname.split('/').at(-1)) ? 200 : 404);
  if (url.pathname === '/storage/v1/bucket' && request.method === 'POST') {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    const bucket = JSON.parse(Buffer.concat(chunks)); if (bucket.public !== false) return json(400);
    buckets.add(bucket.id); return json(200, { id: bucket.id });
  }
  const match = url.pathname.match(/^\/storage\/v1\/object\/(authenticated\/)?([^/]+)\/(.+)$/);
  if (!match || !buckets.has(match[2])) return json(404);
  const key = match[2] + '/' + decodeURIComponent(match[3]);
  if (request.method === 'POST' && !match[1]) {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    if (objects.has(key)) return json(409);
    objects.set(key, { data: Buffer.concat(chunks), mime: request.headers['content-type'] }); return json(200, { Key: key });
  }
  const object = objects.get(key);
  if (request.method === 'GET' && match[1] && object) { response.writeHead(200, { 'Content-Type': object.mime, 'Content-Length': object.data.length }); return response.end(object.data); }
  json(404);
}).listen(55440, '127.0.0.1');
