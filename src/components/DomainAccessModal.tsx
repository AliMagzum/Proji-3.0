'use client';
import { useState, useRef } from 'react';
import { useModalClose } from '../hooks/useModalClose';
import { motion } from 'motion/react';
import { X, KeyRound, ArrowRight, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { useI18n } from '../context/I18nContext';
import { DOMAIN_SLUG } from '../i18n/helpers';
import type { BusinessDomain } from '../types';

interface Participant { initials: string; color: string; name: string }

interface DomainModalData {
  name: string;
  description: string;
  gradient: string;
  pattern: string;
  participants: Participant[];
  totalCount: number;
}

const DOMAIN_DATA: Record<BusinessDomain, DomainModalData> = {
  'Общий': {
    name: 'Общий', description: '',
    gradient: 'from-blue-500 via-blue-400 to-indigo-500',
    pattern: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.15) 0%, transparent 60%)',
    participants: [
      { initials: 'SS', color: '#4F46E5', name: 'Sund Serik' },
      { initials: 'АИ', color: '#2563EB', name: 'Алексей И.' },
      { initials: 'МС', color: '#7C3AED', name: 'Мария С.' },
      { initials: 'ДК', color: '#0891B2', name: 'Дима К.' },
      { initials: 'КЛ', color: '#059669', name: 'Катя Л.' },
    ], totalCount: 12,
  },
  'Финансы': {
    name: 'Финансы', description: '',
    gradient: 'from-emerald-500 via-green-400 to-teal-500',
    pattern: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)',
    participants: [
      { initials: 'ИФ', color: '#059669', name: 'Иван Ф.' },
      { initials: 'АК', color: '#0D9488', name: 'Анна К.' },
      { initials: 'РМ', color: '#2563EB', name: 'Рустам М.' },
      { initials: 'ОС', color: '#7C3AED', name: 'Ольга С.' },
    ], totalCount: 8,
  },
  'Маркетинг': {
    name: 'Маркетинг', description: '',
    gradient: 'from-pink-500 via-rose-400 to-orange-400',
    pattern: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.2) 0%, transparent 55%)',
    participants: [
      { initials: 'МС', color: '#EC4899', name: 'Мария С.' },
      { initials: 'ДВ', color: '#F97316', name: 'Дима В.' },
      { initials: 'КЛ', color: '#8B5CF6', name: 'Катя Л.' },
      { initials: 'ИП', color: '#06B6D4', name: 'Иван П.' },
      { initials: 'АТ', color: '#10B981', name: 'Аня Т.' },
    ], totalCount: 15,
  },
  'Стратегия': {
    name: 'Стратегия', description: '',
    gradient: 'from-indigo-600 via-violet-500 to-purple-500',
    pattern: 'radial-gradient(circle at 60% 20%, rgba(255,255,255,0.15) 0%, transparent 50%)',
    participants: [
      { initials: 'СА', color: '#6D28D9', name: 'Серик А.' },
      { initials: 'ВЛ', color: '#4F46E5', name: 'Влад Л.' },
      { initials: 'НК', color: '#7C3AED', name: 'Настя К.' },
      { initials: 'АБ', color: '#2563EB', name: 'Артём Б.' },
    ], totalCount: 6,
  },
  'Операции': {
    name: 'Операции', description: '',
    gradient: 'from-amber-500 via-orange-400 to-yellow-400',
    pattern: 'radial-gradient(circle at 40% 60%, rgba(255,255,255,0.2) 0%, transparent 50%)',
    participants: [
      { initials: 'РО', color: '#D97706', name: 'Рустам О.' },
      { initials: 'СК', color: '#EA580C', name: 'Саша К.' },
      { initials: 'МЖ', color: '#B45309', name: 'Миша Ж.' },
    ], totalCount: 9,
  },
  'Юридический': {
    name: 'Юридический', description: '',
    gradient: 'from-slate-700 via-slate-600 to-slate-500',
    pattern: 'radial-gradient(circle at 80% 40%, rgba(255,255,255,0.1) 0%, transparent 45%)',
    participants: [
      { initials: 'АЮ', color: '#475569', name: 'Андрей Ю.' },
      { initials: 'ЛВ', color: '#64748B', name: 'Лена В.' },
      { initials: 'ДД', color: '#334155', name: 'Дима Д.' },
    ], totalCount: 5,
  },
  'Управление': {
    name: 'Управление', description: '',
    gradient: 'from-sky-500 via-blue-400 to-cyan-400',
    pattern: 'radial-gradient(circle at 25% 75%, rgba(255,255,255,0.2) 0%, transparent 55%)',
    participants: [
      { initials: 'ОЛ', color: '#0284C7', name: 'Ольга Л.' },
      { initials: 'МН', color: '#0EA5E9', name: 'Миша Н.' },
      { initials: 'ТС', color: '#06B6D4', name: 'Таня С.' },
      { initials: 'ВА', color: '#0891B2', name: 'Вася А.' },
    ], totalCount: 11,
  },
  'Производство': {
    name: 'Производство', description: '',
    gradient: 'from-orange-600 via-red-500 to-rose-500',
    pattern: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)',
    participants: [
      { initials: 'ПИ', color: '#DC2626', name: 'Павел И.' },
      { initials: 'НМ', color: '#EA580C', name: 'Никита М.' },
      { initials: 'ЗА', color: '#9A3412', name: 'Зарина А.' },
      { initials: 'ФК', color: '#B91C1C', name: 'Федя К.' },
    ], totalCount: 18,
  },
  'Оборудование': {
    name: 'Оборудование', description: '',
    gradient: 'from-teal-600 via-cyan-500 to-emerald-400',
    pattern: 'radial-gradient(circle at 65% 35%, rgba(255,255,255,0.15) 0%, transparent 50%)',
    participants: [
      { initials: 'ТМ', color: '#0D9488', name: 'Тимур М.' },
      { initials: 'АС', color: '#059669', name: 'Аня С.' },
      { initials: 'ВЧ', color: '#0891B2', name: 'Витя Ч.' },
    ], totalCount: 7,
  },
};

interface Props {
  domain: BusinessDomain;
  isManager: boolean;
  isAllowed: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DomainAccessModal({ domain, isManager, isAllowed, onConfirm, onClose }: Props) {
  const { t } = useI18n();
  const [key, setKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useModalClose(onClose);

  const data = DOMAIN_DATA[domain];
  const slug = DOMAIN_SLUG[domain];
  const domainName = t(`domains.items.${slug}.name`);
  const domainDescription = t(`domains.items.${slug}.description`);
  if (!data) return null;

  const VISIBLE = 3;
  const visible = data.participants.slice(0, VISIBLE);
  const hidden = data.participants.slice(VISIBLE);
  const extraCount = data.totalCount - data.participants.length;

  const handleEnter = async () => {
    if (isManager) { onConfirm(); return; }
    if (!isAllowed) return;

    if (!key.trim()) { setError(t('domains.modal.keyRequired')); inputRef.current?.focus(); return; }

    setLoading(true);
    setError('');
    const res = await fetch('/api/credentials/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, key: key.trim() }),
    });
    const json = await res.json();
    setLoading(false);

    if (json.valid) {
      setSuccess(true);
      setTimeout(onConfirm, 500);
    } else {
      setError(t('domains.modal.keyInvalid'));
      inputRef.current?.select();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex"
        style={{ height: '520px' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-xl bg-white/20 hover:bg-white/40 text-white transition-colors"
        >
          <X size={16} />
        </button>

        {/* LEFT — image + description (50%) */}
        <div className="w-1/2 flex flex-col">
          {/* Image area — 20% of 520px = 104px */}
          <div
            className={`shrink-0 relative overflow-hidden bg-gradient-to-br ${data.gradient}`}
            style={{ height: '40%' }}
          >
            <div className="absolute inset-0" style={{ background: data.pattern }} />
            {/* Geometric decorations */}
            <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -top-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
            <div className="absolute bottom-4 left-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <ShieldCheck size={16} className="text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{t('domains.modal.secureAccess')}</span>
            </div>
          </div>

          {/* Description (60% remaining) */}
          <div className="flex-1 px-6 py-5 flex flex-col justify-center bg-slate-50 border-r border-slate-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{t('domains.modal.deptDescription')}</p>
            <p className="text-sm text-slate-600 leading-relaxed">{domainDescription}</p>
          </div>
        </div>

        {/* RIGHT — info + key input (50%) */}
        <div className="w-1/2 flex flex-col px-7 py-6">
          {/* Domain name */}
          <div className="mb-5">
            <p className={`text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${data.gradient} bg-clip-text text-transparent mb-1`}>
              {t('domains.modal.domainLobby')}
            </p>
            <h2 className="text-3xl font-black text-slate-800 leading-tight">{domainName}</h2>
          </div>

          {/* Participants */}
          <div className="mb-6">
            <p className="text-xs text-slate-400 mb-2.5">
              <span className="font-bold text-slate-700">{data.totalCount}</span> {t('domains.modal.participants')}
            </p>
            <div className="flex items-center">
              {/* Visible avatars */}
              {visible.map((p, i) => (
                <div
                  key={i}
                  title={p.name}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-black text-white shadow-sm shrink-0"
                  style={{
                    backgroundColor: p.color,
                    marginLeft: i > 0 ? '-8px' : '0',
                    zIndex: VISIBLE - i,
                  }}
                >
                  {p.initials}
                </div>
              ))}

              {/* Fading hidden avatars */}
              {hidden.slice(0, 3).map((p, i) => (
                <div
                  key={`h-${i}`}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-[11px] font-black text-white shadow-sm shrink-0"
                  style={{
                    backgroundColor: p.color,
                    marginLeft: '-8px',
                    zIndex: VISIBLE - hidden.length + i,
                    opacity: 0.35 - i * 0.1,
                  }}
                >
                  {p.initials}
                </div>
              ))}

              {/* +N badge */}
              {(extraCount + hidden.length) > 0 && (
                <div
                  className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-black text-slate-500 shadow-sm shrink-0"
                  style={{ marginLeft: '-8px', zIndex: 0 }}
                >
                  +{extraCount + hidden.length}
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-5" />

          {/* Access section */}
          {isManager ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
                  <ShieldCheck size={13} className="text-green-500" />
                </div>
                <p className="text-xs font-bold text-green-600">{t('domains.modal.managerAccess')}</p>
              </div>
              <button
                onClick={handleEnter}
                className={`w-full py-3 rounded-xl text-sm font-black text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${data.gradient} hover:opacity-90 shadow-lg`}
              >
                {t('domains.modal.enterDomain')} <ArrowRight size={15} />
              </button>
            </div>
          ) : !isAllowed ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
                <Lock size={20} className="text-red-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">{t('domains.modal.noAccess')}</p>
              <p className="text-xs text-slate-400 mt-1">{t('domains.modal.noAccessHint')}</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-xs font-bold text-slate-700 mb-1">{t('domains.modal.enterKey')}</p>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                {t('domains.modal.enterKeyHint').replace('{name}', domainName)}
              </p>

              {/* Input + Button row */}
              <div className="flex gap-2">
                <div className="flex-[7] relative">
                  <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={inputRef}
                    value={key}
                    onChange={(e) => { setKey(e.target.value); setError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
                    placeholder={t('domains.modal.keyPlaceholder')}
                    className={`w-full h-11 pl-9 pr-3 rounded-xl border text-xs font-mono text-slate-800 placeholder:text-slate-300 outline-none transition-all ${
                      error
                        ? 'border-red-300 bg-red-50 focus:border-red-400'
                        : success
                        ? 'border-green-300 bg-green-50'
                        : 'border-slate-200 bg-slate-50 focus:border-proji-primary focus:bg-white'
                    }`}
                  />
                </div>
                <button
                  onClick={handleEnter}
                  disabled={loading || success || !key.trim()}
                  className={`flex-[3] h-11 rounded-xl text-xs font-black text-white flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 bg-gradient-to-r ${data.gradient} hover:opacity-90 shadow-md`}
                >
                  {loading
                    ? <Loader2 size={13} className="animate-spin" />
                    : success
                    ? <ShieldCheck size={13} />
                    : <><ArrowRight size={13} /> {t('domains.modal.enter')}</>}
                </button>
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] text-red-500 mt-2 flex items-center gap-1"
                >
                  <span className="w-1 h-1 rounded-full bg-red-500 inline-block" />
                  {error}
                </motion.p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
