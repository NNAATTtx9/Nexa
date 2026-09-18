import { NextResponse } from 'next/server';
import { completeFinverseLink } from '@/lib/actions/finverse.action';

const finish = async (request: Request, values: URLSearchParams) => {
  const code = values.get('code');
  const state = values.get('state');
  const error = values.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/root?finverse_error=${encodeURIComponent(error)}`, request.url));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/root?finverse_error=missing_callback_data', request.url));
  }

  try {
    await completeFinverseLink(code, state);
    return NextResponse.redirect(new URL('/root?finverse=connected', request.url));
  } catch (callbackError) {
    console.error('Finverse callback failed:', callbackError);
    return NextResponse.redirect(new URL('/root?finverse_error=connection_failed', request.url));
  }
};

export async function GET(request: Request) {
  return finish(request, new URL(request.url).searchParams);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  return finish(request, new URLSearchParams(formData as unknown as Record<string, string>));
}
