# Web WebSocket Chat — Frontend Integration Guide

## Overview

Web chat supports real-time streaming via WebSocket alongside the existing HTTP fallback (`POST /api/web/chat/:id/messages`). Two WebSocket actions are available:

| Action | Purpose | Cost |
|--------|---------|------|
| `web_chat` | Streaming text chat | 1 coin (free for subscribers) |
| `web_voice_chat` | Streaming text + TTS audio | 80 coins (free for subscribers) |

Credits are cached in Redis at chat start and deducted atomically by the Lambda using a Lua script. Postgres syncs lazily via write-behind. **No pre-flight HTTP call or refund endpoint needed.**

---

## Flow

```
┌─────────┐         ┌─────────────┐         ┌────────────────┐
│ Frontend │         │ Express API │         │ Lambda (WS)    │
└────┬────┘         └──────┬──────┘         └───────┬────────┘
     │                     │                        │
     │  1. POST /chat/start│                        │
     │────────────────────>│                        │
     │  { character_id }   │  cache credits in Redis│
     │  { chatroom_id }    │                        │
     │<────────────────────│                        │
     │                     │                        │
     │  2. WS send { action, chatroomId, userId, content }
     │─────────────────────────────────────────────>│
     │                     │  Lua: check+deduct     │
     │                     │  INCRBY wallet_spent   │
     │                     │                        │
     │  3. WS receive streaming chunks              │
     │<─────────────────────────────────────────────│
     │  { type: "chunk" }                           │
     │  { type: "audio" }  (voice only)             │
     │  { type: "complete" }                        │
     │                     │                        │
     │  (next Express req) │                        │
     │────────────────────>│  sync wallet_spent     │
     │                     │  to Postgres           │
```

---

## Step 1 — Start or Resume Chat

Call this endpoint to open a chat. It caches the user's credit info in Redis for the Lambda to use.

```
POST /api/web/chat/start
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "character_id": "uuid"
}
```

### Response

**200/201 — Chat ready**
```json
{
  "content": {
    "chatroom_id": "uuid",
    "is_new": true,
    "character": { "id": "uuid", "name": "Luna", "image_url": "..." }
  },
  "httpStatusCode": 200,
  "success": true
}
```

This also caches `web_credits:{chatroomId}:{userId}` in Redis with:
- `coinBalance` — current wallet balance
- `isSubscriber` — whether the user has an active subscription
- `costMessage` — 0 for subscribers, 1 otherwise
- `costVoice` — 0 for subscribers, 80 otherwise

The cache has a **20-minute TTL**, matching the chat context cache.

---

## Step 2 — Send WebSocket Message

Connect to the WebSocket endpoint with a JWT token as a query parameter:

```
wss://<api-gateway-url>?token=<jwt>
```

### Text Chat (`web_chat`)

```json
{
  "action": "web_chat",
  "chatroomId": "uuid",
  "userId": "uuid",
  "content": "Hello, how are you?"
}
```

### Voice Chat (`web_voice_chat`)

```json
{
  "action": "web_voice_chat",
  "chatroomId": "uuid",
  "userId": "uuid",
  "content": "Hello, how are you?",
  "voiceId": "voice-id-string"
}
```

### Required Fields

| Field | `web_chat` | `web_voice_chat` | Description |
|-------|:----------:|:-----------------:|-------------|
| `action` | required | required | `"web_chat"` or `"web_voice_chat"` |
| `chatroomId` | required | required | UUID of the chatroom |
| `userId` | required | required | UUID of the authenticated user |
| `content` | required | required | Message text (max 5000 chars, non-empty) |
| `voiceId` | — | required | Voice ID for text-to-speech |

---

## Step 3 — Receive WebSocket Events

### Text Chunks (both actions)

Streamed as the LLM generates:

```json
{
  "type": "chunk",
  "data": "partial text..."
}
```

### Audio Chunks (`web_voice_chat` only)

Base64-encoded audio alongside text chunks:

```json
{
  "type": "audio",
  "data": "base64-encoded-audio-bytes"
}
```

### Completion

Sent when the full response is ready:

```json
{
  "type": "complete",
  "data": "full response text"
}
```

### Cache Miss

If the chatroom's Redis cache has expired (TTL is 20 minutes), you'll receive:

```json
{
  "type": "cache_miss",
  "data": {
    "chatroomId": "uuid",
    "missingData": {
      "llmPrompt": true,
      "chatContext": false
    }
  }
}
```

**How to handle:** Call `POST /api/web/chat/start` with the character ID to re-warm the cache (this also refreshes credit info), then retry the WebSocket message.

### Errors

```json
{
  "type": "error",
  "error": "Error message",
  "code": "ERROR_CODE",
  "requestId": "lambda-request-id"
}
```

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| `CREDITS_NOT_CACHED` | Credit cache expired or missing | Re-call `/chat/start`, then retry |
| `INSUFFICIENT_CREDITS` | Not enough coins | Show top-up prompt |
| `NOT_WEB_CHAT` | Chatroom wasn't created via web platform | — |

---

## Complete Example (TypeScript)

```typescript
const WS_URL = 'wss://your-api-gateway-url';
const API_URL = 'https://your-api-url/api/web';

async function sendWebChatMessage(
  characterId: string,
  content: string,
  jwt: string,
  userId: string,
) {
  // 1. Start/resume chat (caches credits)
  const startRes = await fetch(`${API_URL}/chat/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ character_id: characterId }),
  });
  const { content: startData } = await startRes.json();
  const chatroomId = startData.chatroom_id;

  // 2. Send via WebSocket — no pre-flight token needed
  const ws = new WebSocket(`${WS_URL}?token=${jwt}`);
  let fullResponse = '';

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      ws.close();
      reject(new Error('Timeout'));
    }, 45_000);

    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'web_chat',
        chatroomId,
        userId,
        content,
      }));
    };

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case 'chunk':
          fullResponse += msg.data;
          break;

        case 'complete':
          clearTimeout(timeout);
          ws.close();
          resolve(msg.data);
          break;

        case 'cache_miss':
          clearTimeout(timeout);
          ws.close();
          // Re-call /chat/start to refresh cache, then retry
          reject(new Error('cache_miss'));
          break;

        case 'error':
          clearTimeout(timeout);
          ws.close();
          if (msg.code === 'CREDITS_NOT_CACHED') {
            // Re-call /chat/start to refresh credit cache
            reject(new Error('credits_not_cached'));
          } else if (msg.code === 'INSUFFICIENT_CREDITS') {
            reject(new Error('insufficient_credits'));
          } else {
            reject(new Error(msg.error));
          }
          break;
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('WebSocket error'));
    };
  });
}
```

---

## Credit System — How It Works

1. **`/chat/start`** caches `web_credits:{chatroomId}:{userId}` in Redis (balance, subscription status, per-action costs).
2. **Lambda** uses a Lua script to atomically check balance and deduct coins from the Redis cache. No race conditions.
3. **Lambda** increments `wallet_spent:{userId}` (a simple counter) to track total spend.
4. **Express** flushes `wallet_spent:{userId}` to Postgres on the next authenticated request (fire-and-forget in auth middleware).
5. **`/chat/start`** also syncs pending spend before reading fresh balance, ensuring the cache is always accurate.

### Edge Cases

| Concern | Mitigation |
|---------|------------|
| Race condition (concurrent messages) | Lua script is atomic — check + deduct in one Redis call |
| User tops up mid-chat | Re-call `/chat/start` to refresh cached balance |
| Redis eviction | `CREDITS_NOT_CACHED` error → frontend re-calls `/chat/start` |
| Stale Postgres balance | `/chat/start` flushes pending spend before reading fresh balance |
| User churns (never returns) | `wallet_spent:{userId}` has 24h TTL. Loss is at most a few coins |

---

## HTTP Fallback

The existing synchronous endpoint still works as a fallback:

```
POST /api/web/chat/{chatroomId}/messages
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "content": "Hello!"
}
```

This uses the `checkWebCredits('message')` middleware for billing (deducts directly from Postgres) and returns the full response in one shot (no streaming).
