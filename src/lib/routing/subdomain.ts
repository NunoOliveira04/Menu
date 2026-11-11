const RESERVED_SUBDOMAINS = new Set(['www', 'app', 'api', 'admin', 'dashboard', 'auth']);

export interface SubdomainRewriteInput {
  hostHeader: string | null;
  pathname: string;
  enableSubdomainRouting: boolean;
  rootDomain?: string | undefined;
}

/**
 * Resolve o slug do subdomínio quando ENABLE_SUBDOMAIN_ROUTING está ativo.
 * Devolve o caminho interno (/<slug>...) ou null quando não deve reescrever.
 */
export function resolveSubdomainRewritePath({
  hostHeader,
  pathname,
  enableSubdomainRouting,
  rootDomain,
}: SubdomainRewriteInput): string | null {
  if (!enableSubdomainRouting || !hostHeader || !rootDomain) {
    return null;
  }

  const normalizedHost = hostHeader.trim().toLowerCase();
  const normalizedRoot = rootDomain.trim().toLowerCase();

  if (!normalizedRoot || normalizedHost === normalizedRoot) {
    return null;
  }

  const suffix = `.${normalizedRoot}`;
  if (!normalizedHost.endsWith(suffix)) {
    return null;
  }

  const candidate = normalizedHost.slice(0, -suffix.length);
  if (
    !candidate ||
    candidate.includes('.') ||
    RESERVED_SUBDOMAINS.has(candidate) ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate)
  ) {
    return null;
  }

  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/r/')) {
    return null;
  }

  const cleanSuffix = pathname === '/' ? '' : pathname;
  return `/${candidate}${cleanSuffix}`;
}
