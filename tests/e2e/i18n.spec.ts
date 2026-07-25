import { test, expect } from '@playwright/test';
import { waitReady, openSampleHar } from './_helpers';

// Content routing is engine-independent; one browser is enough.
test.describe('i18n', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'chromium', 'content routing (one engine)');
  });

  for (const loc of [
    { path: '/har-viewer/', lang: 'en' },
    { path: '/har-viewer/ja/', lang: 'ja' },
  ]) {
    test(`views a file on the ${loc.lang} route (#5)`, async ({ page }) => {
      await page.goto(loc.path);
      await waitReady(page);
      await openSampleHar(page);
      await expect(page.getByTestId('entry-count')).toHaveText('2');
    });
  }

  test('serves every locale with the correct <html lang>', async ({ page }) => {
    const expected: Array<[string, string]> = [
      ['/har-viewer/', 'en'],
      ['/har-viewer/ja/', 'ja'],
      ['/har-viewer/zh/', 'zh-Hans'],
      ['/har-viewer/de/', 'de'],
      ['/har-viewer/es/', 'es'],
    ];
    for (const [path, lang] of expected) {
      await page.goto(path);
      expect(await page.getAttribute('html', 'lang'), `lang on ${path}`).toBe(lang);
    }
  });
});
