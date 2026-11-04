/**
 * The key that moves focus to the next link. WebKit on macOS follows Safari's default and skips links
 * on plain Tab; Option+Tab reaches them. Linux WebKit (CI), Chromium and mobile use Tab.
 */
export function tabKey(browserName: string, shift = false): string {
  const alt = browserName === 'webkit' && process.platform === 'darwin' ? 'Alt+' : '';
  return `${alt}${shift ? 'Shift+' : ''}Tab`;
}
