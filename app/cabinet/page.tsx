'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import {
  KeyRound, Lock, Eye, EyeOff, RefreshCw, Check, Loader2,
  Shield, LogOut, User, Copy, Mail, Phone, Save,
  Globe, DollarSign, TrendingUp, Target, Settings2,
  Scale, Users, Factory, Wrench,
} from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

interface DomainCred { name: string; key: string; password: string }

const DOMAIN_ICONS: Record<string, React.ComponentType<any>> = {
  'Общий': Globe, 'Финансы': DollarSign, 'Маркетинг': TrendingUp,
  'Стратегия': Target, 'Операции': Settings2, 'Юридический': Scale,
  'Управление': Users, 'Производство': Factory, 'Оборудование': Wrench,
};
const DOMAIN_COLORS: Record<string, string> = {
  'Общий': 'bg-blue-50 text-blue-500', 'Финансы': 'bg-green-50 text-green-500',
  'Маркетинг': 'bg-pink-50 text-pink-500', 'Стратегия': 'bg-indigo-50 text-indigo-500',
  'Операции': 'bg-amber-50 text-amber-500', 'Юридический': 'bg-purple-50 text-purple-500',
  'Управление': 'bg-sky-50 text-sky-500', 'Производство': 'bg-orange-50 text-orange-500',
  'Оборудование': 'bg-teal-50 text-teal-500',
};

type LoadingState = { domain: string; field: 'key' | 'password' } | null;

function EmployerProfileEditor({ email }: { email: string }) {
  const [form, setForm] = useState({
    name: 'Employer',
    email,
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = () => {
    setError('');
    if (form.password && form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    if (form.password && form.password.length < 6) {
      setError('Минимум 6 символов');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const fields: { key: keyof typeof form; label: string; type: string; placeholder: string; icon: React.ComponentType<any> }[] = [
    { key: 'name',            label: 'Имя',            type: 'text',     placeholder: 'Ваше имя',          icon: User },
    { key: 'email',           label: 'Email',          type: 'email',    placeholder: 'email@company.com', icon: Mail },
    { key: 'phone',           label: 'Телефон',        type: 'tel',      placeholder: '+7 (___) ___-__-__', icon: Phone },
    { key: 'password',        label: 'Новый пароль',   type: showPass ? 'text' : 'password', placeholder: '••••••••', icon: Lock },
    { key: 'confirmPassword', label: 'Повторить пароль', type: showPass ? 'text' : 'password', placeholder: '••••••••', icon: Lock },
  ];

  return (
    <div className="max-w-lg">
      <div className="mb-4">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Профиль</h2>
        <p className="text-xs text-slate-400 mt-0.5">Редактирование данных аккаунта</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
              <f.icon size={9} /> {f.label}
            </label>
            <div className="relative">
              <f.icon size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type={f.type}
                value={form[f.key]}
                onChange={set(f.key)}
                placeholder={f.placeholder}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:bg-white transition-all"
              />
              {(f.key === 'password') && (
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              )}
            </div>
          </div>
        ))}

        {error && (
          <p className="text-xs text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>
        )}

        <button
          onClick={save}
          className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all bg-proji-primary text-white hover:bg-proji-primary/90"
        >
          {saved ? <><Check size={14} /> Сохранено</> : <><Save size={14} /> Сохранить</>}
        </button>
      </div>
    </div>
  );
}

function DomainCard({ cred, onUpdate }: { cred: DomainCred; onUpdate: (d: string, f: 'key' | 'password', v?: string) => Promise<void> }) {
  const [showPass, setShowPass] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [editPass, setEditPass] = useState('');
  const [editingPass, setEditingPass] = useState(false);
  const [loading, setLoading] = useState<'key' | 'password' | null>(null);
  const [copied, setCopied] = useState<'key' | 'password' | null>(null);

  const Icon = DOMAIN_ICONS[cred.name] ?? Shield;
  const iconColor = DOMAIN_COLORS[cred.name] ?? 'bg-slate-50 text-slate-500';

  const copy = (text: string, field: 'key' | 'password') => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1500);
  };

  const regen = async () => {
    setLoading('key');
    await onUpdate(cred.name, 'key');
    setLoading(null);
  };

  const savePass = async () => {
    if (!editPass.trim()) return;
    setLoading('password');
    await onUpdate(cred.name, 'password', editPass.trim());
    setLoading(null);
    setEditingPass(false);
    setEditPass('');
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-slate-300 transition-colors"
    >
      {/* Domain header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
          <Icon size={16} />
        </div>
        <div>
          <p className="text-sm font-black text-slate-800">{cred.name}</p>
          <p className="text-[10px] text-slate-400 uppercase tracking-wide">Доступ к домену</p>
        </div>
        <div className="ml-auto">
          <span className="text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
            Активен
          </span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {/* Key row */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <KeyRound size={9} /> Ключ домена
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <code className="text-xs text-slate-700 font-mono flex-1 truncate">
                {showKey ? cred.key : '•'.repeat(cred.key.length)}
              </code>
              <button onClick={() => setShowKey((v) => !v)} className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
                {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
              </button>
            </div>
            <button
              onClick={() => copy(cred.key, 'key')}
              title="Скопировать"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-proji-primary hover:border-proji-primary/30 transition-all"
            >
              {copied === 'key' ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
            </button>
            <button
              onClick={regen}
              disabled={loading === 'key'}
              title="Сгенерировать новый ключ"
              className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-amber-500 hover:border-amber-200 transition-all disabled:opacity-50"
            >
              {loading === 'key'
                ? <Loader2 size={13} className="animate-spin" />
                : <RefreshCw size={13} />}
            </button>
          </div>
        </div>

        {/* Password row */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
            <Lock size={9} /> Пароль домена
          </label>
          {editingPass ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                type="text"
                value={editPass}
                onChange={(e) => setEditPass(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') savePass(); if (e.key === 'Escape') { setEditingPass(false); setEditPass(''); } }}
                placeholder="Новый пароль..."
                className="flex-1 bg-slate-50 border border-proji-primary/40 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none"
              />
              <button
                onClick={savePass}
                disabled={!editPass.trim() || loading === 'password'}
                className="p-2 rounded-xl bg-proji-primary text-white hover:bg-proji-primary/90 disabled:opacity-50 transition-all"
              >
                {loading === 'password' ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <code className="text-xs text-slate-700 font-mono flex-1 truncate">
                  {showPass ? cred.password : '•'.repeat(Math.min(cred.password.length, 16))}
                </code>
                <button onClick={() => setShowPass((v) => !v)} className="text-slate-400 hover:text-slate-700 transition-colors shrink-0">
                  {showPass ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
              <button
                onClick={() => copy(cred.password, 'password')}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-proji-primary hover:border-proji-primary/30 transition-all"
              >
                {copied === 'password' ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
              </button>
              <button
                onClick={() => { setEditingPass(true); setEditPass(cred.password); }}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-proji-primary hover:border-proji-primary/30 transition-all"
                title="Изменить пароль"
              >
                <Lock size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CabinetPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [domains, setDomains] = useState<DomainCred[]>([]);
  const [fetching, setFetching] = useState(true);

  const role = (session?.user as any)?.role as 'manager' | 'employer' | undefined;
  const allowedDomains: string[] = (session?.user as any)?.allowedDomains ?? [];
  const isManager = role === 'manager';

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    fetch('/api/credentials')
      .then((r) => r.json())
      .then((d) => {
        const all: DomainCred[] = d.domains ?? [];
        // Employer only sees their allowed domains
        const filtered = isManager
          ? all
          : all.filter((dom) => allowedDomains.includes(dom.name));
        setDomains(filtered);
      })
      .finally(() => setFetching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, isManager]);

  const handleUpdate = useCallback(async (domain: string, field: 'key' | 'password', value?: string) => {
    const res = await fetch('/api/credentials', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, field, value }),
    });
    const data = await res.json();
    if (data.domain) {
      setDomains((prev) => prev.map((d) => d.name === domain ? { ...d, ...data.domain } : d));
    }
  }, []);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={22} className="animate-spin text-proji-primary" />
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto px-6 pb-12 w-full">
        {/* Manager card */}
        <div className="bg-white rounded-2xl border border-slate-200 px-6 py-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-proji-primary/10 flex items-center justify-center shrink-0">
            <User size={20} className="text-proji-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-slate-800">{session?.user?.name ?? 'Управленец'}</p>
            <p className="text-xs text-slate-400">{session?.user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${
              isManager
                ? 'text-proji-primary bg-proji-primary/10'
                : 'text-amber-600 bg-amber-50'
            }`}>
              {isManager ? 'Менеджер' : 'Сотрудник'}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100"
            >
              <LogOut size={13} /> Выйти
            </button>
          </div>
        </div>

        {/* Manager: domain credentials grid */}
        {isManager && (
          <>
            <div className="mb-4">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Доступы к доменам</h2>
              <p className="text-xs text-slate-400 mt-0.5">Ключ и пароль для каждого из 9 панелей лобби</p>
            </div>
            {fetching ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 size={22} className="animate-spin text-proji-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {domains.map((cred) => (
                  <DomainCard key={cred.name} cred={cred} onUpdate={handleUpdate} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Employer: profile editor */}
        {!isManager && (
          <EmployerProfileEditor email={session?.user?.email ?? ''} />
        )}

      </div>
    </PageWrapper>
  );
}
