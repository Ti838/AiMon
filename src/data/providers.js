// AI Provider & Model Data
export const PROVIDERS = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    color: '#10a37f',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', contextWindow: 128000, inputCost: 0.005, outputCost: 0.015 },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', contextWindow: 128000, inputCost: 0.00015, outputCost: 0.0006 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', contextWindow: 128000, inputCost: 0.01, outputCost: 0.03 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', contextWindow: 16385, inputCost: 0.0005, outputCost: 0.0015 },
      { id: 'o1-preview', name: 'o1 Preview', contextWindow: 128000, inputCost: 0.015, outputCost: 0.06 },
      { id: 'o1-mini', name: 'o1 Mini', contextWindow: 128000, inputCost: 0.003, outputCost: 0.012 },
    ],
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    color: '#d4500c',
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', contextWindow: 200000, inputCost: 0.003, outputCost: 0.015 },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', contextWindow: 200000, inputCost: 0.0008, outputCost: 0.004 },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', contextWindow: 200000, inputCost: 0.015, outputCost: 0.075 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', contextWindow: 200000, inputCost: 0.003, outputCost: 0.015 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', contextWindow: 200000, inputCost: 0.00025, outputCost: 0.00125 },
    ],
  },
  google: {
    id: 'google',
    name: 'Google',
    color: '#4285f4',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', contextWindow: 2000000, inputCost: 0.0035, outputCost: 0.0105 },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', contextWindow: 1000000, inputCost: 0.000075, outputCost: 0.0003 },
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', contextWindow: 1000000, inputCost: 0.0001, outputCost: 0.0004 },
      { id: 'gemini-ultra', name: 'Gemini Ultra', contextWindow: 32000, inputCost: 0.018, outputCost: 0.054 },
    ],
  },
  meta: {
    id: 'meta',
    name: 'Meta',
    color: '#0866ff',
    models: [
      { id: 'llama-3.1-405b', name: 'Llama 3.1 405B', contextWindow: 128000, inputCost: 0.003, outputCost: 0.003 },
      { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', contextWindow: 128000, inputCost: 0.00059, outputCost: 0.00079 },
      { id: 'llama-3.1-8b', name: 'Llama 3.1 8B', contextWindow: 128000, inputCost: 0.0002, outputCost: 0.0002 },
      { id: 'llama-3.2-90b', name: 'Llama 3.2 90B', contextWindow: 128000, inputCost: 0.0009, outputCost: 0.0009 },
    ],
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral',
    color: '#f54e42',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', contextWindow: 128000, inputCost: 0.003, outputCost: 0.009 },
      { id: 'mistral-medium', name: 'Mistral Medium', contextWindow: 32000, inputCost: 0.00275, outputCost: 0.0081 },
      { id: 'mistral-small', name: 'Mistral Small', contextWindow: 32000, inputCost: 0.001, outputCost: 0.003 },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', contextWindow: 32000, inputCost: 0.0006, outputCost: 0.0006 },
      { id: 'codestral', name: 'Codestral', contextWindow: 32000, inputCost: 0.001, outputCost: 0.003 },
    ],
  },
  cohere: {
    id: 'cohere',
    name: 'Cohere',
    color: '#39d353',
    models: [
      { id: 'command-r-plus', name: 'Command R+', contextWindow: 128000, inputCost: 0.003, outputCost: 0.015 },
      { id: 'command-r', name: 'Command R', contextWindow: 128000, inputCost: 0.00015, outputCost: 0.0006 },
      { id: 'command-light', name: 'Command Light', contextWindow: 4096, inputCost: 0.0000038, outputCost: 0.0000038 },
    ],
  },
};

export const METRICS = {
  latency: { id: 'latency', label: 'Response Latency', unit: 'ms', description: 'Time to first token (TTFT)', lowerIsBetter: true },
  throughput: { id: 'throughput', label: 'Throughput', unit: 'tok/s', description: 'Output tokens per second', lowerIsBetter: false },
  cost: { id: 'cost', label: 'Cost / 1K tokens', unit: '$', description: 'Blended input + output cost', lowerIsBetter: true },
  quality: { id: 'quality', label: 'Output Quality', unit: '/100', description: 'LLM-as-judge quality score', lowerIsBetter: false },
  context: { id: 'context', label: 'Context Window', unit: 'K tokens', description: 'Maximum context size', lowerIsBetter: false },
};

export const BENCHMARK_PROMPTS = [
  { id: 'reasoning', label: 'Complex Reasoning', prompt: 'Explain the trolley problem and provide a comprehensive philosophical analysis from utilitarian, deontological, and virtue ethics perspectives. Include real-world applications.' },
  { id: 'coding', label: 'Code Generation', prompt: 'Write a Python implementation of a binary search tree with insert, delete, search, and in-order traversal methods. Include type hints and docstrings.' },
  { id: 'creative', label: 'Creative Writing', prompt: 'Write a 500-word short story about an astronaut who discovers that the stars are actually the memories of deceased civilizations, exploring themes of loneliness and cosmic significance.' },
  { id: 'summarization', label: 'Summarization', prompt: 'Summarize the key developments in artificial intelligence from 2020 to 2024, focusing on large language models, multimodal AI, and their societal implications.' },
  { id: 'math', label: 'Mathematical Reasoning', prompt: 'Solve this step by step: A train leaves city A at 60 mph. Another train leaves city B (300 miles away) at 80 mph heading toward A. At what time do they meet if both depart at 9:00 AM? Generalize the formula.' },
  { id: 'custom', label: 'Custom Prompt', prompt: '' },
];

// Simulate benchmark run — returns mock data with realistic variance
export function simulateBenchmark(modelId, providerId) {
  const baseLatency = {
    'gpt-4o': 320, 'gpt-4o-mini': 180, 'gpt-4-turbo': 450, 'gpt-3.5-turbo': 200,
    'o1-preview': 2100, 'o1-mini': 1200,
    'claude-3-5-sonnet': 280, 'claude-3-5-haiku': 160, 'claude-3-opus': 520, 'claude-3-sonnet': 300, 'claude-3-haiku': 140,
    'gemini-1.5-pro': 380, 'gemini-1.5-flash': 120, 'gemini-2.0-flash': 100, 'gemini-ultra': 600,
    'llama-3.1-405b': 480, 'llama-3.1-70b': 220, 'llama-3.1-8b': 90, 'llama-3.2-90b': 300,
    'mistral-large': 340, 'mistral-medium': 280, 'mistral-small': 150, 'mixtral-8x7b': 200, 'codestral': 180,
    'command-r-plus': 360, 'command-r': 200, 'command-light': 100,
  };
  const baseThroughput = {
    'gpt-4o': 85, 'gpt-4o-mini': 120, 'gpt-4-turbo': 65, 'gpt-3.5-turbo': 150,
    'o1-preview': 28, 'o1-mini': 45,
    'claude-3-5-sonnet': 95, 'claude-3-5-haiku': 160, 'claude-3-opus': 40, 'claude-3-sonnet': 80, 'claude-3-haiku': 200,
    'gemini-1.5-pro': 70, 'gemini-1.5-flash': 210, 'gemini-2.0-flash': 250, 'gemini-ultra': 35,
    'llama-3.1-405b': 45, 'llama-3.1-70b': 110, 'llama-3.1-8b': 280, 'llama-3.2-90b': 90,
    'mistral-large': 75, 'mistral-medium': 90, 'mistral-small': 180, 'mixtral-8x7b': 140, 'codestral': 160,
    'command-r-plus': 65, 'command-r': 130, 'command-light': 220,
  };
  const baseQuality = {
    'gpt-4o': 95, 'gpt-4o-mini': 84, 'gpt-4-turbo': 94, 'gpt-3.5-turbo': 78,
    'o1-preview': 98, 'o1-mini': 91,
    'claude-3-5-sonnet': 97, 'claude-3-5-haiku': 87, 'claude-3-opus': 96, 'claude-3-sonnet': 92, 'claude-3-haiku': 82,
    'gemini-1.5-pro': 93, 'gemini-1.5-flash': 85, 'gemini-2.0-flash': 88, 'gemini-ultra': 95,
    'llama-3.1-405b': 90, 'llama-3.1-70b': 85, 'llama-3.1-8b': 76, 'llama-3.2-90b': 88,
    'mistral-large': 88, 'mistral-medium': 83, 'mistral-small': 78, 'mixtral-8x7b': 82, 'codestral': 86,
    'command-r-plus': 87, 'command-r': 82, 'command-light': 72,
  };

  const variance = () => 1 + (Math.random() - 0.5) * 0.15;
  const provider = PROVIDERS[providerId];
  const model = provider?.models.find(m => m.id === modelId);

  const latency = Math.round((baseLatency[modelId] || 300) * variance());
  const throughput = Math.round((baseThroughput[modelId] || 100) * variance());
  const quality = Math.min(100, Math.round((baseQuality[modelId] || 80) * variance()));
  const contextK = Math.round((model?.contextWindow || 8000) / 1000);
  const costPer1k = model ? ((model.inputCost + model.outputCost) / 2) * 1000 : 0.005;

  return {
    modelId,
    providerId,
    modelName: model?.name || modelId,
    providerName: provider?.name || providerId,
    timestamp: new Date().toISOString(),
    metrics: {
      latency,
      throughput,
      quality,
      context: contextK,
      cost: parseFloat((costPer1k).toFixed(4)),
    },
    tokens: {
      input: Math.floor(Math.random() * 200 + 50),
      output: Math.floor(Math.random() * 600 + 100),
    },
    success: true,
  };
}
