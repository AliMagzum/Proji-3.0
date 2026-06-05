'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Users, Loader2, Copy, Check, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../../src/components/auth/AuthLayout';
import { useI18n } from '../../src/context/I18nContext';
import {
  createOrganization,
  joinOrganization,
  hasOrganization,
  getOrganization,
} from '../../src/lib/organization';

type Tab = 'create' | 'join';

export default function OnboardingPage() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>('create');
  const [companyName, setCompanyName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdInvite, setCreatedInvite] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    if (status === 'authenticated' && hasOrganization() && !createdInvite) {
      router.replace('/chat');
    }
  }, [status, router, createdInvite]);

  const copyInvite = async () => {
    if (!createdInvite) return;
    await navigator.clipboard.writeText(createdInvite);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setError('');
    setLoading(true);
    try {
      const { inviteCode: code } = await createOrganization(companyName);
      setCreatedInvite(code);
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const org = await joinOrganization(inviteCode);
      if (!org) {
        setError(t('onboarding.inviteInvalid'));
        return;
      }
      router.replace('/chat');
    } catch {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-proji-primary" />
      </div>
    );
  }

  if (status !== 'authenticated') return null;

  const org = getOrganization();

  if (createdInvite) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4 sm:p-6">
        <AuthLayout
          title={org?.name ?? t('onboarding.title')}
          subtitle={t('onboarding.inviteCreated')}
        >
          <div className="space-y-4">
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <code className="flex-1 text-sm font-mono font-bold text-slate-800 truncate">
                {createdInvite}
              </code>
              <button
                type="button"
                onClick={copyInvite}
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? t('onboarding.copied') : t('onboarding.copyCode')}
              </button>
            </motion.div>
            <button
              type="button"
              onClick={() => router.replace('/chat')}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-proji-primary text-white rounded-xl text-sm font-bold hover:bg-proji-primary/90 transition-colors"
            >
              {t('onboarding.goToApp')}
              <ArrowRight size={16} />
            </button>
          </div>
        </AuthLayout>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4 sm:p-6">
      <AuthLayout title={t('onboarding.title')} subtitle={t('onboarding.subtitle')}>
        <motion.div
          className="flex p-1 bg-slate-100 rounded-xl mb-6"
          layout
        >
          {(['create', 'join'] as Tab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => { setTab(key); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                tab === key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {key === 'create' ? <Building2 size={14} /> : <Users size={14} />}
              {key === 'create' ? t('onboarding.tabCreate') : t('onboarding.tabJoin')}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {tab === 'create' ? (
            <motion.form
              key="create"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onSubmit={handleCreate}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {t('onboarding.companyName')}
                </label>
                <input
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder={t('onboarding.companyPlaceholder')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:bg-white transition-all"
                />
              </div>
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !companyName.trim()}
                className="w-full py-3.5 bg-proji-primary text-white rounded-xl text-sm font-bold hover:bg-proji-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? t('onboarding.creating') : t('onboarding.create')}
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="join"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              onSubmit={handleJoin}
              className="space-y-4"
            >
              <motion.div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                  {t('onboarding.inviteCode')}
                </label>
                <input
                  required
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                  placeholder={t('onboarding.invitePlaceholder')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:bg-white transition-all uppercase"
                />
              </motion.div>
              {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !inviteCode.trim()}
                className="w-full py-3.5 bg-proji-primary text-white rounded-xl text-sm font-bold hover:bg-proji-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? t('onboarding.joining') : t('onboarding.join')}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </AuthLayout>
    </div>
  );
}
