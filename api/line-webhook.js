export const config = { runtime: 'edge' };

const GAS_URL = 'https://script.google.com/macros/s/AKfycbyN1MUcmeYMEhCC1RFmDWfzzxF02ccUhYG-Py0vG2LbtbI3F6DTiKGUMJikSqtWSXQ5/exec';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('ok', { status: 200 });
  }

  const raw = await req.text();

  try {
    await fetch(GAS_URL, {
      method: 'POST',
      body: raw,
      redirect: 'follow',
      headers: {
        'Content-Type': 'application/json',
        'X-Line-Signature': req.headers.get('X-Line-Signature') || ''
      }
    });
  } catch (e) {
    // 即使錯誤也固定回200，讓LINE Verify過關
  }

  return new Response('ok', { status: 200 });
}
