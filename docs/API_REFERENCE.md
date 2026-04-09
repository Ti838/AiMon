# API Reference

This document describes provider integrations used by AiMon.

## Overview

AiMon is a browser-first client application. Requests are sent directly from browser to provider APIs.

## Shared Request Shape (Live Test)

- providerId: Provider key used in app routing.
- modelId: Selected model identifier.
- prompt: User prompt text.
- apiKey: Provider API key from localStorage.
- onToken: Callback for streaming chunks.

## Providers and Endpoints

### OpenAI

- Endpoint: https://api.openai.com/v1/chat/completions
- Auth header: Authorization: Bearer <api_key>
- Stream: yes (except selected reasoning models in app logic)

### Anthropic

- Endpoint: https://api.anthropic.com/v1/messages
- Auth header: x-api-key: <api_key>
- Required header: anthropic-version: 2023-06-01
- Stream: yes

### Google Gemini

- Endpoint pattern: https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent
- Auth: query key parameter
- Stream: yes (SSE)

### Mistral

- Endpoint: https://api.mistral.ai/v1/chat/completions
- Auth header: Authorization: Bearer <api_key>
- Stream: yes

### Cohere

- Endpoint: https://api.cohere.ai/v1/chat
- Auth header: Authorization: Bearer <api_key>
- Stream: newline-delimited JSON in current implementation

### Meta Routing (Groq in current implementation)

- Endpoint: https://api.groq.com/openai/v1/chat/completions
- Auth header: Authorization: Bearer <api_key>
- Stream: yes

### OpenRouter

- Chat endpoint: https://openrouter.ai/api/v1/chat/completions
- Model catalog endpoint: https://openrouter.ai/api/v1/models
- Auth header: Authorization: Bearer <api_key>
- Optional app headers: HTTP-Referer, X-Title
- Stream: yes

## Data Persistence Keys

- aiperf_results: benchmark/live results history
- aiperf_api_keys: provider key map
- aiperf_page: last selected page
- aiperf_live_saved_selection: saved live model presets
- aiperf_device_hint_dismissed: device recommendation banner state
- aiperf_auto_preset_applied: first-visit auto preset state

## Export APIs (Internal)

- CSV export: serializes tabular rows into downloadable .csv
- PNG export: captures chart section rendering and downloads .png

## Error Handling Behavior

- Provider HTTP errors are surfaced per model panel.
- Missing API key falls back to simulation mode in relevant flows.
- Catalog loading failures show non-blocking warning and continue with static presets.

## Security Notes

- API keys are handled in browser localStorage.
- Direct browser calls mean keys are visible to client runtime.
- For enterprise-grade controls, add backend proxy and key vault.
