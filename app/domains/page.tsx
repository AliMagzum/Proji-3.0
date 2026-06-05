'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from 'next-auth/react';
import { Globe, Coins, Target, Workflow, Activity, Scale, Users, Factory, Settings } from 'lucide-react';
import { useAppStore } from '../../src/store/useAppStore';
import { DomainAccessModal } from '../../src/components/DomainAccessModal';
import type { BusinessDomain } from '../../src/types';
import { getOrganization } from '../../src/lib/organization';
import { useI18n } from '../../src/context/I18nContext';
import { DOMAIN_BY_SLUG, DOMAIN_ORDER, type DomainSlug } from '../../src/i18n/helpers';

const DOMAIN_ICONS: Record<DomainSlug, React.ComponentType<{ size?: number; className?: string }>> = {
  general: Globe,
  finance: Coins,
  marketing: Target,
  strategy: Workflow,
  operations: Activity,
  legal: Scale,
  management: Users,
  production: Factory,
  equipment: Settings,
};

export default function DomainsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { t } = useI18n();
  const { setCurrentDomain, setShowDomainWelcome } = useAppStore();
  const [modalDomain, setModalDomain] = useState<BusinessDomain | null>(null);

  const role = (session?.user as { role?: string })?.role;
  const allowedDomains: string[] = (session?.user as { allowedDomains?: string[] })?.allowedDomains ?? [];
  const org = getOrganization();
  const isManager = role === 'manager' || org?.role === 'admin';

  const isDomainAllowed = (name: BusinessDomain) => {
    if (isManager) return true;
    return allowedDomains.includes('all') || allowedDomains.includes(name);
  };

  const handleConfirm = () => {
    if (!modalDomain) return;
    setCurrentDomain(modalDomain);
    setShowDomainWelcome({ domain: modalDomain, active: true });
    setModalDomain(null);
    router.push(`/domains/${encodeURIComponent(modalDomain)}`);
  };

  return (
    <>
      <div className="min-h-screen px-4 md:px-12 py-12 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 py-8">
            <h1 className="text-5xl md:text-7xl font-black tracking-tight uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
              {t('domains.pageTitle')}
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed mt-4">
              {t('domains.pageSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
            {DOMAIN_ORDER.map((slug, i) => {
              const name = DOMAIN_BY_SLUG[slug];
              const Icon = DOMAIN_ICONS[slug];
              const allowed = isDomainAllowed(name);
              const functions = [t(`domains.items.${slug}.f1`), t(`domains.items.${slug}.f2`), t(`domains.items.${slug}.f3`)];

              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: allowed ? -6 : -2 }}
                  onClick={() => setModalDomain(name)}
                  className={`group relative bg-white/80 backdrop-blur-md border p-8 rounded-[2.5rem] shadow-sm transition-all cursor-pointer overflow-hidden ${
                    allowed
                      ? 'border-slate-200/60 hover:shadow-xl'
                      : 'border-slate-200/40 opacity-60'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:to-blue-400/10 transition-all duration-500 rounded-[2.5rem]" />

                  {!allowed && !isManager && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                      <span className="text-[10px]">🔒</span>
                    </div>
                  )}

                  <div className="relative z-10 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-2xl transition-colors ${allowed ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-slate-100'}`}>
                        <Icon size={22} className={allowed ? 'text-blue-600' : 'text-slate-400'} />
                      </div>
                      <span className="text-[9px] uppercase tracking-widest font-black text-blue-400/60 pt-1">
                        {t(`domains.items.${slug}.why`)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 mb-1">{t(`domains.items.${slug}.name`)}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">{t(`domains.items.${slug}.description`)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {functions.map((fn) => (
                        <span
                          key={fn}
                          className={`text-[9px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg transition-colors ${
                            allowed
                              ? 'bg-slate-100 group-hover:bg-blue-50 text-slate-500 group-hover:text-blue-600'
                              : 'bg-slate-100 text-slate-400'
                          }`}
                        >
                          {fn}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalDomain && (
          <DomainAccessModal
            domain={modalDomain}
            isManager={isManager}
            isAllowed={isDomainAllowed(modalDomain)}
            onConfirm={handleConfirm}
            onClose={() => setModalDomain(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
