import { expect, test } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

const ROUTES = ['/', '/projects', '/about', '/projects/accessibility-testing'];
const WIDTHS = [320, 768, 1024, 1280];

/**
 * Every bordered box (cards, doors, the portrait's back face) must hold its content.
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
        // Polled: the flip and any resize reflow must finish before the card is measured.
        await expect.poll(() => page.evaluate(escapes), { message: `at ${width} px` }).toEqual([]);
      }
    });
  }

  // C52: the skills strip, the career strip, the turning CV ring and the full-bleed Contact never push
  // the page sideways, at any point of the scroll (the ring's corners swing as it turns).
  for (const route of ['/', '/about']) {
    for (const width of [320, 390, 768, 1280]) {
      test(`${route} never scrolls sideways at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        const overflow = await page.evaluate(async () => {
          const root = document.documentElement;
          const max = root.scrollHeight - root.clientHeight;
          let worst = 0;
          for (let k = 0; k <= 40; k++) {
            window.scrollTo(0, (max * k) / 40);
            await new Promise(requestAnimationFrame);
            worst = Math.max(worst, root.scrollWidth - root.clientWidth);
          }
          return worst;
        });
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }

  // Final review (C53) #1: a hovered or focused row's nudge stays inside the page's side gutter.
  for (const route of ['/', '/projects', '/work']) {
    for (const width of [320, 768]) {
      test(`focusing a row on ${route} never scrolls sideways at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        const link = page.locator('main .work-row-link').first();
        await link.focus();
        await expect
          .poll(() => link.locator('> span').evaluate((el) => getComputedStyle(el).translate))
          .not.toBe('none');
        await page.evaluate(
          () => new Promise((resolve) => setTimeout(resolve, 400)), // the nudge's 320 ms, settled
        );
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
        ).toBeLessThanOrEqual(0);
      });
    }
  }

  // C54: rules are the ink at low alpha; a form field keeps a solid boundary of at least 3:1.
  test('rules are see-through ink, and form fields keep a solid boundary', async ({ page }) => {
    await page.goto('/contact');
    const rule = await page
      .locator('main .border-line')
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopColor);
    expect(rule).toMatch(/\/\s*0?\.\d+\)$|,\s*0?\.\d+\)$/);
    const field = page.locator('form').getByRole('textbox').first();
    const ratio = await field.evaluate((el) => {
      // The browser converts any colour (OKLCH included) to sRGB through color-mix; a see-through
      // boundary is blended over the field's own background before it is measured.
      const probe = document.createElement('span');
      document.body.append(probe);
      const rgba = (css: string) => {
        probe.style.color = `color-mix(in srgb, ${css} 100%, transparent)`;
        const value = getComputedStyle(probe).color;
        const nums = (value.match(/[\d.]+/g) ?? []).map(Number);
        const srgb = value.startsWith('color(srgb');
        const [r, g, b] = srgb ? nums.slice(0, 3) : nums.slice(0, 3).map((n) => n / 255);
        const alpha = nums[3] ?? 1;
        return [r!, g!, b!, alpha] as const;
      };
      const lum = ([r, g, b]: readonly number[]) => {
        const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
        return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
      };
      const style = getComputedStyle(el);
      const back = rgba(style.backgroundColor);
      const [r, g, b, a] = rgba(style.borderTopColor);
      const edge = [r, g, b].map((c, k) => c * a + back[k]! * (1 - a));
      const [hi, lo] = [lum(edge), lum(back)].sort((x, y) => y - x);
      probe.remove();
      return (hi! + 0.05) / (lo! + 0.05);
    });
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

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
});
