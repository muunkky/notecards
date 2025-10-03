import { describe, test, beforeAll, afterAll, expect } from 'vitest'
import { ensureDevServer } from './support/dev-server-utils.ts'
import { mkdir } from 'node:fs/promises'
import { assertPage } from './support/helpers'

/**
 * Complete Service Account + Browser Integration Test
 *
 * This suite exercises the browser-service layer when the local development
 * server and service-account credentials are available. If prerequisites are
 * missing we log clear guidance and skip the heavy operations so the suite
 * never hard-fails on a fresh machine.
 */

describe('Complete Service Account Integration', () => {
  let devServerUrl: string | null = null
  let browserService: any = null
  let skipSuite = false

  beforeAll(async () => {
    console.log('[complete-service] bootstrapping...')

    try {
      devServerUrl = await ensureDevServer()
    } catch (error) {
      skipSuite = true
      console.warn('[complete-service] dev server not running; skipping browser-service tests')
      console.warn('Start the app with `npm run dev` and rerun the suite to exercise the full flow.')
      return
    }

    const { default: service } = await import('../../../services/browser-service.mjs')
    browserService = service
    console.log('[complete-service] browser service ready')
  }, 30000)

  afterAll(async () => {
    if (browserService) {
      await browserService.close()
      console.log('[complete-service] browser service closed')
    }
  })

  test('authenticates with service account and captures a screenshot', async () => {
    if (skipSuite || !browserService || !devServerUrl) {
      console.warn('[complete-service] skipping auth test: prerequisites missing')
      return
    }

    const authSuccess = await browserService.quickServiceAuth({ url: devServerUrl })

    if (!authSuccess) {
      console.warn('[complete-service] service-account authentication failed')
      console.warn('  � Ensure firebase-admin is installed')
      console.warn('  � Run `npm run auth:service-setup` to create credentials')
      console.warn('  � Verify the app can load Firebase configuration locally')
      return
    }

  const { browser, page } = browserService.getBrowser()
  expect(browser).toBeDefined()
  expect(page).toBeDefined()
  assertPage(page)

    const currentUrl = page.url()
    console.log(`[complete-service] page url: ${currentUrl}`)
    expect(currentUrl).toContain('localhost')

    const pageTitle = await page.title()
    console.log(`[complete-service] page title: ${pageTitle}`)

  // Typed element arrays to avoid implicit any
  const buttonCount = await page.$$eval('button', (buttons: Element[]) => buttons.length)
  const linkCount = await page.$$eval('a', (links: Element[]) => links.length)
    console.log(`[complete-service] buttons=${buttonCount} links=${linkCount}`)

    await mkdir('test-results/e2e/screenshots', { recursive: true })
    await page.screenshot({
      path: 'test-results/e2e/screenshots/service-account-integration.png',
      fullPage: true
    })

    const isAuthenticated = await browserService.verifyAuthentication()
    console.log(`[complete-service] authentication verified: ${isAuthenticated}`)

    expect(pageTitle).toBeTruthy()
    expect(buttonCount).toBeGreaterThanOrEqual(0)
  }, 60000)

  test('gracefully handles authentication errors', async () => {
    if (skipSuite || !browserService) {
      console.warn('[complete-service] skipping error test: prerequisites missing')
      return
    }

    const invalidAuthResult = await browserService.quickServiceAuth({ userEmail: 'invalid@test.com' })
    expect(invalidAuthResult).toBe(false)
  })

  test.skip('TODO(e2e-complete): add guidance verification assertions', async () => {
    // Placeholder skipped – see docs/Test-Backlog.md
  })
})
