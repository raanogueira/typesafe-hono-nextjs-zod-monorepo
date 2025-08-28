// Global type fixes for Node.js environment
declare global {
  interface HTMLElement {}
  type RequestInfo = string | Request | URL
}

export {}
