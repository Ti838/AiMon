# Software Requirements Specification (SRS)

Project: AiMon
Version: 1.0
Date: 2026-04-09

## 1. Introduction

### 1.1 Purpose
AiMon is a browser-based AI benchmarking and comparison dashboard for testing multiple LLM providers and models side-by-side.

### 1.2 Scope
The software provides:
- Live prompt testing with streaming responses.
- Benchmark simulation and history tracking.
- Model comparison via metrics and charts.
- API key management in browser local storage.
- Export of report data (CSV) and chart snapshots (PNG).

### 1.3 Definitions
- TTFT: Time to first token.
- Throughput: Approximate token output rate.
- Context window: Maximum supported input size for a model.

## 2. Overall Description

### 2.1 Product Perspective
AiMon is a front-end single-page application (SPA) built with React + Vite, using direct client-to-provider API calls.

### 2.2 User Classes
- Developer: compares model speed/cost for app integration.
- Researcher: explores response quality and latency trends.
- Product owner: evaluates provider options and pricing trade-offs.

### 2.3 Operating Environment
- Browser: modern Chrome, Edge, Firefox, Safari.
- OS: Windows, macOS, Linux.
- Runtime: Node.js for development/build only.

### 2.4 Constraints
- No backend orchestration for private key vaulting.
- Provider API behavior/rate limits are external dependencies.
- "All AI models in the world" cannot be guaranteed due continuous market changes.

### 2.5 Assumptions
- User has valid provider API keys.
- User has internet access to provider endpoints.
- Browser supports modern JavaScript and Fetch APIs.

## 3. Functional Requirements

### FR-1: API Key Management
- Store provider API keys in browser localStorage.
- Allow add/update/clear operations by provider.

### FR-2: Live Test
- User can select up to panel limit models and send a prompt.
- Responses stream live where provider supports streaming.
- Display TTFT, output token estimate, throughput, and total time.

### FR-3: Model Discovery
- Show preconfigured provider model lists.
- Support OpenRouter dynamic catalog loading.
- Support search/filter/sort and giant-context filters.
- Support adding custom model IDs for OpenRouter format (provider/model).

### FR-4: Presets and Device Awareness
- Provide presets (reasoning, coding, cheapest, largest context).
- Save/load custom selection presets.
- Detect client profile and recommend default preset.

### FR-5: Benchmark and Comparison
- Run benchmark flow and persist results.
- Compare selected models in charts and metric tables.
- Show leaderboard-style ranking and result history.

### FR-6: Export
- Export result tables as CSV.
- Export chart sections as PNG.

### FR-7: CI Validation
- Run lint + build in CI across Linux/Windows/macOS.
- Upload per-OS build artifacts.

## 4. Non-Functional Requirements

### NFR-1: Performance
- Initial app interaction should feel responsive on typical desktop and mobile browsers.
- UI should degrade gracefully for low-power devices.

### NFR-2: Reliability
- App should not crash on missing API keys or provider failures.
- Provider errors should be visible and actionable in UI.

### NFR-3: Security
- Keys must remain in browser storage and be used for direct provider calls.
- No secret values committed in source control.

### NFR-4: Usability
- Keyboard shortcuts for common actions.
- Clear empty states, hints, and actionable feedback.

### NFR-5: Maintainability
- Modular React pages/components.
- Documented CI and deployment workflow.

## 5. External Interface Requirements

### 5.1 User Interface
- Dashboard, Live Test, Benchmark, Compare, Leaderboard, History, Settings pages.

### 5.2 Software Interfaces
- OpenAI API
- Anthropic API
- Google Gemini API
- Mistral API
- Cohere API
- Groq (Meta routing)
- OpenRouter API

### 5.3 Data Storage
- localStorage keys for results, API keys, page state, and preset/profile hints.

## 6. Capabilities and Limitations

### 6.1 What the Software Can Do
- Compare many major model families quickly.
- Provide practical latency/throughput/cost visibility.
- Load large model catalogs from OpenRouter dynamically.

### 6.2 What the Software Cannot Do
- Guarantee complete real-time coverage of every AI model globally.
- Guarantee identical quality scoring across providers without custom eval pipelines.
- Replace backend-grade secret management for enterprise compliance.

## 7. Future Enhancements
- Server-side secure key vault and proxy mode.
- Automated quality evaluation with deterministic rubric.
- Scheduled benchmark jobs and multi-user workspaces.
