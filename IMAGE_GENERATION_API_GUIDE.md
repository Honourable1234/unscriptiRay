# Image Generation API Guide

Base URL: `{API_HOST}/api/web`

All endpoints require `Authorization: Bearer <JWT>` (Supabase web project token).

---

## 1. Generate an Image

```
POST /generate/image
```

```json
{
  "character_ids": ["<character-uuid>"],
  "orientation": "9:16",
  "action": "standing casually",
  "setting": "soft indoor lighting, cozy room",
  "mood": "gentle smile",
  "quality": "balance",
  "location_preset": "bedroom",
  "outfit_preset": "casual",
  "pose_preset": "standing"
}
```

Optional fields: `visual` (`cinematic` | `realistic`), `advanced_prompt` (overrides auto-composed prompt), `negative_prompt`, `face_negative_prompt`, `reference_image_key` (CDN URL of a custom face reference).

**Response (201):**
```json
{
  "generation_id": "abc-123",
  "status": "pending"
}
```

Rate limit: 10 req/min. Requires credits (`image_gen`).

---

## 2. Poll for Status

```
GET /generate/status/<generation_id>
```

**Response:**
```json
{
  "generation_id": "abc-123",
  "type": "image",
  "status": "dispatched",
  "url": null
}
```

Status flow: `pending` -> `dispatched` -> `in_progress` -> `complete` (or `failed`).

When `status === "complete"`, the `url` field contains the CDN link to the image.

---

## 3. Real-Time Updates via SSE

Instead of polling, connect to the SSE stream for push updates:

```
GET /events
Authorization: Bearer <JWT>
```

```js
const evtSource = new EventSource('/api/web/events', {
  headers: { Authorization: `Bearer ${token}` }
});

// Or with fetch-based EventSource (e.g. eventsource-parser):
const res = await fetch(`${API_HOST}/api/web/events`, {
  headers: { Authorization: `Bearer ${token}` }
});

const reader = res.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) {
    break;
  }

  const text = decoder.decode(value);
  // Parse SSE format: "event: generation.update\ndata: {...}\n\n"
  const lines = text.split('\n');
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const payload = JSON.parse(line.slice(6));
      console.log(payload);
    }
  }
}
```

**Events you'll receive:**

```
event: generation.update
data: {"generation_id":"abc-123","type":"image","status":"dispatched"}

event: generation.update
data: {"generation_id":"abc-123","type":"image","status":"in_progress"}

event: generation.update
data: {"generation_id":"abc-123","type":"image","status":"complete","url":"https://cdn.example.com/image.jpg"}
```

The server sends `:ping` every 30 seconds as a keepalive. Max 5 concurrent SSE connections per user.

---

## 4. Full Flow Example (JS)

```js
const API = 'https://your-api-host.com/api/web';
const TOKEN = '<jwt>';
const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

// 1. Start generation
const res = await fetch(`${API}/generate/image`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    character_ids: ['char-uuid-here'],
    orientation: '9:16',
    setting: 'cinematic bedroom lighting',
    quality: 'balance'
  })
});
const { generation_id } = await res.json();
console.log('Started:', generation_id);

// 2a. Option A: Poll until done
async function pollUntilDone(id) {
  while (true) {
    const r = await fetch(`${API}/generate/status/${id}`, { headers });
    const data = await r.json();

    console.log(`Status: ${data.status}`);

    if (data.status === 'complete') {
      return data.url;
    }
    if (data.status === 'failed') {
      throw new Error('Generation failed');
    }

    await new Promise(r => setTimeout(r, 3000));
  }
}

const imageUrl = await pollUntilDone(generation_id);
console.log('Image ready:', imageUrl);

// 2b. Option B: Use SSE (preferred)
// Connect once and listen for all generation updates
const sse = new EventSource(`${API}/events`); // attach auth via query param or custom impl
sse.addEventListener('generation.update', (e) => {
  const data = JSON.parse(e.data);
  if (data.generation_id === generation_id && data.status === 'complete') {
    console.log('Image ready:', data.url);
    sse.close();
  }
});
```

---

## 5. Other Useful Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /generate/presets?type=action` | GET | List available presets (action, mood, setting, voice, style_preset) |
| `GET /generate/image-presets?category=pose` | GET | Image presets grouped by location/outfit/pose |
| `POST /generate/enrich` | POST | AI-expand a short prompt into a detailed one |
| `POST /generate/upload-reference` | POST | Get presigned S3 URL to upload a custom face reference |
| `POST /generate/animation` | POST | Generate video (modes: style_preset, image_to_video, talking) |
| `POST /generate/enhance` | POST | Upscale/enhance an existing image |
| `POST /generate/:id/retry` | POST | Retry a failed generation |
| `GET /generate/assets` | GET | List user's generated assets (paginated) |
| `DELETE /generate/assets/:id` | DELETE | Soft-delete an asset |

---

## 6. Orientation Options

| Value | Resolution |
|-------|-----------|
| `16:9` | 1152 x 896 (landscape) |
| `9:16` | 896 x 1152 (portrait) |
| `4:5` | 896 x 1120 |
| `1:1` | 1024 x 1024 (square) |

---

## 7. Error Responses

- **401** - Missing or invalid JWT
- **402** - Insufficient credits (`{ "error": "insufficient_credits", "coin_balance": 0 }`)
- **404** - Character or asset not found
- **429** - Rate limited (10 req/min on generation endpoints)
- **500** - Server error / dispatch failed
