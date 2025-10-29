export const config = { runtime: 'edge' };

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyN1MUcmeYMEhCC1RFmDWfzzxF02ccUhYG-Py0vG2LbtbI3F6DTiKGUMJikSqtWSXQ5/exec';

export default async function handler(req) {
  try {
    if (req.method !== 'POST') {
      return new Response('ok', { status: 200 });
    }

    const raw = await req.text();
    const signature = req.headers.get('x-line-signature') || req.headers.get('X-Line-Signature') || '';

    console.log('line-webhook: received', { length: raw.length, signature: !!signature });

    const forwardRes = await fetch(GAS_URL, {
      method: 'POST',
      body: raw,
      redirect: 'follow',
      headers: {
        'content-type': 'application/json',
        'x-line-signature': signature
      }
    });

    console.log('line-webhook: forwarded to GAS, status=', forwardRes.status);
  } catch (err) {
    console.error('line-webhook error:', err);
    // still return 200 so LINE verify passes
  }

  return new Response('ok', { status: 200 });
}
