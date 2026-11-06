'use server';

import { headers } from 'next/headers';
import { clientKeyFrom } from '@/lib/contact/client-key';
import { contactConfig, isTestBuild } from '@/lib/contact/config';
import type { ContactState } from '@/lib/contact/types';
import { submitContact, valuesFrom } from '@/lib/contact/submit';

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
    return { status: 'failed', values: valuesFrom(form) };
  }

  return submitContact(form, clientKeyFrom(await headers(), isTestBuild()), deps);
}
