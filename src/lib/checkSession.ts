import { supabase } from '@/lib/supabase';
import type { AstroCookies } from 'astro';

export const checkSession = async (
  cookies: AstroCookies,
  redirectUrl = '/signin'
) => {
  const accessToken = cookies.get('sb-access-token');
  const refreshToken = cookies.get('sb-refresh-token');

  if (!accessToken || !refreshToken) {
    return { redirect: redirectUrl };
  }

  const resetCookies = async () => {
    cookies.delete('sb-access-token', { path: '/' });
    cookies.delete('sb-refresh-token', { path: '/' });
    return { redirect: redirectUrl };
  };

  try {
    const session = await supabase.auth.setSession({
      refresh_token: refreshToken.value,
      access_token: accessToken.value,
    });

    if (session.error) {
      return resetCookies();
    }

    return { user: session.data.user };
  } catch (error) {
    return resetCookies();
  }
};
