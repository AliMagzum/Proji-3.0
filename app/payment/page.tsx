'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, Lock, CheckCircle2, ArrowRight, Shield } from 'lucide-react';

export default function PaymentPage() {
  const [step, setStep] = useState<'select' | 'form'>('select');
  const [plan, setPlan] = useState<string | null>(null);

  const plans = [
    { id: 'advanced', name: 'Advanced', price: '€20', period: '/мес' },
    { id: 'pro', name: 'Pro', price: '€30', period: '/мес' },
    { id: 'max', name: 'Max', price: '€50', period: '/мес' },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f5f7fc] overflow-y-auto">
      <div className="max-w-lg mx-auto w-full px-6 py-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">AI Tools · Оплата</p>
        <h1 className="text-2xl font-black text-slate-800 mb-6">Оформление подписки</h1>

        {step === 'select' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <p className="text-sm text-slate-500 mb-4">Выберите тариф для оформления</p>
            {plans.map((p) => (
              <button
                key={p.id}
                onClick={() => { setPlan(p.id); setStep('form'); }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all bg-white hover:border-slate-800 hover:shadow-md ${plan === p.id ? 'border-slate-800' : 'border-slate-200'}`}
              >
                <div className="text-left">
                  <p className="text-sm font-black text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500">Ежемесячная подписка</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-slate-800">{p.price}</span>
                  <span className="text-xs text-slate-400">{p.period}</span>
                  <ArrowRight size={14} className="text-slate-400" />
                </div>
              </button>
            ))}
          </motion.div>
        )}

        {step === 'form' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
            <button onClick={() => setStep('select')} className="text-xs text-slate-400 hover:text-slate-700 transition-colors">
              ← Назад к выбору тарифа
            </button>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wide">Выбранный тариф</p>
                <p className="text-base font-black text-slate-800">{plans.find(p => p.id === plan)?.name}</p>
              </div>
              <p className="text-xl font-black text-slate-800">{plans.find(p => p.id === plan)?.price}<span className="text-xs text-slate-400">/мес</span></p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard size={16} className="text-slate-500" />
                <p className="text-sm font-bold text-slate-700">Данные карты</p>
                <Lock size={12} className="text-slate-400 ml-auto" />
                <span className="text-[10px] text-slate-400">Защищено SSL</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Номер карты</label>
                  <div className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50">
                    •••• •••• •••• ••••
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Срок действия</label>
                    <div className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50">ММ / ГГ</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">CVV</label>
                    <div className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50">•••</div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-500">Имя держателя</label>
                  <div className="mt-1 w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-400 bg-slate-50">FULL NAME</div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 px-1">
              <Shield size={13} className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Платёж защищён. Данные карты не хранятся на наших серверах. Отмена подписки доступна в любое время.
              </p>
            </div>

            <button className="w-full py-3.5 bg-slate-800 text-white text-sm font-bold rounded-2xl hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
              <Lock size={14} /> Оплатить {plans.find(p => p.id === plan)?.price}/мес
            </button>

            <div className="flex items-center justify-center gap-4 pt-2">
              {['VISA', 'MC', 'SEPA'].map((brand) => (
                <div key={brand} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg">
                  <span className="text-[10px] font-black text-slate-400 tracking-wide">{brand}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
