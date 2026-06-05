'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAppStore } from '../../../src/store/useAppStore';
import type { BusinessDomain } from '../../../src/types';
import { useI18n } from '../../../src/context/I18nContext';
import { DOMAIN_NAV, DOMAIN_NAV_ROUTES } from '../../../src/i18n/domain-nav';
import {
  tDomain,
  tDomainConsultant,
  tDomainNavCategory,
  tDomainNavItem,
} from '../../../src/i18n/helpers';

export default function DomainLandingPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const { currentDomain, setCurrentDomain, setShowDomainWelcome } = useAppStore();

  const domainParam = decodeURIComponent(params.domain as string) as BusinessDomain;

  useEffect(() => {
    if (domainParam && domainParam !== currentDomain) {
      setCurrentDomain(domainParam);
    }
  }, [domainParam, currentDomain, setCurrentDomain]);

  const nav = DOMAIN_NAV[domainParam] ?? [];
  const domainName = tDomain(t, domainParam);
  const consultant = tDomainConsultant(t, domainParam);

  const handleNavigate = (itemKey: string) => {
    setShowDomainWelcome({ domain: domainParam, active: false });
    const href = DOMAIN_NAV_ROUTES[itemKey];
    if (href) router.push(href);
  };

  return (
    <div className="min-h-screen px-4 md:px-12 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-proji-primary/50">
            {t('domains.landing.label')}
          </p>
          <h1 className="text-5xl font-black tracking-tight text-proji-dark">{domainName}</h1>
          <div className="flex items-center gap-2 text-sm text-proji-secondary">
            <Sparkles size={14} className="text-proji-primary" />
            <span>
              {t('domains.landing.consultantPrefix')}{' '}
              <span className="font-bold text-proji-dark">{consultant}</span>
            </span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center gap-3 px-6 py-4 bg-proji-primary text-white rounded-2xl font-bold text-sm hover:bg-proji-primary/90 transition-all shadow-lg shadow-proji-primary/20"
          >
            <Sparkles size={16} />
            {t('domains.landing.askAi').replace('{name}', domainName)}
            <ArrowRight size={16} />
          </button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {nav.map((section, idx) => (
            <motion.div
              key={section.categoryKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              className="bg-white rounded-3xl border border-proji-border p-6 space-y-3"
            >
              <p className="text-[10px] uppercase font-black tracking-[0.25em] text-proji-secondary">
                {tDomainNavCategory(t, section.categoryKey)}
              </p>
              <div className="flex flex-col gap-1">
                {section.items.map((itemKey) => (
                  <button
                    key={itemKey}
                    onClick={() => handleNavigate(itemKey)}
                    className="flex items-center justify-between text-left px-4 py-3 rounded-xl text-sm font-bold text-proji-secondary hover:text-proji-primary hover:bg-proji-primary/5 transition-all group"
                  >
                    <span>{tDomainNavItem(t, itemKey)}</span>
                    <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
