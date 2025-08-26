import http from 'http';
import { URL } from 'url';
import fetch from 'node-fetch';

const server = http.createServer(async (req, res) => {
  if (!req.url) return;
  const parsed = new URL(req.url, 'http://localhost');
  if (parsed.pathname !== '/proxy') {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }
  const target = parsed.searchParams.get('url');
  if (!target || !/^https?:\/\//i.test(target)) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Invalid or missing url parameter' }));
    return;
  }
  try {
    const resp = await fetch(target, { headers: { 'User-Agent': 'EduAI/1.0 (+https://eduai.local)' } });
    const text = await resp.text();
    res.statusCode = 200;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(text);
  } catch (e: any) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Failed to fetch target', detail: e.message }));
  }
});

const port = process.env.PORT ? Number(process.env.PORT) : 5174;
server.listen(port, () => console.log(`[proxy] listening on :${port}`));
