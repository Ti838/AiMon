/**
 * Live AI API Client
 * Makes real streaming calls to each provider using stored API keys.
 * All calls are browser-native fetch with SSE streaming.
 */

// ── OpenAI (GPT family + o1) ──────────────────────────────────────────────
export async function callOpenAI({ model, prompt, apiKey, onToken, onError }) {
  const isO1 = model.startsWith('o1');
  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    stream: !isO1,
    max_tokens: isO1 ? 2048 : 1024,
  };

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI error ${res.status}`);
  }

  if (isO1) {
    // o1 doesn't support streaming
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    for (const ch of text) onToken(ch);
    return {
      inputTokens: data.usage?.prompt_tokens || 0,
      outputTokens: data.usage?.completion_tokens || 0,
    };
  }

  return readSSEStream(res.body, (line) => {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') return null;
    try {
      const json = JSON.parse(line.slice(6));
      return json.choices?.[0]?.delta?.content || null;
    } catch { return null; }
  }, onToken);
}

// ── Anthropic (Claude) ────────────────────────────────────────────────────
export async function callAnthropic({ model, prompt, apiKey, onToken, onError }) {
  const modelMap = {
    'claude-3-5-sonnet': 'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku': 'claude-3-5-haiku-20241022',
    'claude-3-opus': 'claude-3-opus-20240229',
    'claude-3-sonnet': 'claude-3-sonnet-20240229',
    'claude-3-haiku': 'claude-3-haiku-20240307',
  };

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: modelMap[model] || model,
      max_tokens: 1024,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Anthropic error ${res.status}`);
  }

  return readSSEStream(res.body, (line) => {
    if (!line.startsWith('data: ')) return null;
    try {
      const json = JSON.parse(line.slice(6));
      if (json.type === 'content_block_delta') return json.delta?.text || null;
      return null;
    } catch { return null; }
  }, onToken);
}

// ── Google Gemini ─────────────────────────────────────────────────────────
export async function callGoogle({ model, prompt, apiKey, onToken, onError }) {
  const modelMap = {
    'gemini-1.5-pro': 'gemini-1.5-pro',
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-2.0-flash': 'gemini-2.0-flash-exp',
    'gemini-ultra': 'gemini-1.0-ultra',
  };
  const geminiModel = modelMap[model] || 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:streamGenerateContent?key=${apiKey}&alt=sse`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Google error ${res.status}`);
  }

  return readSSEStream(res.body, (line) => {
    if (!line.startsWith('data: ')) return null;
    try {
      const json = JSON.parse(line.slice(6));
      return json.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch { return null; }
  }, onToken);
}

// ── Mistral ───────────────────────────────────────────────────────────────
export async function callMistral({ model, prompt, apiKey, onToken, onError }) {
  const modelMap = {
    'mistral-large': 'mistral-large-latest',
    'mistral-medium': 'mistral-medium-latest',
    'mistral-small': 'mistral-small-latest',
    'mixtral-8x7b': 'open-mixtral-8x7b',
    'codestral': 'codestral-latest',
  };

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelMap[model] || model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Mistral error ${res.status}`);
  }

  return readSSEStream(res.body, (line) => {
    if (!line.startsWith('data: ') || line.includes('[DONE]')) return null;
    try {
      const json = JSON.parse(line.slice(6));
      return json.choices?.[0]?.delta?.content || null;
    } catch { return null; }
  }, onToken);
}

// ── Cohere ────────────────────────────────────────────────────────────────
export async function callCohere({ model, prompt, apiKey, onToken, onError }) {
  const modelMap = {
    'command-r-plus': 'command-r-plus',
    'command-r': 'command-r',
    'command-light': 'command-light',
  };

  const res = await fetch('https://api.cohere.ai/v1/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelMap[model] || 'command-r',
      message: prompt,
      stream: true,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Cohere error ${res.status}`);
  }

  // Cohere uses newline-delimited JSON, not SSE
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let outputTokens = 0;
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const json = JSON.parse(line);
        if (json.event_type === 'text-generation' && json.text) {
          onToken(json.text);
          outputTokens += json.text.split(/\s+/).length;
        }
      } catch {}
    }
  }
  return { inputTokens: 0, outputTokens };
}

// ── Meta (via Groq — fastest Llama inference) ─────────────────────────────
export async function callMeta({ model, prompt, apiKey, onToken, onError }) {
  // Groq provides the fastest Llama inference with OpenAI-compatible API
  const modelMap = {
    'llama-3.1-405b': 'llama-3.1-405b-reasoning',
    'llama-3.1-70b': 'llama-3.1-70b-versatile',
    'llama-3.1-8b': 'llama-3.1-8b-instant',
    'llama-3.2-90b': 'llama-3.2-90b-vision-preview',
  };

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelMap[model] || 'llama-3.1-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Groq/Meta error ${res.status}`);
  }

  return readSSEStream(res.body, (line) => {
    if (!line.startsWith('data: ') || line.includes('[DONE]')) return null;
    try {
      const json = JSON.parse(line.slice(6));
      return json.choices?.[0]?.delta?.content || null;
    } catch { return null; }
  }, onToken);
}

// ── OpenRouter (single gateway to many global models) ─────────────────────
export async function callOpenRouter({ model, prompt, apiKey, onToken, onError }) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AiMon',
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: true,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenRouter error ${res.status}`);
  }

  return readSSEStream(res.body, (line) => {
    if (!line.startsWith('data: ') || line.includes('[DONE]')) return null;
    try {
      const json = JSON.parse(line.slice(6));
      return json.choices?.[0]?.delta?.content || null;
    } catch { return null; }
  }, onToken);
}

// ── OpenRouter Models Catalog ─────────────────────────────────────────────
export async function fetchOpenRouterModels(apiKey) {
  const res = await fetch('https://openrouter.ai/api/v1/models', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      'HTTP-Referer': window.location.origin,
      'X-Title': 'AiMon',
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenRouter models error ${res.status}`);
  }

  const data = await res.json();
  const models = Array.isArray(data?.data) ? data.data : [];

  return models
    .map((m) => {
      const inputPerToken = parseFloat(m?.pricing?.prompt || '0');
      const outputPerToken = parseFloat(m?.pricing?.completion || '0');
      return {
        id: m.id,
        name: m.name || m.id,
        contextWindow: Number(m.context_length || 0),
        inputCost: Number.isFinite(inputPerToken) ? inputPerToken * 1000 : 0,
        outputCost: Number.isFinite(outputPerToken) ? outputPerToken * 1000 : 0,
      };
    })
    .filter((m) => !!m.id)
    .sort((a, b) => a.name.localeCompare(b.name));
}

// ── SSE Stream Reader ─────────────────────────────────────────────────────
async function readSSEStream(body, parseLine, onToken) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  let outputTokens = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      const token = parseLine(line.trim());
      if (token) {
        onToken(token);
        outputTokens += 1; // rough count per chunk
      }
    }
  }
  return { outputTokens };
}

// ── Dispatcher ────────────────────────────────────────────────────────────
const CALLERS = {
  openrouter: callOpenRouter,
  openai: callOpenAI,
  anthropic: callAnthropic,
  google: callGoogle,
  meta: callMeta,
  mistral: callMistral,
  cohere: callCohere,
};

export async function callProvider({ providerId, modelId, prompt, apiKey, onToken }) {
  const caller = CALLERS[providerId];
  if (!caller) throw new Error(`Unknown provider: ${providerId}`);
  return caller({ model: modelId, prompt, apiKey, onToken });
}
