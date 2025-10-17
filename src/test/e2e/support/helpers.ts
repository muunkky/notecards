// Common E2E helpers to reduce duplication
// Centralizes simple utilities so individual tests stay focused on scenario logic.

export function delay(ms: number): Promise<void> {
  return new Promise(res => setTimeout(res, ms))
}

export interface BrowserSession {
  browser: any
  page: any
}

export function assertPage(page: any): asserts page {
  if (!page) throw new Error('Page not initialized')
}
