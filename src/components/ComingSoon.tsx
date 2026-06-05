'use client';

import Link from 'next/link';
import { Construction } from 'lucide-react';
import { useI18n } from '../context/I18nContext';

export function ComingSoon({ title }: { title: string }) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Construction className="text-slate-400" size={28} />
      </div>
      <h1 className="text-xl font-black text-slate-800 mb-2">{title}</h1>
      <p className="text-sm text-slate-500 max-w-md mb-6">{t('comingSoon.description')}</p>
      <div className="flex flex-wrap gap-2 justify-center">
        <Link
          href="/domains"
          className="px-4 py-2 rounded-xl bg-proji-primary text-white text-sm font-bold hover:bg-proji-primary/90"
        >
          {t('comingSoon.domains')}
        </Link>
        <Link
          href="/tasks"
          className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          {t('comingSoon.tasks')}
        </Link>
      </div>
    </div>
  );
}
