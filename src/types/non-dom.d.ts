// Type declarations for non-DOM environments
// This file provides minimal DOM-like types for libraries that expect browser globals

declare global {
  // WebSocket-related types
  interface MessageEvent<T = string> extends Event {
    data: T
    origin: string
    lastEventId: string
    source: unknown
    ports: unknown[]
  }

  interface WebSocket {
    readonly readyState: number
    readonly url: string
    binaryType: string
    onopen: ((event: Event) => void) | null
    onmessage: ((event: MessageEvent) => void) | null
    onerror: ((event: Event) => void) | null
    onclose: ((event: CloseEvent) => void) | null

    send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void
    close(code?: number, reason?: string): void
    addEventListener(type: string, listener: EventListener): void
    removeEventListener(type: string, listener: EventListener): void
  }

  interface CloseEvent extends Event {
    readonly code: number
    readonly reason: string
    readonly wasClean: boolean
  }

  interface Event {
    readonly type: string
    readonly target: EventTarget | null
    readonly currentTarget: EventTarget | null
    readonly bubbles: boolean
    readonly cancelable: boolean
    readonly defaultPrevented: boolean
    stopPropagation(): void
    preventDefault(): void
  }

  interface EventTarget {
    addEventListener(type: string, listener: EventListener | null): void
    removeEventListener(type: string, listener: EventListener | null): void
    dispatchEvent(event: Event): boolean
  }

  type EventListener = (evt: Event) => void

  // Basic Element interface for non-DOM environments
  interface Element {
    tagName: string
  }

  // Minimal Window interface for non-DOM environments
  interface Window {
    location: {
      origin: string
      href: string
      search: string
      pathname: string
      reload(): void
    }
    history: {
      replaceState(data: unknown, title: string, url?: string | null): void
    }
    localStorage: {
      getItem(key: string): string | null
      setItem(key: string, value: string): void
      removeItem(key: string): void
    }
  }

  // Minimal Document interface for non-DOM environments
  interface Document {
    title: string
    createElement(tagName: string): Element
  }

  // URL constructor
  interface URLConstructor {
    new (url: string, base?: string | URL): URL
    prototype: URL
  }

  interface URL {
    href: string
    origin: string
    protocol: string
    hostname: string
    port: string
    pathname: string
    search: string
    hash: string
  }

  var URL: URLConstructor
  var MessageEvent: {
    new <T = string>(
      type: string,
      eventInitDict?: {
        data?: T
        origin?: string
        lastEventId?: string
      },
    ): MessageEvent<T>
  }

  // Global instances available in non-DOM environments
  var window: Window & typeof globalThis
  var document: Document
}

export {}
