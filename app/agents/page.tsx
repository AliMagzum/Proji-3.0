'use client';
import { useState } from 'react';
import { useModalClose } from '../../src/hooks/useModalClose';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bot, Lock, CheckCircle2, X, Brain, Scale, BarChart3, TrendingUp, Clock,
} from 'lucide-react';
import { useI18n } from '../../src/context/I18nContext';

type Tier = 'base' | 'advanced' | 'pro' | 'max';

const TIERS: { id: Tier; name: string; color: string; accent: string }[] = [
  { id: 'base',     name: 'Base',     color: 'bg-slate-50 border-slate-200',   accent: 'text-slate-600' },
  { id: 'advanced', name: 'Advanced', color: 'bg-blue-50 border-blue-200',     accent: 'text-blue-600' },
  { id: 'pro',      name: 'Pro',      color: 'bg-violet-50 border-violet-200', accent: 'text-violet-600' },
  { id: 'max',      name: 'Max',      color: 'bg-amber-50 border-amber-200',   accent: 'text-amber-600' },
];

type AgentDef = {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
  iconColor: string;
  bgGradient: string;
  tier: Tier;
  locked: boolean;
  soon?: boolean;
  featureKeys: string[];
};

const AGENT_DEFS: AgentDef[] = [
  {
    id: 'basic',
    icon: Bot,
    iconColor: 'text-slate-600',
    bgGradient: 'from-slate-100 to-slate-200',
    tier: 'base',
    locked: false,
    featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5'],
  },
  {
    id: 'analyst',
    icon: BarChart3,
    iconColor: 'text-blue-600',
    bgGradient: 'from-blue-100 to-blue-200',
    tier: 'advanced',
    locked: true,
    featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7'],
  },
  {
    id: 'strategist',
    icon: Brain,
    iconColor: 'text-violet-600',
    bgGradient: 'from-violet-100 to-violet-200',
    tier: 'pro',
    locked: true,
    featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'],
  },
  {
    id: 'legal',
    icon: Scale,
    iconColor: 'text-amber-600',
    bgGradient: 'from-amber-100 to-amber-200',
    tier: 'max',
    locked: true,
    featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'f9'],
  },
  {
    id: 'finance',
    icon: TrendingUp,
    iconColor: 'text-emerald-600',
    bgGradient: 'from-emerald-100 to-emerald-200',
    tier: 'pro',
    locked: true,
    featureKeys: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8'],
  },
  {
    id: 'soon',
    icon: Clock,
    iconColor: 'text-slate-400',
    bgGradient: 'from-slate-100 to-slate-150',
    tier: 'max',
    locked: true,
    soon: true,
    featureKeys: ['f1', 'f2', 'f3'],
  },
];

const TIER_FEATURE_KEYS: Record<Tier, string[]> = {
  base: ['f1', 'f2', 'f3'],
  advanced: ['f1', 'f2', 'f3', 'f4'],
  pro: ['f1', 'f2', 'f3', 'f4', 'f5'],
  max: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
};

function TierBadge({ tier }: { tier: Tier }) {
  const map: Record<Tier, string> = {
    base:     'bg-slate-100 text-slate-500',
    advanced: 'bg-blue-100 text-blue-600',
    pro:      'bg-violet-100 text-violet-600',
    max:      'bg-amber-100 text-amber-600',
  };
  const labels: Record<Tier, string> = { base: 'Base', advanced: 'Advanced', pro: 'Pro', max: 'Max' };
  return (
    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${map[tier]}`}>
      {labels[tier]}
    </span>
  );
}

export default function AgentsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [pricingModal, setPricingModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);

  useModalClose(() => setPricingModal(false), pricingModal);

  const handleCardClick = (agent: AgentDef) => {
    if (agent.soon) return;
    if (!agent.locked) {
      router.push('/chat');
    } else {
      setPricingModal(true);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f5f7fc] overflow-hidden">
      <div className="px-8 pt-8 pb-5 shrink-0">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{t('agentsPage.eyebrow')}</p>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">{t('agentsPage.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('agentsPage.subtitle')}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-8 pb-8">
        <div className="grid grid-cols-3 gap-5 items-start">
          {AGENT_DEFS.map((agent, i) => {
            const Icon = agent.icon;
            return (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                onClick={() => handleCardClick(agent)}
                style={{ height: '70vh', minHeight: 480, maxHeight: '70vh' }}
                className={`relative flex flex-col rounded-3xl border shadow-sm transition-all overflow-hidden
                  ${agent.soon
                    ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                    : agent.locked
                      ? 'bg-white border-slate-200 cursor-pointer hover:shadow-lg hover:-translate-y-1'
                      : 'bg-white border-slate-200 cursor-pointer hover:shadow-xl hover:-translate-y-2'
                  }`}
              >
                {agent.soon ? (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm font-bold text-slate-400">{t('agentsPage.comingSoon')}</p>
                  </div>
                ) : (<>
                  <div className={`shrink-0 bg-gradient-to-br ${agent.bgGradient} flex items-center justify-center`} style={{ height: '20%' }}>
                    <Icon size={48} className={agent.iconColor} strokeWidth={1.5} />
                  </div>

                  <div className="px-5 pt-4 pb-3 shrink-0 border-b border-slate-100" style={{ height: '18%' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <TierBadge tier={agent.tier} />
                      {agent.locked && <Lock size={11} className="text-slate-400" />}
                    </div>
                    <h3 className="text-base font-black text-slate-800 leading-tight">{t(`agentsPage.items.${agent.id}.name`)}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{t(`agentsPage.items.${agent.id}.tagline`)}</p>
                  </div>

                  <div className="flex-1 min-h-0 overflow-hidden px-5 py-4 flex flex-col gap-2.5">
                    {agent.featureKeys.map((fk) => (
                      <div key={fk} className="flex items-start gap-2.5">
                        <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold bg-blue-100 text-blue-600">
                          <CheckCircle2 size={10} />
                        </span>
                        <span className="text-[12px] text-slate-600 leading-snug">{t(`agentsPage.items.${agent.id}.${fk}`)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 pb-5 shrink-0">
                    <div className={`w-full py-2.5 rounded-xl text-xs font-bold text-center transition-colors ${
                      agent.locked
                        ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        : 'bg-slate-800 text-white hover:bg-slate-700'
                    }`}>
                      {agent.locked ? t('agentsPage.unlock') : t('agentsPage.openChat')}
                    </div>
                  </div>
                </>)}
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {pricingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPricingModal(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden"
            >
              <div className="px-8 pt-8 pb-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-800">{t('agentsPage.pricingTitle')}</h2>
                  <p className="text-sm text-slate-500 mt-1">{t('agentsPage.pricingSubtitle')}</p>
                </div>
                <button onClick={() => setPricingModal(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 grid grid-cols-4 gap-4">
                {TIERS.map((tier) => (
                  <motion.div
                    key={tier.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${tier.color} ${
                      selectedTier === tier.id ? 'ring-2 ring-offset-2 ring-slate-800' : ''
                    }`}
                  >
                    {tier.id === 'base' && (
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest bg-slate-800 text-white px-2 py-0.5 rounded-full">
                        {t('agentsPage.currentPlan')}
                      </span>
                    )}
                    <p className={`text-base font-black ${tier.accent} mb-1`}>{tier.name}</p>
                    <p className="text-lg font-black text-slate-800">{t(`agentsPage.tiers.${tier.id}.price`)}</p>
                    <div className="mt-4 space-y-1.5 text-[11px] text-slate-600">
                      {TIER_FEATURE_KEYS[tier.id].map((fk) => (
                        <p key={fk}>· {t(`agentsPage.tiers.${tier.id}.${fk}`)}</p>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="px-8 pb-8 flex items-center gap-3">
                <button
                  disabled={!selectedTier || selectedTier === 'base'}
                  className="flex-1 py-3 bg-slate-800 text-white text-sm font-bold rounded-2xl hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedTier && selectedTier !== 'base'
                    ? t('agentsPage.proceedToPay').replace('{price}', t(`agentsPage.tiers.${selectedTier}.price`))
                    : t('agentsPage.choosePlan')}
                </button>
                <button onClick={() => setPricingModal(false)} className="px-5 py-3 text-sm text-slate-500 font-medium hover:text-slate-800 transition-colors">
                  {t('agentsPage.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
