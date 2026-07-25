import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { waitReady, dropFile, openSampleHar } from './_helpers';

/**
 * Records every request that leaves the local origin. The no-upload covenant (#1):
 * opening a HAR file — which can contain live session tokens — must trigger ZERO
 * cross-origin requests.
 */
function trackExternal(page: Page): string[] {
  const external: string[] = [];
  page.on('request', (req) => {
    const url = req.url();
    if (
      !url.startsWith('http://localhost:4321') &&
      !url.startsWith('data:') &&
      !url.startsWith('blob:')
    ) {
      external.push(url);
    }
  });
  return external;
}

test.describe('HAR viewer', () => {
  test('renders the request table with correct counts and intact fields, with no upload (#1)', async ({
    page,
  }) => {
    const external = trackExternal(page);
    await page.goto('/har-viewer/');
    await waitReady(page);
    await openSampleHar(page);

    await expect(page.getByTestId('entry-count')).toHaveText('2');
    await expect(page.getByTestId('har-row')).toHaveCount(2);
    await expect(page.getByTestId('file-name')).toHaveText('sample.har');

    const rows = page.getByTestId('har-row');
    await expect(rows.nth(0)).toContainText('example.com');
    await expect(rows.nth(1)).toContainText('api.example.com');

    expect(external, `unexpected cross-origin requests: ${external.join(', ')}`).toHaveLength(0);
  });

  test('flags only the request that carries a Bearer/JWT token and cookies', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await openSampleHar(page);

    // Exactly one of the two fixture entries contains secret-shaped values.
    await expect(page.getByTestId('secret-flag')).toHaveCount(1);
    await expect(page.getByTestId('flagged-count')).toContainText('1');
    await expect(page.getByTestId('secrets-summary')).toBeVisible();

    const rows = page.getByTestId('har-row');
    await expect(rows.nth(0).getByTestId('secret-flag')).toHaveCount(0);
    await expect(rows.nth(1).getByTestId('secret-flag')).toHaveCount(1);
  });

  test('highlights the flagged values in the detail view without redacting them', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await openSampleHar(page);

    // Open the detail for the flagged (second) request.
    await page.getByTestId('har-row').nth(1).getByRole('button').click();
    const detail = page.getByTestId('detail-panel');
    await expect(detail).toBeVisible();
    await expect(page.getByTestId('detail-url')).toContainText('api.example.com');
    await expect(page.getByTestId('detail-secrets-note')).toBeVisible();

    // The Authorization header's full value is shown — highlighted, not masked.
    const headerValue = page.getByTestId('detail-request-headers').getByTestId('secret-value');
    await expect(headerValue.first()).toContainText('Bearer eyJ');

    // The access_token query parameter value is shown in full, not redacted.
    await expect(page.getByTestId('detail-query-params')).toContainText('abc123def456');

    // Cookies (request + response) are both shown.
    await expect(page.getByTestId('detail-cookies')).toBeVisible();
    await expect(page.getByTestId('detail-request-cookies')).toContainText('deadbeef1234');
    await expect(page.getByTestId('detail-response-cookies')).toContainText('deadbeef5678');

    // The response body (JSON) is pretty-printed.
    await expect(page.getByTestId('detail-response-body')).toContainText('"name": "John Doe"');
  });

  test('does not flag anything in the detail view of the plain request', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await openSampleHar(page);

    await page.getByTestId('har-row').nth(0).getByRole('button').click();
    const detail = page.getByTestId('detail-panel');
    await expect(detail).toBeVisible();
    await expect(page.getByTestId('detail-url')).toContainText('example.com');
    await expect(detail.getByTestId('secret-value')).toHaveCount(0);
    await expect(page.getByTestId('detail-secrets-note')).toHaveCount(0);
  });

  test('draws one waterfall bar per row', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await openSampleHar(page);
    await expect(page.getByTestId('waterfall-bar')).toHaveCount(2);
  });

  test('closes the viewer with Escape and clears the loaded file', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await openSampleHar(page);

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByTestId('har-table')).toHaveCount(0);
    await expect(page.getByTestId('file-name')).toHaveCount(0);
  });

  test('the close button clears the loaded file', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await openSampleHar(page);
    await page.getByTestId('close-viewer').click();
    await expect(page.getByTestId('har-table')).toHaveCount(0);
  });

  test('shows a localized error for an unsupported file type', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await dropFile(page, { b64: btoa('not a har'), name: 'photo.png', type: 'image/png' });

    const err = page.getByTestId('error');
    await expect(err).toBeVisible();
    await expect(err).toContainText('photo.png');
    await expect(page.getByTestId('har-table')).toHaveCount(0);
  });

  test('shows an error for an empty file', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await dropFile(page, { b64: '', name: 'empty.har', type: 'application/json' });
    await expect(page.getByTestId('error')).toBeVisible();
    await expect(page.getByTestId('error')).toContainText('empty.har');
  });

  test('shows an error for invalid JSON', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await dropFile(page, { b64: btoa('{not valid json'), name: 'broken.har', type: 'application/json' });
    await expect(page.getByTestId('error')).toBeVisible();
    await expect(page.getByTestId('error')).toContainText('broken.har');
  });

  test('shows an error for valid JSON that is not a HAR file', async ({ page }) => {
    await page.goto('/har-viewer/');
    await waitReady(page);
    await dropFile(page, { b64: btoa('{"hello":"world"}'), name: 'notahar.har', type: 'application/json' });
    await expect(page.getByTestId('error')).toBeVisible();
    await expect(page.getByTestId('error')).toContainText('notahar.har');
  });

  test('the loaded viewer (list + detail) has no serious or critical axe violations', async ({ page }) => {
    test.skip(test.info().project.name !== 'chromium', 'axe runs on one engine');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/har-viewer/');
    await waitReady(page);
    await openSampleHar(page);
    await page.getByTestId('har-row').nth(1).getByRole('button').click();
    await expect(page.getByTestId('detail-panel')).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    const blocking = violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(blocking.map((v) => `${v.id} (${v.impact})`)).toEqual([]);
  });
});
