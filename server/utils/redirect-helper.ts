export function resolveRedirectUrl(
  url: string,
  baseUrl: string | undefined,
  env: { authOrigin?: string; nextAuthUrl?: string } = {}
): string {
  // 1. Determine the effective base URL
  // Priority: AUTH_ORIGIN > NEXTAUTH_URL > baseUrl > Default
  const effectiveBaseUrl =
    env.authOrigin || env.nextAuthUrl || baseUrl || 'https://expenses.tehj.io';

  // Ensure effectiveBaseUrl doesn't end with a slash for consistent joining
  const base = effectiveBaseUrl.endsWith('/')
    ? effectiveBaseUrl.slice(0, -1)
    : effectiveBaseUrl;

  // 2. Handle the requested URL
  if (!url) {
    return base;
  }

  // If url is relative (starts with /), append to base
  if (url.startsWith('/')) {
    return `${base}${url}`;
  }

  // If url is absolute
  try {
    const urlObj = new URL(url);
    // We construct a URL object for base to compare origins
    const baseObj = new URL(base);

    if (urlObj.origin === baseObj.origin) {
      return url;
    }
  } catch {
    // If URL parsing fails, assume it's invalid and return base
    return base;
  }

  // Default to base if validation fails or cross-origin
  return base;
}
