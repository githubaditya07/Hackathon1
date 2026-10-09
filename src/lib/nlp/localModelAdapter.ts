/**
 * Local Model Adapter
 * Safely probes local on-device inference runtimes (e.g., Ollama / llama.cpp on localhost).
 * NON-NEGOTIABLE: Strictly local network only (localhost / 127.0.0.1). Zero cloud calls.
 */

export interface LocalModelStatus {
  available: boolean;
  modelName?: string;
  endpoint: string;
  latencyMs?: number;
  error?: string;
}

export async function checkLocalModelRuntime(endpoint = 'http://localhost:11434'): Promise<LocalModelStatus> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2000); // Strict 2s timeout

  try {
    const res = await fetch(`${endpoint}/api/tags`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const models = data?.models || [];
      const primaryModel = models.length > 0 ? models[0].name : 'Default Local Model';
      return {
        available: true,
        modelName: primaryModel,
        endpoint,
        latencyMs: Date.now() - startTime,
      };
    }

    return {
      available: false,
      endpoint,
      error: `Local endpoint returned HTTP ${res.status}`,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : 'Connection failed';
    return {
      available: false,
      endpoint,
      error: `No local inference daemon running at ${endpoint} (${message})`,
    };
  }
}
