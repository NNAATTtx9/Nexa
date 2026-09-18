'use server';

import { cookies } from 'next/headers';
import { randomUUID } from 'node:crypto';
import { createFinverseLink, exchangeFinverseCode } from '@/lib/finverse';

export const createFinverseLinkToken = async (userId: string, institution?: string) => {
  try {
    const state = randomUUID();
    console.log(`Creating Finverse link for user=${userId} institution=${institution || 'any'}`);
    const linkUrl = await createFinverseLink({ userId, state, institution });

    (await cookies()).set('finverse-link-state', state, {
      httpOnly: true,
      sameSite: 'none',
      secure: (process.env.NODE_ENV === 'production') || ((process.env.FINVERSE_REDIRECT_URI || '').startsWith('https')),
      maxAge: 600,
      path: '/',
    });

    return { linkUrl, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Finverse is unavailable.';
    console.error(`createFinverseLinkToken failed for user=${userId} institution=${institution}:`, error);
    return { linkUrl: null, error: message };
  }
};

export const completeFinverseLink = async (code: string, state: string) => {
  const storedState = (await cookies()).get('finverse-link-state')?.value;
  if (!storedState || storedState !== state) {
    throw new Error('The Finverse link state could not be verified.');
  }

  const loginIdentityToken = await exchangeFinverseCode(code);
  (await cookies()).set('finverse-login-token', loginIdentityToken, {
    httpOnly: true,
    sameSite: 'none',
    secure: (process.env.NODE_ENV === 'production') || ((process.env.FINVERSE_REDIRECT_URI || '').startsWith('https')),
    maxAge: 60 * 60,
    path: '/',
  });
  (await cookies()).delete('finverse-link-state');
};
