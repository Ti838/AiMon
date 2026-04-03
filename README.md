<!-- markdownlint-disable MD033 MD041 -->
<div align="center">
  <img src="./public/favicon.svg" alt="AiMon Logo" width="120" />
  <h1>AiMon</h1>
  <p><strong>Benchmark Every Major AI Provider Side-by-Side</strong></p>
</div>
<!-- markdownlint-enable MD033 MD041 -->

**AiMon** is a powerful, modern, and high-density dashboard built for developers and researchers to test, compare, and benchmark the latest LLMs across multiple providers (OpenAI, Anthropic, Google, Meta, Mistral, and Cohere). It offers real-time streaming capability and actionable analytics on latency, throughput, cost, and quality to help you choose the best model for your use-case.

## Features

- **Live Testing Side-by-Side**: Stream responses concurrently from up to 4 AI models. Measure Time to First Token (TTFT) and token generation speed live.
- **Automated Benchmarking**: Fire customized prompts to selected models and track detailed execution metrics.
- **Head-to-Head Comparison**: Compare models directly using beautiful Radar and Bar charts (powered by Recharts).
- **Global Leaderboard**: Models are dynamically ranked by quality, latency, throughput, or cost so you know exactly who dominates the board.
- **Persisted History**: All benchmarks are saved locally to track model degradations or improvements over time.
- **Private API Key Storage**: Keys are securely stored only in your browser's `localStorage` and sent directly to the providers—no middleman servers.
- **Premium SaaS Theming**: Built with a custom design system, including neon-glow hover effects and seamless Light/Dark mode toggling.

## Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone the repository:**

   ```bash
   git clone <your-repository-url>
   cd "AI Performance"
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   npm run dev
   ```

4. **Access the application:**

   Open your browser and navigate to `http://localhost:5173`.

## Configuration

To unlock real live testing, you will need to add your personal API keys.
Navigate to the **API Keys (Settings)** tab in the application and securely enter keys for any provider you wish to test:

- **OpenAI**
- **Anthropic**
- **Google AI Studio (Gemini)**
- **Meta (Llama)**
- **Mistral**
- **Cohere**

*Note: If a key is missing for a provider, the app will gracefully fall back to executing a realistic simulation for demonstration purposes.*

## Built With

- **React** (UI Library)
- **Vite** (Build Tool)
- **Recharts** (Data Visualization)
- **Custom SVG Icons & Design System** (Zero reliance on hard-coded OS emojis)
- Vanilla CSS with CSS Variables for consistent theming

## License

This project is open-source and free to use.
