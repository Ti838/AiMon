# Capabilities and Limitations

## Capabilities

- Live multi-model testing with streaming responses.
- Performance-focused metrics (TTFT, throughput, cost estimate, context).
- Dynamic model catalog support via OpenRouter.
- Comparison views (table + charts) and historical tracking.
- CSV and PNG export for reporting.
- Device-aware UX presets and low-power optimizations.

## Limitations

- Cannot guarantee "all AI models in the world" are always present.
- Depends on third-party provider uptime, pricing, and API policy changes.
- Quality metric is currently heuristic unless extended with formal eval pipelines.
- API keys are local browser storage based (not enterprise vault by default).

## Practical Guidance

- For widest model access, configure OpenRouter key.
- For strict security/compliance, add backend key vault/proxy architecture.
- For scientific benchmarking, add stable datasets and repeatable scoring logic.
