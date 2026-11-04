/** Every way a response's headers fall short of the expected set (used by tests and their self-test). */
export function headerDefects(
  actual: Record<string, string | undefined>,
  expected: Record<string, string>,
): string[] {
  const defects = Object.entries(expected).flatMap(([name, value]) => {
    const got = actual[name];
    if (got === undefined) return [`${name}: missing`];
    return got === value ? [] : [`${name}: expected "${value}", got "${got}"`];
  });
  if (actual['access-control-allow-origin'] === '*')
    defects.push('access-control-allow-origin: * is set');
  return defects;
}
