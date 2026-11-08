// Local-only Supabase Storage protocol fixture. Never point this at a cloud project.
import { createServer } from 'node:http';

const images = new Map();
let bucketExists = false;
const server = createServer(async (request, response) => {
  const reply = (status, data) => { response.writeHead(status, { 'Content-Type': 'application/json' }); response.end(JSON.stringify(data)); };
  if (request.headers.apikey !== 'synthetic-image-key' || request.headers.authorization !== 'Bearer synthetic-image-key') return reply(401, {});
  if (request.url === '/storage/v1/bucket/product-images' && request.method === 'GET') return reply(bucketExists ? 200 : 400, bucketExists ? { id: 'product-images', public: false } : { statusCode: '404', code: 'NoSuchBucket' });
  if (request.url === '/storage/v1/bucket' && request.method === 'POST') {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    const bucket = JSON.parse(Buffer.concat(chunks));
    if (bucket.id !== 'product-images' || bucket.public !== false) return reply(400, {});
    bucketExists = true; return reply(200, { name: bucket.id });
  }
  const match = request.url.match(/^\/storage\/v1\/object\/(authenticated\/)?product-images\/uploads\/([a-f0-9]{32}\.(png|jpg))$/);
  if (!match || !bucketExists) return reply(404, {});
  const name = match[2];
  if (request.method === 'POST' && !match[1]) {
    const chunks = []; for await (const chunk of request) chunks.push(chunk);
    if (images.has(name)) return reply(409, {});
    images.set(name, { bytes: Buffer.concat(chunks), type: request.headers['content-type'] }); return reply(200, { Key: `product-images/uploads/${name}` });
  }
  const image = images.get(name);
  if (request.method === 'GET' && match[1] && image) { response.writeHead(200, { 'Content-Type': image.type, 'Content-Length': image.bytes.length }); response.end(image.bytes); return; }
  reply(404, {});
});
server.listen(55440, '127.0.0.1');
