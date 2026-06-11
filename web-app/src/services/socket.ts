class DummySocket {
  on(event?: string, callback?: (...args: any[]) => void) {}

  emit(event?: string, ...args: any[]) {}

  off(event?: string) {}

  disconnect() {}
}

export const socket = new DummySocket()