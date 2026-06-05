'use client';

import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { LanguageSwitcher } from '../LanguageSwitcher';

export function AuthLayout({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const { t } = useI18n();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="w-full max-w-[420px]"
    >
      <motion.div className="flex justify-end mb-4">
        <LanguageSwitcher compact />
      </motion.div>

      <motion.div className="text-center mb-8">
        <motion.div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-proji-primary/10 mb-4">
          <ShieldCheck size={28} className="text-proji-primary" strokeWidth={2.25} />
        </motion.div>
        <h1 className="text-3xl font-black text-proji-primary tracking-tight">{t('common.proji')}</h1>
        <p className="text-sm text-slate-500 font-medium mt-1.5">{t('auth.tagline')}</p>
      </motion.div>

      <motion.div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_8px_40px_-12px_rgba(0,31,63,0.12)] overflow-hidden">
        <motion.div className="px-8 pt-8 pb-5 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{subtitle}</p>
        </motion.div>
        <motion.div className="px-8 py-6">{children}</motion.div>
      </motion.div>
    </motion.div>
  );
}
