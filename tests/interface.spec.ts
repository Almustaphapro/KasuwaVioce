import { test, expect, type Page } from '@playwright/test'

async function preview(page: Page) {
  await page.goto('/')
  await page.getByRole('button', { name: 'Explore UI preview' }).click()
  await expect(page.locator('.preview-banner')).toBeVisible()
}
async function navigate(page: Page, name: string) {
  const desktop = page.getByRole('navigation', { name: 'Main navigation' })
  await desktop.getByRole('link', { name, exact: true }).click()
  await expect(
    page.getByRole('heading', {
      level: 1,
      name: name === 'Dashboard' ? 'Your business, at a glance.' : name,
      exact: true,
    }),
  ).toBeVisible()
}

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`major routes render without overflow at ${width}px`, async ({ page }) => {
    test.setTimeout(90000)
    await page.setViewportSize({ width, height: 960 })
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const routes = [
      ['/', 'Your business, at a glance.'],
      ['/voice', 'Voice Assistant'],
      ['/transactions', 'Transactions'],
      ['/inventory', 'Inventory'],
      ['/reports', 'Reports'],
      ['/settings', 'Settings'],
      ['/login', 'Welcome back.'],
      ['/register', 'Your next chapter starts here.'],
      ['/forgot-password', 'Let’s help you get back in.'],
      ['/onboarding', 'Welcome to KasuwaVoice.'],
      ['/missing-page', 'Page not found'],
    ] as const
    for (const [path, heading] of routes) {
      await page.goto(path)
      await expect(
        page.getByRole('heading', { level: 1, name: heading, exact: true }),
      ).toBeVisible()
      await expect(page.getByText('Something interrupted this page.')).toHaveCount(0)
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        path,
      ).toBeTruthy()
    }
    await preview(page)
    await page.screenshot({ path: `test-results/dashboard-${width}.png`, fullPage: true })
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
    ).toBeTruthy()
    for (const [mobileName, heading] of [
      ['Voice', 'Voice Assistant'],
      ['Records', 'Transactions'],
      ['Stock', 'Inventory'],
      ['Reports', 'Reports'],
      ['Settings', 'Settings'],
    ] as const) {
      if (width < 1024) {
        if (mobileName === 'Reports' || mobileName === 'Settings') {
          await page.getByRole('button', { name: 'More navigation' }).click()
          await page.getByRole('dialog').getByRole('link', { name: heading, exact: true }).click()
        } else {
          await page
            .getByRole('navigation', { name: 'Mobile navigation' })
            .getByRole('link', { name: mobileName, exact: true })
            .click()
        }
      } else {
        await navigate(page, heading)
      }
      await expect(
        page.getByRole('heading', { name: heading, level: 1, exact: true }),
      ).toBeVisible()
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
        `${heading} preview at ${width}`,
      ).toBeTruthy()
      if (heading === 'Voice Assistant' && (width === 390 || width === 1440))
        await page.screenshot({ path: `test-results/voice-${width}.png`, fullPage: true })
    }
    expect(errors).toEqual([])
  })
}

test('production mode never loads sample finances and preview is not persisted', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: 'Explore UI preview' })).toBeVisible()
  await expect(page.getByText('Mama Gold Rice · 2 bags', { exact: true })).toHaveCount(0)
  await preview(page)
  await expect(page.getByText('Mama Gold Rice · 2 bags', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.locator('.preview-banner')).toHaveCount(0)
  await expect(page.getByText('Mama Gold Rice · 2 bags', { exact: true })).toHaveCount(0)
})

test('registration validates and guides an empty preview through onboarding', async ({ page }) => {
  await page.goto('/register')
  await page.getByRole('button', { name: 'Preview business setup' }).click()
  await expect(page.getByText('Enter your full name.')).toBeVisible()
  await page.getByLabel('Full name', { exact: true }).fill('Binta Musa')
  await page.getByLabel('Email address').fill('binta@example.com')
  await page.getByLabel('Password', { exact: true }).fill('samplepass12')
  await page.getByLabel('Confirm password').fill('not-the-same')
  await page.getByRole('button', { name: 'Preview business setup' }).click()
  await expect(page.getByText('Passwords do not match.')).toBeVisible()
  await page.getByLabel('Confirm password').fill('samplepass12')
  await page.getByRole('button', { name: 'Preview business setup' }).click()
  await expect(page).toHaveURL(/onboarding/)
  await page.getByRole('button', { name: 'Let’s get started' }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByText('Enter your business name.')).toBeVisible()
  await page.getByLabel('Business name', { exact: true }).fill('Binta Market Store')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Business type', { exact: true }).selectOption('Food & groceries')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByLabel('Preferred language')).toHaveValue('ha')
  expect(await page.getByLabel('Preferred language').locator('option:disabled').count()).toBe(3)
  await page.getByRole('button', { name: 'Complete preview setup' }).click()
  await page.getByRole('link', { name: 'Go to your dashboard' }).click()
  await expect(page.getByRole('heading', { name: /Sannu, Binta/ })).toBeVisible()
  await expect(page.getByText('A fresh page for your business')).toBeVisible()
})

test('login and password recovery disclose unavailable services', async ({ page }) => {
  const calls: string[] = []
  page.on('request', (request) => {
    if (request.url().includes('/api/v1/auth')) calls.push(request.url())
  })
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByText('Enter a valid email address.')).toBeVisible()
  await page.getByLabel('Email address').fill('test@example.com')
  await page.getByLabel('Password', { exact: true }).fill('samplepass')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('status')).toContainText('sign-in is unavailable')
  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await page.getByLabel('Email address').fill('test@example.com')
  await page.getByRole('button', { name: 'Check email format' }).click()
  await expect(page.getByRole('status')).toContainText('No reset email was sent')
  await expect(page.getByRole('button', { name: /Send reset email/ })).toBeDisabled()
  expect(calls).toEqual([])
})

test('manual transactions validate, save, filter, and recover from a preview error', async ({
  page,
}) => {
  await preview(page)
  await navigate(page, 'Transactions')
  await page.getByRole('button', { name: 'Add sale', exact: true }).click()
  await page.getByRole('button', { name: 'Save preview record' }).click()
  await expect(page.getByText('Describe this record in at least 2 characters.')).toBeVisible()
  await page.getByLabel('Description', { exact: true }).fill('Test customer sale')
  await page.getByLabel('Total amount (₦)').fill('-5')
  await page.getByRole('button', { name: 'Save preview record' }).click()
  await expect(page.getByText('Enter an amount greater than zero.')).toBeVisible()
  await page.getByLabel('Total amount (₦)').fill('1200')
  await page.getByRole('button', { name: 'Save preview record' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByLabel('Search transactions').fill('Test customer sale')
  await expect(page.locator('.transaction-row')).toHaveCount(1)
  await page.locator('.transaction-row').click()
  await expect(page.getByRole('dialog')).toContainText('Manual preview entry')
  await page.keyboard.press('Escape')
  await page.getByText('Preview tools', { exact: true }).click()
  await page.getByRole('button', { name: 'Demonstrate a loading error' }).click()
  await expect(page.getByRole('alert')).toContainText('Sample loading error')
  await page.getByRole('button', { name: 'Retry loading records' }).click()
  await expect(page.locator('.transaction-row')).toHaveCount(1)
  await page.getByLabel('Search transactions').fill('nothing matches this')
  await expect(page.getByText('No matching records', { exact: true })).toBeVisible()
})

test('inventory add/edit, keyboard dialog containment, and stock filters work', async ({
  page,
}) => {
  await preview(page)
  await navigate(page, 'Inventory')
  await page.getByRole('button', { name: 'Add product', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Add a product' })).toBeVisible()
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab')
    await expect
      .poll(() => page.evaluate(() => !!document.activeElement?.closest('dialog')))
      .toBeTruthy()
  }
  await page.getByLabel('Product name').fill('Local test product')
  await page.getByLabel('Stock quantity').fill('-1')
  await page.getByLabel('Unit price (₦)').fill('500')
  await page.getByRole('button', { name: 'Add preview product' }).click()
  await expect(page.getByText('Stock cannot be negative.')).toBeVisible()
  await page.getByLabel('Stock quantity').fill('2')
  await page.getByRole('button', { name: 'Add preview product' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByLabel('Search products').fill('Local test product')
  await expect(page.locator('.product-card')).toContainText('Low stock')
  await page.getByRole('button', { name: 'Edit Local test product' }).click()
  await page.getByLabel('Stock quantity').fill('20')
  await page.getByRole('button', { name: 'Save preview changes' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(page.locator('.product-card')).toContainText('In stock')
  await page.getByLabel('Stock filter').selectOption('low')
  await expect(page.getByText('No products match your filters')).toBeVisible()
})

test('voice sample requires explicit confirmation and supports corrections', async ({ page }) => {
  await preview(page)
  await navigate(page, 'Voice Assistant')
  await page.getByRole('button', { name: 'Try sample interpretation' }).click()
  await expect(page.getByText('Simulated interpretation', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Correct details' }).click()
  await page.getByLabel('Total amount (₦)').fill('150000')
  await page.getByRole('button', { name: 'Use corrected details' }).click()
  await expect(page.locator('.extraction-grid')).toContainText('150,000')
  await page.getByRole('button', { name: 'Confirm preview transaction' }).click()
  await expect(page.getByText('Added to this preview, not to a real account.')).toBeVisible()
  await page.getByRole('link', { name: 'View transactions', exact: true }).click()
  await page.locator('.transaction-row').first().click()
  await expect(page.getByRole('dialog')).toContainText('150,000')
  await expect(page.getByRole('dialog')).toContainText('Simulated voice interpretation')
})

test('microphone captures real browser audio locally and releases its track', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['microphone'])
  await page.addInitScript(() => {
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      const stream = await original(constraints)
      Object.defineProperty(window, '__recordedStream', { value: stream, configurable: true })
      return stream
    }
  })
  await page.goto('/voice')
  await page.getByRole('button', { name: 'Start recording', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Stop recording', exact: true })).toBeEnabled()
  await expect(page.locator('.recording-timer')).not.toHaveText('00:00')
  await page.getByRole('button', { name: 'Stop recording', exact: true }).click()
  await expect(page.locator('audio')).toHaveAttribute('src', /^blob:/)
  expect(
    await page.evaluate(() =>
      (window as unknown as { __recordedStream: MediaStream }).__recordedStream
        .getTracks()
        .every((track) => track.readyState === 'ended'),
    ),
  ).toBeTruthy()
  await expect(page.getByText('Local recording · not uploaded', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Try sample interpretation' })).toBeDisabled()
  await page.getByRole('button', { name: 'Retry recording', exact: true }).click()
  await expect(page.locator('audio')).toHaveCount(0)
  await page.getByRole('button', { name: 'Start recording', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Stop recording', exact: true })).toBeEnabled()
  await navigate(page, 'Dashboard')
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { __recordedStream: MediaStream }).__recordedStream
          .getTracks()
          .every((track) => track.readyState === 'ended'),
      ),
    )
    .toBeTruthy()
})

test('cancelling a voice interpretation never creates a transaction', async ({ page }) => {
  await preview(page)
  await navigate(page, 'Transactions')
  const count = await page.locator('.transaction-row').count()
  await navigate(page, 'Voice Assistant')
  await page.getByRole('button', { name: 'Try sample interpretation' }).click()
  await expect(page.getByRole('button', { name: 'Confirm preview transaction' })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).last().click()
  await expect(page.locator('.interpretation')).toHaveCount(0)
  await navigate(page, 'Transactions')
  await expect(page.locator('.transaction-row')).toHaveCount(count)
})

test('microphone permission errors can be recovered without inventing a transcript', async ({
  page,
}) => {
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      throw new DOMException('Denied for test', 'NotAllowedError')
    }
  })
  await page.goto('/voice')
  await page.getByRole('button', { name: 'Start recording', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Microphone permission was denied')
  await expect(page.locator('.transcript-box')).toHaveCount(0)
  await page.getByRole('button', { name: 'Retry recording', exact: true }).click()
  await expect(page.getByRole('alert')).toHaveCount(0)
})

test('reports validate dates; settings edit only preview and logout clears it', async ({
  page,
}) => {
  await page.goto('/settings')
  await expect(page.getByRole('button', { name: 'Save preview profile' })).toBeDisabled()
  await preview(page)
  await navigate(page, 'Reports')
  await expect(page.getByText('They are not a profit calculation', { exact: false })).toBeVisible()
  await page.getByLabel('From', { exact: true }).fill('2099-01-01')
  await expect(page.getByRole('alert')).toContainText('Choose a valid range')
  await navigate(page, 'Settings')
  await page.getByLabel('Full name', { exact: true }).fill('Zainab Bello')
  await page.getByRole('button', { name: 'Save preview profile' }).click()
  await expect(page.locator('.profile-name')).toHaveText('Zainab')
  await page.getByRole('switch', { name: /Low-stock reminders/ }).check()
  await expect(page.getByRole('button', { name: /Change password/ })).toBeDisabled()
  await page.getByRole('button', { name: 'Exit preview', exact: true }).last().click()
  await page.getByRole('button', { name: 'Leave and clear preview' }).click()
  await expect(page).toHaveURL(/login/)
  await page.getByRole('link', { name: 'Back to workspace', exact: false }).click()
  await expect(page.locator('.preview-banner')).toHaveCount(0)
})
