// When PLAYWRIGHT_BASE_URL is set, the suite checks an existing deployment instead of a local build.
export function deployedUrl(): string | undefined {
  return process.env.PLAYWRIGHT_BASE_URL || undefined;
}
