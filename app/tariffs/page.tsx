'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Zap, Shield, Crown, Sparkles } from 'lucide-react';

type Tier = { id: string; name: string; price: string; priceNote: string; icon: React.ComponentType<any>; iconColor: string; bg: string; border: string; accent: string; features: string[]; cta: string; current?: boolean };

const TIERS: Tier[] = [
  {
    id: 'base',
    name: 'Base',
    price: 'Бесплатно',
    priceNote: 'навсегда',
    icon: Sparkles,
    iconColor: 'text-slate-500',
    bg: 'bg-white',
    border: 'border-slate-200',
    accent: 'text-slate-700',
    current: true,
    cta: 'Текущий план',
    features: [
      'Базовый помощник-бот',
      '50 AI-запросов в день',
      'Стандартная скорость ответов',
      'Доступ к заметкам и задачам',
      'Email поддержка',
    ],
  },
  {
    id: 'advanced',
    name: 'Advanced',
    price: '€20',
    priceNote: '/ месяц',
    icon: Zap,
    iconColor: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    accent: 'text-blue-700',
    cta: 'Перейти на Advanced',
    features: [
      'Всё из Base',
      'Агент «Аналитик данных»',
      'Prompts Library: +3 библиотеки',
      '500 AI-запросов в день',
      'Приоритетная очередь обработки',
      'Экспорт аналитических отчётов',
      'Интеграция с дашбордами',
      'Чат-поддержка (8/5)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '€30',
    priceNote: '/ месяц',
    icon: Shield,
    iconColor: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    accent: 'text-violet-700',
    cta: 'Перейти на Pro',
    features: [
      'Всё из Advanced',
      'Агент «Стратег»',
      'Агент «Финансовый эксперт»',
      'Prompts Library: +6 библиотек',
      'Безлимитные AI-запросы',
      'GPT-4o / Gemini Ultra модели',
      'API доступ',
      'Командный режим (до 10 чел.)',
      'Приоритетная поддержка 24/7',
    ],
  },
  {
    id: 'max',
    name: 'Max',
    price: '€50',
    priceNote: '/ месяц',
    icon: Crown,
    iconColor: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    accent: 'text-amber-700',
    cta: 'Перейти на Max',
    features: [
      'Все агенты без ограничений',
      'Агент «Юридический советник»',
      'Prompts Library: +9 библиотек',
      'Выделенные вычислительные мощности',
      'White-label (ваш бренд)',
      'Безлимитные участники команды',
      'SLA 99.9% uptime',
      'Персональный менеджер',
      'Ранний доступ к новым агентам',
      'Кастомные интеграции',
    ],
  },
];

export default function TariffsPage() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#f5f7fc] overflow-y-auto">
      <div className="max-w-5xl mx-auto w-full px-8 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">AI Tools · Тарифы</p>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Выберите тариф</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Масштабируйте возможности под размер вашей команды и сложность задач
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-4 gap-5">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onHoverStart={() => setHovered(tier.id)}
                onHoverEnd={() => setHovered(null)}
                whileHover={{ y: -6 }}
                className={`relative flex flex-col rounded-3xl border-2 p-6 shadow-sm transition-all ${tier.bg} ${tier.border}`}
              >
                {tier.current && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                    Ваш план
                  </div>
                )}

                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${tier.bg === 'bg-white' ? 'bg-slate-100' : 'bg-white/60'}`}>
                  <Icon size={20} className={tier.iconColor} />
                </div>

                <p className={`text-sm font-black uppercase tracking-wide ${tier.accent} mb-1`}>{tier.name}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-2xl font-black text-slate-800">{tier.price}</span>
                  <span className="text-xs text-slate-400">{tier.priceNote}</span>
                </div>

                <ul className="flex flex-col gap-2.5 flex-1 mb-6">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className={`${tier.iconColor} shrink-0 mt-0.5`} />
                      <span className="text-[12px] text-slate-600 leading-snug">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={!!tier.current}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                    tier.current
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : `bg-slate-800 text-white hover:bg-slate-700`
                  }`}
                >
                  {tier.cta}
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ row */}
        <div className="mt-12 grid grid-cols-3 gap-6">
          {[
            { q: 'Можно сменить тариф?', a: 'Да, в любой момент. При апгрейде вы получаете доступ немедленно. При даунгрейде — изменение вступит в силу в следующем цикле.' },
            { q: 'Как оплатить?', a: 'Принимаем карты Visa/Mastercard и SEPA-переводы. Возможна оплата в EUR и KZT. Выставление счёта для юридических лиц.' },
            { q: 'Есть пробный период?', a: 'Тариф Advanced доступен бесплатно в течение 14 дней для новых команд. Карта при регистрации не требуется.' },
          ].map((item) => (
            <div key={item.q} className="bg-white border border-slate-200 rounded-2xl p-5">
              <p className="text-sm font-bold text-slate-800 mb-2">{item.q}</p>
              <p className="text-xs text-slate-500 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
