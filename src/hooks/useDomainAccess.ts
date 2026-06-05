'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DomainCred { name: string; key: string; password: string }

let cache: DomainCred[] | null = null;

export function useDomainAccess(domainName?: string) {
  const { data: session, status } = useSession();
  const [domains, setDomains] = useState<DomainCred[]>(cache ?? []);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (cache) { setDomains(cache); setLoading(false); return; }
    fetch('/api/credentials')
      .then((r) => r.json())
      .then((d) => {
        cache = d.domains ?? [];
        setDomains(cache!);
      })
      .finally(() => setLoading(false));
  }, [status]);

  const isAuthenticated = status === 'authenticated';
  const domain = domainName ? domains.find((d) => d.name === domainName) : undefined;
  // Manager always has access to all domains
  const hasAccess = isAuthenticated;

  return { isAuthenticated, hasAccess, domain, domains, loading };
}
