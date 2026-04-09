# How AiMon Works

## Architecture Summary

AiMon is a client-side React application.

1. UI collects model selection and prompt.
2. API key is read from localStorage.
3. Browser makes direct requests to provider endpoints.
4. Streaming chunks update panel text and live metrics.
5. Results are stored in localStorage for history/compare pages.

## Request Flow (Live Test)

1. User selects models.
2. User sends prompt.
3. App starts one async run per selected model.
4. For each model:
- On first token, TTFT is recorded.
- Tokens are appended to panel.
- Throughput and elapsed time are updated.
5. Final metrics are saved to history.

## Model Coverage Strategy

AiMon uses two model sources:

- Static curated provider lists in app data.
- Dynamic OpenRouter catalog loading for broad model availability.

Because providers and model IDs change frequently, dynamic loading is used to stay current.

## Device-Aware Behavior

AiMon detects client profile (device type, memory/CPU/network hints) and can:

- Recommend preset selection.
- Auto-apply a first-visit preset.
- Lower panel limits on mobile.
- Reduce chart animation on low-power or slow-network conditions.

## Exports

- CSV export serializes visible metrics/tables.
- PNG export captures chart sections from DOM rendering.

## CI Pipeline

GitHub Actions runs lint/build on Linux, Windows, and macOS, then uploads per-OS artifacts.
