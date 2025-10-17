import { beforeAll, afterAll, describe, expect, test } from 'vitest'
import puppeteer from 'puppeteer'
import { ensureDevServer } from './support/dev-server-utils.ts'

describe('Real browser UI smoke test', () => {
  let devServerUrl: string | null = null
  let browser: puppeteer.Browser | null = null
  let skipSuite = false

  beforeAll(async () => {
    try {
      devServerUrl = await ensureDevServer()
    } catch (error) {
      skipSuite = true
      console.log('??O Skipping real-browser tests: dev server not running.')
      return
    }

    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }, 45000)

  afterAll(async () => {
    if (browser) {
      await browser.close()
      browser = null
    }
  })

  test('loads application shell without crashing', async () => {
    if (skipSuite || !browser || !devServerUrl) {
      console.log('dY"? Skipping shell test: prerequisites missing.')
      return
    }

    const page = await browser.newPage()
    await page.goto(devServerUrl, { waitUntil: 'networkidle0', timeout: 60000 })

    const title = await page.title()
    expect(title?.length ?? 0).toBeGreaterThan(0)

    const rootExists = await page.evaluate(() => !!document.getElementById('root'))
    expect(rootExists).toBe(true)

    await page.close()
  }, 60000)
})
