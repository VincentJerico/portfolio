/**
 * Runs before first paint: marks a first visit in this browser session, unless the visitor prefers
 * reduced motion. The boot overlay only shows while <html data-boot> is set (globals.css); the flag is
 * cleared once the boot ends, so printing or a motion-setting change can never replay it.
 */
export const BOOT_SCRIPT = `try{if(!sessionStorage.getItem('vja-boot')&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.setAttribute('data-boot','');sessionStorage.setItem('vja-boot','1');setTimeout(function(){document.documentElement.removeAttribute('data-boot')},1600)}}catch(e){}`;

/**
 * The first-visit boot: corner counters run to 100% and a hairline splits the screen, then the
 * overlay lifts away. CSS only, about 1.4 s, never takes pointer events, hidden from assistive tech
 * and print. It holds only small text, so it can never be the page's largest paint.
 */
export function Boot() {
  return (
    <div data-boot-overlay aria-hidden="true" data-print-hide>
      <span className="boot-count top-4 left-4" />
      <span className="boot-count top-4 right-4" />
      <span className="boot-count bottom-4 left-4" />
      <span className="boot-count right-4 bottom-4" />
      <span className="boot-line" />
    </div>
  );
}
