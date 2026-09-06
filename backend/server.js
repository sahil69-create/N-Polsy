require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

const ORCA_API_KEY = process.env.ORCA_API_KEY;
const MODEL_NAME = process.env.MODEL_NAME || 'obsidian/Qwen3.8-27B';
const ORCA_API_BASE_URL = process.env.ORCA_API_BASE_URL || 'https://api.orcarouter.ai/v1';
const MAX_MESSAGE_SIZE = 256 * 1024;
const MAX_MESSAGES_PER_REQUEST = 40;
const MAX_TOKENS = process.env.MAX_TOKENS ? parseInt(process.env.MAX_TOKENS) : 4096;
const TEMPERATURE = process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : 0.7;

const SYSTEM_PROMPT = `You are a helpful, direct, and knowledgeable AI assistant.

Core principles:
- Be natural and conversational, not robotic
- Be concise when appropriate, detailed when necessary
- Follow conversation context closely
- If you are uncertain about something, state it clearly rather than fabricating answers
- Use Markdown for formatting when it improves readability: headings, bold, italic, lists, code blocks, tables
- When writing code or technical content, always use fenced code blocks with language identifiers
- Avoid unnecessary disclaimers, repetitive phrases, and filler text
- Answer in the same language as the user's query

Formatting guidelines:
- Use **bold** for emphasis
- Use headings (##, ###) for structured answers
- Use ordered/unordered lists for multiple items
- Use \`inline code\` for short snippets and \`\`\`language ... \`\`\` blocks for code
- Use tables for comparative data
- Use > blockquotes for notable information`;

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://cdn.tailwindcss.com', "'unsafe-inline'"],
      'style-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://cdn.tailwindcss.com', 'https://fonts.googleapis.com', "'unsafe-inline'"],
      'font-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://fonts.gstatic.com', 'data:'],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
    },
  },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
  referrerPolicy: { policy: 'no-referrer' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xssFilter: true,
  noSniff: true,
  frameguard: { action: 'deny' },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: false,
}));

app.use(express.json({ limit: MAX_MESSAGE_SIZE }));
app.use(express.urlencoded({ extended: false, limit: MAX_MESSAGE_SIZE }));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
});

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR, {
  index: false,
  maxAge: process.env.NODE_ENV === 'production' ? '1h' : 0,
  dotfiles: 'deny',
}));

app.get('/', (_req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

app.get('/api/health', healthLimiter, (_req, res) => {
  const hasKey = Boolean(ORCA_API_KEY) && ORCA_API_KEY.length > 8;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    model: MODEL_NAME,
    apiBaseUrl: ORCA_API_BASE_URL,
    apiKeyConfigured: hasKey,
    version: '1.0.0',
  });
});

function validateMessages(messages) {
  if (!Array.isArray(messages)) {
    return 'Messages must be an array';
  }
  if (messages.length === 0) {
    return 'Messages cannot be empty';
  }
  if (messages.length > MAX_MESSAGES_PER_REQUEST) {
    return `Too many messages (max ${MAX_MESSAGES_PER_REQUEST})`;
  }

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (!msg || typeof msg !== 'object') {
      return `Message at index ${i} is invalid`;
    }
    if (!['user', 'assistant', 'system'].includes(msg.role)) {
      return `Message at index ${i} has invalid role`;
    }
    if (typeof msg.content !== 'string') {
      return `Message content at index ${i} must be a string`;
    }
    const contentLen = Buffer.byteLength(msg.content, 'utf8');
    if (contentLen > MAX_MESSAGE_SIZE) {
      return `Message content at index ${i} exceeds size limit`;
    }
    if (msg.role === 'system' && i !== 0) {
      return 'System message is only allowed as the first message';
    }
  }

  return null;
}

function trimConversation(messages) {
  if (messages.length <= MAX_MESSAGES_PER_REQUEST) {
    return messages;
  }
  return messages.slice(messages.length - MAX_MESSAGES_PER_REQUEST);
}

function buildPromptBody(messages, stream = true) {
  return {
    model: MODEL_NAME,
    stream,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...trimConversation(messages),
    ],
  };
}

async function handleChatNonStream(res, body) {
  try {
    const response = await fetch(`${ORCA_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ORCA_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://chat.local',
        'X-Title': 'Uncensored AI Chatbot',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      let errText = '';
      try { errText = await response.text(); } catch { /* ignore */ }
      console.error('[ORCA ERROR]', response.status, errText.slice(0, 500));

      if (response.status === 401) {
        return res.status(500).json({ error: 'API configuration error. Please contact the administrator.' });
      }
      if (response.status === 429) {
        return res.status(429).json({ error: 'Rate limited by upstream provider. Please retry in a moment.' });
      }
      if (response.status >= 500) {
        return res.status(502).json({ error: 'Upstream service unavailable. Please try again later.' });
      }
      return res.status(500).json({ error: 'Something went wrong. Please try again.' });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return res.json({ content });
  } catch (err) {
    console.error('[FETCH ERROR]', err.message);
    return res.status(500).json({ error: 'Network error. Please try again.' });
  }
}

async function handleChatStream(res, body) {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  let upstream;
  try {
    upstream = await fetch(`${ORCA_API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ORCA_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://chat.local',
        'X-Title': 'Uncensored AI Chatbot',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('[STREAM FETCH ERROR]', err.message);
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'Network error connecting to service.' })}\n\n`);
    res.write('event: done\ndata: [DONE]\n\n');
    res.end();
    return;
  }

  if (!upstream.ok) {
    let errText = '';
    try { errText = await upstream.text(); } catch { /* ignore */ }
    console.error('[ORCA STREAM ERROR]', upstream.status, errText.slice(0, 500));

    let userMsg = 'Something went wrong. Please try again.';
    if (upstream.status === 401) userMsg = 'API configuration error. Please contact the administrator.';
    else if (upstream.status === 429) userMsg = 'Rate limited by upstream provider. Please retry in a moment.';
    else if (upstream.status >= 500) userMsg = 'Upstream service unavailable. Please try again later.';

    res.write(`event: error\ndata: ${JSON.stringify({ message: userMsg })}\n\n`);
    res.write('event: done\ndata: [DONE]\n\n');
    res.end();
    return;
  }

  const clientClosed = new Promise((_, reject) => {
    res.on('close', () => reject(new Error('client_closed')));
  });

  try {
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let contentSent = false;

    while (true) {
      const result = await Promise.race([
        reader.read(),
        clientClosed.catch(err => { throw err; }),
      ]);

      const { value, done } = result;
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        if (!trimmed.startsWith('data:')) continue;

        const dataStr = trimmed.slice(5).trim();
        if (!dataStr) continue;
        if (dataStr === '[DONE]') {
          res.write('event: done\ndata: [DONE]\n\n');
          if (res.flush) res.flush();
          continue;
        }

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed?.choices?.[0]?.delta?.content;
          const reasoningDelta = parsed?.choices?.[0]?.delta?.reasoning;
          const finishReason = parsed?.choices?.[0]?.finish_reason;

          if (typeof reasoningDelta === 'string' && reasoningDelta.length > 0) {
            res.write(`event: reasoning\ndata: ${JSON.stringify({ delta: reasoningDelta })}\n\n`);
            if (res.flush) res.flush();
          }

          if (typeof delta === 'string' && delta.length > 0) {
            contentSent = true;
            res.write(`event: chunk\ndata: ${JSON.stringify({ delta })}\n\n`);
            if (res.flush) res.flush();
          }

          if (finishReason) {
            res.write(`event: finish\ndata: ${JSON.stringify({ reason: finishReason })}\n\n`);
            if (res.flush) res.flush();
          }
        } catch (parseErr) {
          /* ignore malformed lines */
        }
      }
    }

    if (!contentSent) {
      const last = buffer.trim();
      if (last.startsWith('data:')) {
        const dataStr = last.slice(5).trim();
        if (dataStr && dataStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(dataStr);
            const content = parsed?.choices?.[0]?.message?.content;
            if (typeof content === 'string' && content.length > 0) {
              res.write(`event: chunk\ndata: ${JSON.stringify({ delta: content })}\n\n`);
            }
          } catch { /* ignore */ }
        }
      }
    }

    res.write('event: done\ndata: [DONE]\n\n');
    if (res.flush) res.flush();
    res.end();
  } catch (err) {
    if (err.message === 'client_closed') {
      try {
        if (upstream.body && typeof upstream.body.cancel === 'function') {
          upstream.body.cancel().catch(() => {});
        }
      } catch { /* ignore */ }
      res.end();
      return;
    }
    console.error('[STREAM PROCESS ERROR]', err.message);
    res.write(`event: error\ndata: ${JSON.stringify({ message: 'Stream interrupted. Please try again.' })}\n\n`);
    res.write('event: done\ndata: [DONE]\n\n');
    res.end();
  }
}

app.post('/api/chat', chatLimiter, async (req, res) => {
  try {
    if (!ORCA_API_KEY) {
      console.error('[CONFIG] ORCA_API_KEY is not set');
      return res.status(500).json({ error: 'Server not configured. API key is missing.' });
    }

    const { messages, stream } = req.body || {};
    const validationError = validateMessages(messages || []);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const useStream = stream !== false;
    const body = buildPromptBody(messages, useStream);

    if (useStream) {
      return await handleChatStream(res, body);
    } else {
      return await handleChatNonStream(res, body);
    }
  } catch (err) {
    console.error('[CHAT UNHANDLED ERROR]', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

app.use((err, _req, res, _next) => {
  console.error('[EXPRESS ERROR]', err);
  if (res.headersSent) return;
  res.status(500).json({ error: 'Internal server error.' });
});

app.use((_req, res) => {
  if (res.headersSent) return;
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[SERVER] Running on port ${PORT}`);
  console.log(`[SERVER] Frontend served from: ${FRONTEND_DIR}`);
  console.log(`[SERVER] Model: ${MODEL_NAME}`);
  console.log(`[SERVER] API Base: ${ORCA_API_BASE_URL}`);
  console.log(`[SERVER] API Key configured: ${Boolean(ORCA_API_KEY) && ORCA_API_KEY.length > 8}`);
});
