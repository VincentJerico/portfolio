'use server';

import { headers } from 'next/headers';
import { contactConfig, isTestBuild } from '@/lib/contact/config';
import type { ContactState } from '@/lib/contact/schema';
import { submitContact } from '@/lib/contact/submit';

// Built once per server instance so the in-memory test limiter keeps its counts.
let deps: ReturnType<typeof contactConfig> | undefined;
let loggedUnconfigured = false;

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  deps ??= contactConfig();
  if (!deps) {
    if (!loggedUnconfigured) {
      loggedUnconfigured = true;
      console.error('contact: not configured');
    }
    return { status: 'failed' };
  }

  const requestHeaders = await headers();
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
  let clientKey = forwarded || requestHeaders.get('x-real-ip') || 'unknown';
  if (isTestBuild()) clientKey += `:${requestHeaders.get('x-e2e-client') ?? ''}`;

  return submitContact(form, clientKey, deps);
}
