// api/line-webhook.js
// Node Serverless Function 版：不用 Edge、不要 vercel.json、不要 "type": "module"

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyN1MUcmeYMEhCC1RFmDWfzzxF02ccUhYG-Py0vG2LbtbI3F6DTiKGUMJikSqtWSXQ5/exec';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('ok');
    }

    // 讀取 raw body（保留 LINE 原樣，避免驗章時踩雷）
    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', c => (data += c));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    const signature = req.headers['x-line-signature'] || req.headers['X-Line-Signature'] || '';

    console.log('line-webhook: received', { length: raw.length, hasSig: !!signature });

    // Node 18+/20+ 內建 fetch，可直接用
    const fwd = await fetch(GAS_URL, {
      method: 'POST',
      body: raw,
      headers: {
        'content-type': 'application/json',
        'x-line-signature': signature
      },
      redirect: 'follow'
    });

    console.log('line-webhook: forwarded to GAS, status=', fwd.status);

    // 一律 200，避免 LINE 重試
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('ok');
  } catch (err) {
    console.error('line-webhook error:', err);
    // 兜底也回 200
    res.statusCode = 200;
    return res.end('ok');
  }
}
