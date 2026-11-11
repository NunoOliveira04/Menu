import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { parseRestaurantSettings } from '@/lib/auth/access';
import {
  ADMIN_HOME_PATH,
  ADMIN_LOGIN_PATH,
  isProtectedAdminPath,
  isPublicAdminAuthPath,
  resolveLegacyAdminRedirect,
} from '@/lib/routing/admin-paths';
import { extractMenuSlugFromPathname, resolveLegacyMenuRedirect } from '@/lib/routing/menu-paths';
import { resolveSubdomainRewritePath } from '@/lib/routing/subdomain';
import type { Database } from '@/types/database';
import { getSupabaseEnv } from './env';

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

  // Subdomínio -> /[slug] (apenas quando ENABLE_SUBDOMAIN_ROUTING === 'true')
  const rewritePath = resolveSubdomainRewritePath({
    hostHeader: request.headers.get('host'),
    pathname,
    enableSubdomainRouting: process.env.ENABLE_SUBDOMAIN_ROUTING === 'true',
    rootDomain: process.env.ROOT_DOMAIN,
  });

  const effectivePathname = rewritePath ?? pathname;
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-menu-html-lang', 'pt-PT');

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

  // Quando ?lang=en é pedido numa rota de menu, só emitimos <html lang="en">
  // se o módulo `languages` estiver efetivamente ativo nas definições do restaurante.
  const requestedLang = request.nextUrl.searchParams.get('lang')?.trim().toLowerCase();
  const menuSlug = extractMenuSlugFromPathname(effectivePathname);
  if (requestedLang === 'en' && menuSlug) {
    const { data: restaurantRow } = await supabase
      .from('restaurants')
      .select('settings')
      .eq('slug', menuSlug)
      .maybeSingle();

    const settings = parseRestaurantSettings(restaurantRow?.settings);
    if (settings.modules.languages) {
      requestHeaders.set('x-menu-html-lang', 'en');
      supabaseResponse = copyResponseMetadata(
        supabaseResponse,
        NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        }),
      );
    }
  }

  const legacyTarget = resolveLegacyAdminRedirect(pathname);
  if (legacyTarget) {
    const legacyUrl = request.nextUrl.clone();
    legacyUrl.pathname = legacyTarget;
    return copyResponseMetadata(supabaseResponse, NextResponse.redirect(legacyUrl, 308));
  }

  // Links e QR codes antigos: /r/<slug> -> /<slug>, mantendo a query string.
  const legacyMenuTarget = resolveLegacyMenuRedirect(pathname);
  if (legacyMenuTarget) {
    const menuUrl = request.nextUrl.clone();
    menuUrl.pathname = legacyMenuTarget;
    return copyResponseMetadata(supabaseResponse, NextResponse.redirect(menuUrl, 308));
  }

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

  // Proteger /admin/*, excepto login.
  if (isProtectedAdminPath(pathname) && !isAuthenticated) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = ADMIN_LOGIN_PATH;
    loginUrl.searchParams.set('next', pathname);
    return copyResponseMetadata(supabaseResponse, NextResponse.redirect(loginUrl));
  }

  if (isPublicAdminAuthPath(pathname) && isAuthenticated) {
    // O token pode ser válido mas a sessão já não existir no Supabase (terminada noutro
    // lado ou expirada). O painel confirma com getUser(); se aqui só confiássemos no token,
    // login -> /admin -> login ficava em ciclo. Confirmamos e limpamos os cookies velhos.
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      await supabase.auth.signOut({ scope: 'local' });
      return supabaseResponse;
    }

    const adminUrl = request.nextUrl.clone();
    adminUrl.pathname = ADMIN_HOME_PATH;
    adminUrl.search = '';
    return copyResponseMetadata(supabaseResponse, NextResponse.redirect(adminUrl));
  }

  return supabaseResponse;
}
