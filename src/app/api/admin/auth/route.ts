import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPw = process.env.ADMIN_PASSWORD || 'ims2026!';

    if (password === adminPw) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('ims_admin', 'authenticated', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ error: 'Falsches Passwort' }, { status: 401 });
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
