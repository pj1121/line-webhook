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

    // Fire-and-forget: 不 await，直接放生
    fetch(GAS_URL, {
      method: 'POST',
      body: raw,
      headers: {
        'content-type': 'application/json',
        'x-line-signature': signature
      },
      redirect: 'follow'
    }).catch(err => console.error('forward failed', err));

    // 立刻回 200，不等 GAS
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    return res.end('ok');
  } catch (err) {
    console.error('line-webhook error:', err);
    res.statusCode = 200;
    return res.end('ok');
  }
}
