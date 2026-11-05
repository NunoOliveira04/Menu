import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';
import { resolveSubdomainRewritePath } from '@/lib/routing/subdomain';
import { getSupabaseEnv } from './env';

function resolveHtmlLangHeader(request: NextRequest, effectivePathname: string): 'pt-PT' | 'en' {
  const isMenuRoute = effectivePathname.startsWith('/r/');
  if (!isMenuRoute) {
    return 'pt-PT';
  }
  const langParam = request.nextUrl.searchParams.get('lang')?.trim().toLowerCase();
  return langParam === 'en' ? 'en' : 'pt-PT';
}

function copyResponseMetadata(source: NextResponse, target: NextResponse): NextResponse {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  for (const header of ['cache-control', 'expires', 'pragma']) {
    const value = source.headers.get(header);
    if (value) {
      target.headers.set(header, value);
    }
  }

  return target;
}

export async function updateSession(request: NextRequest): Promise<NextResponse> {
  const pathname = request.nextUrl.pathname;

  // Subdomínio -> /r/[slug] (apenas quando ENABLE_SUBDOMAIN_ROUTING === 'true')
  const rewritePath = resolveSubdomainRewritePath({
    hostHeader: request.headers.get('host'),
    pathname,
    enableSubdomainRouting: process.env.ENABLE_SUBDOMAIN_ROUTING === 'true',
    rootDomain: process.env.ROOT_DOMAIN,
  });

  const effectivePathname = rewritePath ?? pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-menu-html-lang', resolveHtmlLangHeader(request, effectivePathname));

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value);
          });
        }
      },
    },
  });

  // Valida a assinatura do JWT / renova sessão expirada de forma segura em SSR
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  if (rewritePath) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = rewritePath;
    return copyResponseMetadata(
      supabaseResponse,
      NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      }),
    );
  }

  // Proteger rotas privadas (/dashboard e /onboarding)
  if (
    (pathname.startsWith('/dashboard') || pathname.startsWith('/onboarding')) &&
    !isAuthenticated
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', pathname);
    return copyResponseMetadata(supabaseResponse, NextResponse.redirect(loginUrl));
  }

  // Redirecionar utilizadores já autenticados das páginas de login/registo
  if ((pathname === '/login' || pathname === '/registar') && isAuthenticated) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = '/dashboard';
    dashUrl.search = '';
    return copyResponseMetadata(supabaseResponse, NextResponse.redirect(dashUrl));
  }

  return supabaseResponse;
}
