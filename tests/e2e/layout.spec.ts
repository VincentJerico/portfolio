import { expect, test } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

const ROUTES = ['/', '/projects', '/about', '/projects/accessibility-testing'];
const WIDTHS = [320, 768, 1024, 1280];

/**
 * Every bordered box (cards, doors, the portrait's back face, the terminal) must hold its content.
 * Scroll containers are exempt, since scrolling is how they hold it, and so is anything not on show:
 * inert faces, closed disclosures and screen-reader-only text.
 */
function escapes() {
  const shown = (el: Element) => {
    if (el.closest('.sr-only, [hidden], [inert], dialog:not([open])')) return false;
    const closed = el.closest('details:not([open])');
    if (closed && closed !== el && !el.closest('summary')) return false;
    const style = getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    const rect = el.getBoundingClientRect();
    return rect.width >= 2 && rect.height >= 2;
  };
  const name = (el: Element) =>
    `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 40)}"`;
  const found: string[] = [];
  for (const box of document.querySelectorAll('body *')) {
    if (!box.children.length || !shown(box)) continue;
    const style = getComputedStyle(box);
    const bordered = ['Top', 'Right', 'Bottom', 'Left'].every(
      (side) => parseFloat(style.getPropertyValue(`border-${side.toLowerCase()}-width`)) > 0,
    );
    const scrolls = [style.overflowX, style.overflowY].some((v) => v === 'auto' || v === 'scroll');
    if (!bordered || scrolls) continue;
    const outer = box.getBoundingClientRect();
    for (const child of box.querySelectorAll('*')) {
      if (child.closest('svg') !== null || !shown(child)) continue;
      const inner = child.getBoundingClientRect();
      if (
        inner.left < outer.left - 1 ||
        inner.right > outer.right + 1 ||
        inner.top < outer.top - 1 ||
        inner.bottom > outer.bottom + 1
      ) {
        found.push(`${name(child)} spills out of ${name(box)}`);
        break;
      }
    }
  }
  return found;
}

test.describe('layout', () => {
  for (const route of ROUTES) {
    test(`content stays inside its box on ${route}`, async ({ page }) => {
      await page.goto(route);
      await waitForHydration(page);
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        expect(await page.evaluate(escapes), `at ${width} px`).toEqual([]);
      }
    });
  }

  test('the inline-block utility sets display only, never a width', async ({ page }) => {
    await page.goto('/');
    // A spacing token named "block" once made Tailwind emit inline-block as an inline-size rule.
    const width = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.className = 'inline-block';
      document.body.append(probe);
      const value = getComputedStyle(probe).width;
      probe.remove();
      return value;
    });
    expect(width).toBe('0px');
  });

  test('the portrait card holds all its fixture data when flipped', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Flip card' }).click();
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      expect(await page.evaluate(escapes), `at ${width} px`).toEqual([]);
    }
  });
});
