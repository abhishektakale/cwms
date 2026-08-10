type Listener = (count: number) => void

let inflight = 0
const listeners = new Set<Listener>()

function notify() {
  for (const listener of listeners) listener(inflight)
}

export function subscribeRequests(listener: Listener): () => void {
  listeners.add(listener)
  listener(inflight)
  return () => {
    listeners.delete(listener)
  }
}

export function getInflightCount(): number {
  return inflight
}

export async function trackRequest<T>(work: Promise<T>): Promise<T> {
  inflight += 1
  notify()
  try {
    return await work
  } finally {
    inflight = Math.max(0, inflight - 1)
    notify()
  }
}
