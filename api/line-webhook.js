// api/line-webhook.js  Node 版
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      return res.end('ok');
    }

    const raw = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', (c) => (data += c));
      req.on('end', () => resolve(data));
      req.on('error', reject);
    });

    const signature = req.headers['x-line-signature'] || '';

    await fetch('https://script.google.com/macros/s/AKfycbyN1MUcmeYMEhCC1RFmDWfzzxF02ccUhYG-Py0vG2LbtbI3F6DTiKGUMJikSqtWSXQ5/exec', {
      method: 'POST',
      body: raw,
      headers: {
        'content-type': 'application/json',
        'x-line-signature': signature
      }
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('ok');
  } catch (err) {
    // 兜底 200，避免 LINE 重試
    res.statusCode = 200;
    return res.end('ok');
  }
}
