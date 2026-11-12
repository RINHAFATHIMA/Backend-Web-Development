
'use strict';

const crypto = require('node:crypto');
const { handleEvent } = require('./eventHandlers');

const _processedIds = new Set();

async function handleWebhook(req, res) {
  // 1. Verify HMAC signature
  const signature = req.headers['x-webhook-signature'];

  if (!signature || !signature.startsWith('sha256=')) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const expected = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  const received = signature.slice(7);

  if (!/^[a-fA-F0-9]{64}$/.test(received)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const valid = crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(received, 'hex')
  );

  if (!valid) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 2. Parse body after verification
  const event = JSON.parse(req.body);

  // 3. Check for duplicate events
  if (_processedIds.has(event.id)) {
    return res.status(200).json({ status: 'already_processed' });
  }

  // 4. Mark event as processed
  _processedIds.add(event.id);

  // 5. Respond immediately
  res.status(200).json({ status: 'received' });

  // 6. Process after responding
  setImmediate(() => {
    handleEvent(event);
  });
}

module.exports = { handleWebhook, _processedIds };
