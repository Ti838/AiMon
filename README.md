<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
	<img src="./public/favicon.svg" alt="AiMon Logo" width="120" />
	<h1>AiMon</h1>
	<p><strong>Benchmark Every Major AI Provider Side-by-Side</strong></p>
</div>
<!-- markdownlint-enable MD033 MD041 -->

AiMon is a browser-based AI model benchmarking dashboard for live testing, comparison, and reporting across major LLM providers.

## What This Software Does

- Runs side-by-side live prompt tests against multiple models.
- Measures practical metrics such as latency (TTFT), throughput, estimated cost, and context window.
- Compares models with tables and charts.
- Tracks benchmark history locally.
- Exports benchmark data to CSV and charts to PNG.
- Supports dynamic model discovery via OpenRouter catalog loading.

## What This Software Does Not Do

- It cannot guarantee permanent coverage of every AI model in the world.
- It does not provide enterprise-grade server-side key vaulting by default.
- It does not provide fully deterministic quality scoring out of the box.

For full details, see [docs/CAPABILITIES_AND_LIMITATIONS.md](docs/CAPABILITIES_AND_LIMITATIONS.md).

## Model Coverage Reality

AI model catalogs change frequently. AiMon uses both:

- Curated static provider lists.
- Dynamic OpenRouter model catalog loading.

This gives broad practical coverage, but not a permanent “all models forever” guarantee.

## Documentation Index

- Product requirements: [docs/SRS.md](docs/SRS.md)
- Internal flow and architecture: [docs/HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md)
- Capabilities and limitations: [docs/CAPABILITIES_AND_LIMITATIONS.md](docs/CAPABILITIES_AND_LIMITATIONS.md)
- API integration reference: [docs/API_REFERENCE.md](docs/API_REFERENCE.md)
- Deployment guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Contribution process: [CONTRIBUTING.md](CONTRIBUTING.md)
- Change history: [CHANGELOG.md](CHANGELOG.md)
- License terms: [LICENSE](LICENSE)

## Screenshots

Place screenshots in [public/screenshots/README.md](public/screenshots/README.md) recommended paths.

Example display blocks you can use after adding images:

```md
![Dashboard](public/screenshots/dashboard.png)
![Live Test](public/screenshots/live-test.png)
![Compare](public/screenshots/compare.png)
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm ci
```

### Run (Dev)

```bash
npm run dev
```

### Build (Prod)

```bash
npm run build
```

### Preview Build

```bash
npm run preview
```

## OS Sections

### Windows (PowerShell)

```powershell
npm ci
npm run dev
```

### macOS / Linux (bash/zsh)

```bash
npm ci
npm run dev
```

## CI

GitHub Actions workflow runs on:

- Linux
- Windows
- macOS

Pipeline steps:

1. Install dependencies (`npm ci`)
2. Lint (`npm run lint`)
3. Build (`npm run build`)
4. Upload per-OS `dist` artifacts

Workflow file: [.github/workflows/ci.yml](.github/workflows/ci.yml)

## Release and Versioning

- Manual version automation workflow: [.github/workflows/version-bump.yml](.github/workflows/version-bump.yml)
- Tag-based release workflow: [.github/workflows/release.yml](.github/workflows/release.yml)
- GitHub Pages deployment workflow: [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml)
- Release checklist issue template: [.github/ISSUE_TEMPLATE/release-checklist.md](.github/ISSUE_TEMPLATE/release-checklist.md)
- Pull request template: [.github/pull_request_template.md](.github/pull_request_template.md)

## Security Notes

- API keys are stored in browser localStorage.
- Keys are used for direct provider API calls from the browser.
- For strict compliance use-cases, add a backend proxy/key-vault layer.

## Technology Stack

- React
- Vite
- Recharts
- html2canvas (PNG export)
- Vanilla CSS design system

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
