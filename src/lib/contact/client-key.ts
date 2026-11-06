/**
 * The rate-limit key for a request: the client IP from the proxy headers. The CI test build appends the
 * x-e2e-client header so parallel tests sharing one IP get separate limits.
 */
export function clientKeyFrom(headers: Pick<Headers, 'get'>, testBuild: boolean): string {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const key = forwarded || headers.get('x-real-ip')?.trim() || 'unknown';
  return testBuild ? `${key}:${headers.get('x-e2e-client') ?? ''}` : key;
}
