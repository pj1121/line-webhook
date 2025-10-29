// api/line-webhook.js
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyN1MUcmeYMEhCC1RFmDWfzzxF02ccUhYG-Py0vG2LbtbI3F6DTiKGUMJikSqtWSXQ5/exec';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('ok');
    }

const raw = await new Promise((resolve, reject) => {
  let data = '';
  req.on('data', c => (data += c));
  req.on('end', () => resolve(data));
  req.on('error', reject);
});

const signature = req.headers['x-line-signature'] || req.headers['X-Line-Signature'] || '';

// 把簽章塞進 querystring（GAS 讀得到 e.parameter）
const url = GAS_URL + (GAS_URL.includes('?') ? '&' : '?') +
            'x_line_signature=' + encodeURIComponent(signature);

// Fire-and-forget（避免 LINE 超時）
fetch(url, {
  method: 'POST',
  body: raw,
  headers: { 'content-type': 'application/json' },
  redirect: 'follow'
}).catch(err => console.error('forward failed', err));

res.statusCode = 200;
res.setHeader('Content-Type', 'text/plain');
return res.end('ok');
  }
}
