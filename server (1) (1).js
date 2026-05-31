// Joeliz Assistant Proxy | JODAM TEC SOLUTIONS | Copyright (c) 2026
// Forwards translation requests to Sunbird AI — bypasses CORS

const http = require('http');
const https = require('https');

const SUNBIRD_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ3YWZ1bGEiLCJhY2NvdW50X3R5cGUiOiJGcmVlIiwiZXhwIjo0OTMzNzcxOTY2fQ.dReBkJrqtax3cDty3maVda_ox9I36XOISaa6IGvmcbo";
const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS headers — allow from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status:'ok', service:'Joeliz Translation Proxy', brand:'JODAM TEC SOLUTIONS'}));
    return;
  }

  if (req.method === 'POST' && req.url === '/translate') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const {text, source_language, target_language} = JSON.parse(body);
        if (!text || !source_language || !target_language) {
          res.writeHead(400, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: 'Missing fields'}));
          return;
        }

        const payload = JSON.stringify({text, source_language, target_language});
        const options = {
          hostname: 'api.sunbird.ai',
          path: '/tasks/nllb_translate',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + SUNBIRD_KEY,
            'Content-Length': Buffer.byteLength(payload)
          }
        };

        const proxyReq = https.request(options, (proxyRes) => {
          let data = '';
          proxyRes.on('data', chunk => data += chunk);
          proxyRes.on('end', () => {
            res.writeHead(proxyRes.statusCode, {'Content-Type': 'application/json'});
            res.end(data);
          });
        });

        proxyReq.on('error', (e) => {
          res.writeHead(500, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({error: e.message}));
        });

        proxyReq.write(payload);
        proxyReq.end();

      } catch(e) {
        res.writeHead(400, {'Content-Type': 'application/json'});
        res.end(JSON.stringify({error: 'Invalid JSON'}));
      }
    });
    return;
  }

  res.writeHead(404); res.end('Not found');
});

server.listen(PORT, () => {
  console.log('Joeliz Proxy running on port', PORT);
  console.log('JODAM TEC SOLUTIONS 🇺🇬🤟');
});
