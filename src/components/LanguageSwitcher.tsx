'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import type { Locale } from '../i18n/types';

const LOCALES: Locale[] = ['ru', 'en', 'kz'];

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  const label = locale.toUpperCase();

  return (
    <motion.div
      ref={ref}
      className="relative"
      whileTap={{ scale: 0.97 }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Language"
        className={`flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold transition-colors hover:border-slate-300 hover:bg-slate-50 ${
          compact ? 'h-9 px-2.5 text-xs' : 'h-9 px-3 text-xs'
        }`}
      >
        <Globe size={14} className="text-proji-primary shrink-0" />
        <span>{label}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="absolute right-0 top-full mt-2 min-w-[148px] bg-white border border-slate-200 rounded-2xl shadow-xl p-1.5 z-[300]"
          >
            {LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocale(loc);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  locale === loc
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t(`lang.${loc}`)}
                {locale === loc && <Check size={14} className="text-proji-primary" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
