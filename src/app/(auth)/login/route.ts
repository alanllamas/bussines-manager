import { NextRequest, NextResponse } from 'next/server';
// import { checkAuthorization, createSession } from '@lib/auth/session';

export async function GET(request: NextRequest) {
  const accessToken = request.nextUrl.searchParams.get('accessToken');
  const refreshToken = request.nextUrl.searchParams.get('refreshToken');

  // console.log(request.url, request.nextUrl);

  // if (!accessToken || !refreshToken) {
  //   return NextResponse.redirect(new URL(process.env.AUTH_REDIRECT_LOGIN));
  // }

  // try {
  //   const { authorized } = await checkAuthorization(accessToken);
  //   if (!authorized) {
  //     return NextResponse.redirect(new URL(process.env.AUTH_REDIRECT_LOGIN));
  //   }
  // } catch (err) {
  //   console.error(err);
  //   return NextResponse.redirect(new URL(process.env.AUTH_REDIRECT_LOGIN));
  // }

  // // Creating a current active session
  // await createSession(accessToken, refreshToken);
  return NextResponse.redirect(new URL('/', request.url));
}
