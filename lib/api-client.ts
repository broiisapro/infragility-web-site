const BRIDGE_API_URL =
  process.env.NEXT_PUBLIC_BRIDGE_API_URL || 'http://localhost:3001/api';
const BRIDGE_WS_URL =
  process.env.NEXT_PUBLIC_BRIDGE_WS_URL || 'ws://localhost:3001';

export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
};

export type OptimizationRequest = {
  repositoryUrl: string;
  optimizationType: 'seo' | 'geo' | 'both';
  priority: 'normal' | 'high' | 'urgent';
  notes: string;
  requirements: {
    metaTags: boolean;
    structuredData: boolean;
    performance: boolean;
    accessibility: boolean;
    localization: boolean;
    analytics: boolean;
  };
};

export type Project = {
  id: string;
  name: string;
  repository: string;
  status: 'completed' | 'in-progress' | 'pending' | 'failed';
  progress: number;
  lastUpdated: string;
  prUrl?: string;
  previewUrl?: string;
  agent: string;
};

export async function sendMessage(
  message: string,
  sessionKey?: string
): Promise<{ success: boolean; message: string; response: Message }> {
  const res = await fetch(`${BRIDGE_API_URL}/send-message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sessionKey }),
  });
  if (!res.ok) throw new Error(`Failed to send message: ${res.statusText}`);
  return res.json();
}

export async function submitOptimizationRequest(
  request: OptimizationRequest
): Promise<{
  requestId: string;
  status: string;
  message: string;
  estimatedCompletion: string;
  timestamp: string;
}> {
  const res = await fetch(`${BRIDGE_API_URL}/optimization-request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  if (!res.ok)
    throw new Error(`Failed to submit request: ${res.statusText}`);
  return res.json();
}

export async function getProjects(): Promise<{ projects: Project[] }> {
  const res = await fetch(`${BRIDGE_API_URL}/projects`);
  if (!res.ok) throw new Error(`Failed to get projects: ${res.statusText}`);
  return res.json();
}

export function createWebSocketConnection(
  onMessage: (data: unknown) => void,
  onOpen?: () => void,
  onClose?: () => void,
  onError?: (error: Event) => void
): WebSocket {
  const ws = new WebSocket(BRIDGE_WS_URL);
  ws.onopen = () => { console.log('WebSocket connected'); onOpen?.(); };
  ws.onmessage = (event) => {
    try { onMessage(JSON.parse(event.data)); }
    catch { console.error('Failed to parse WS message'); }
  };
  ws.onclose = () => { console.log('WebSocket disconnected'); onClose?.(); };
  ws.onerror = (e) => { console.error('WebSocket error', e); onError?.(e); };
  return ws;
}
