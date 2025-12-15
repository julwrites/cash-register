import { describe, it, expect } from 'vitest';
import { resolveRedirectUrl } from '../../server/utils/redirect-helper';

describe('resolveRedirectUrl', () => {
  const defaultBase = 'https://expenses.tehj.io';

  it('should use AUTH_ORIGIN if provided', () => {
    const result = resolveRedirectUrl('/', undefined, {
      authOrigin: 'https://custom-origin.com',
    });
    expect(result).toBe('https://custom-origin.com/');
  });

  it('should use NEXTAUTH_URL if AUTH_ORIGIN is missing', () => {
    const result = resolveRedirectUrl('/', undefined, {
      nextAuthUrl: 'https://next-auth.com',
    });
    expect(result).toBe('https://next-auth.com/');
  });

  it('should fallback to baseUrl if env vars are missing', () => {
    const result = resolveRedirectUrl('/', 'https://base-url.com', {});
    expect(result).toBe('https://base-url.com/');
  });

  it('should fallback to default if everything is missing', () => {
    const result = resolveRedirectUrl('/', undefined, {});
    expect(result).toBe(`${defaultBase}/`);
  });

  it('should append relative URL to base', () => {
    const result = resolveRedirectUrl('/dashboard', undefined, {
      authOrigin: 'https://app.com',
    });
    expect(result).toBe('https://app.com/dashboard');
  });

  it('should return absolute URL if it matches origin', () => {
    const result = resolveRedirectUrl('https://app.com/settings', undefined, {
      authOrigin: 'https://app.com',
    });
    expect(result).toBe('https://app.com/settings');
  });

  it('should redirect to base if absolute URL is cross-origin', () => {
    const result = resolveRedirectUrl('https://evil.com/login', undefined, {
      authOrigin: 'https://app.com',
    });
    expect(result).toBe('https://app.com');
  });

  it('should handle base URL with trailing slash correctly', () => {
    const result = resolveRedirectUrl('/path', undefined, {
      authOrigin: 'https://app.com/',
    });
    expect(result).toBe('https://app.com/path');
  });

  it('should return base if url is empty', () => {
    const result = resolveRedirectUrl('', undefined, {
      authOrigin: 'https://app.com',
    });
    expect(result).toBe('https://app.com');
  });
});
