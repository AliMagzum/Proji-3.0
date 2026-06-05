'use client';

import { motion } from 'motion/react';
import { PageWrapper } from '@/components/PageWrapper';
import {
  Users,
  Star,
  DollarSign,
  MousePointerClick,
  BarChart2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const kpis = [
  { label: 'Выручка', value: '12.4М ₽', change: '+18%', up: true, icon: DollarSign, iconBg: 'bg-blue-50 text-blue-600' },
  { label: 'Конверсия', value: '4.2%', change: '+0.8%', up: true, icon: MousePointerClick, iconBg: 'bg-emerald-50 text-emerald-600' },
  { label: 'Новые клиенты', value: '847', change: '+23%', up: true, icon: Users, iconBg: 'bg-violet-50 text-violet-600' },
  { label: 'NPS', value: '72', change: '+5', up: true, icon: Star, iconBg: 'bg-amber-50 text-amber-600' },
];

const monthlyRevenue = [
  { month: 'Янв', pct: 62 }, { month: 'Фев', pct: 55 }, { month: 'Мар', pct: 70 },
  { month: 'Апр', pct: 78 }, { month: 'Май', pct: 65 }, { month: 'Июн', pct: 83 },
  { month: 'Июл', pct: 76 }, { month: 'Авг', pct: 88 }, { month: 'Сен', pct: 92 },
  { month: 'Окт', pct: 85 }, { month: 'Ноя', pct: 96 }, { month: 'Дек', pct: 100 },
];

const weeklyVisitors = [
  { day: 'Пн', v: 72 }, { day: 'Вт', v: 85 }, { day: 'Ср', v: 91 },
  { day: 'Чт', v: 78 }, { day: 'Пт', v: 95 }, { day: 'Сб', v: 48 }, { day: 'Вс', v: 35 },
];

const channels = [
  { name: 'Органический поиск', sessions: '18 420', conv: '5.1%', revenue: '4.8М ₽', change: '+12%', up: true },
  { name: 'Контекстная реклама', sessions: '9 840', conv: '6.3%', revenue: '3.2М ₽', change: '+7%', up: true },
  { name: 'Социальные сети', sessions: '7 210', conv: '3.8%', revenue: '2.1М ₽', change: '-2%', up: false },
  { name: 'Email-рассылка', sessions: '5 670', conv: '7.9%', revenue: '1.8М ₽', change: '+31%', up: true },
  { name: 'Реферальный трафик', sessions: '3 120', conv: '4.4%', revenue: '0.9М ₽', change: '+5%', up: true },
];

export default function Page() {
  return (
    <PageWrapper>
      <div className="px-6 pb-8 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Аналитика</h1>
            <p className="text-slate-500 text-sm mt-0.5">Декабрь 2024 · Обновлено только что</p>
          </div>
          <div className="flex gap-2">
            {['7д', '30д', '90д', 'Год'].map((p, i) => (
              <button key={p} className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                i === 3 ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}>{p}</button>
            ))}
          </div>
        </motion.div>

        {/* KPI Cards */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <motion.div key={k.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.iconBg}`}>
                  <k.icon size={20} />
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                  k.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                  {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{k.change}
                </span>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-slate-800">{k.value}</div>
                <div className="text-sm text-slate-500 mt-0.5">{k.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-5 gap-4">
          {/* Bar Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.28 }}
            className="col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-slate-800">Выручка по месяцам</h2>
                <p className="text-xs text-slate-500 mt-0.5">2024 год · в миллионах рублей</p>
              </div>
              <BarChart2 size={18} className="text-slate-400" />
            </div>
            <div className="flex items-end gap-2 h-40">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full rounded-t-md bg-blue-500 hover:bg-blue-600 transition-colors"
                    style={{ height: `${(m.pct / 100) * 140}px` }} />
                  <span className="text-[10px] text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Weekly Visitors */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.35 }}
            className="col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-semibold text-slate-800">Посетители</h2>
                <p className="text-xs text-slate-500 mt-0.5">Текущая неделя</p>
              </div>
              <TrendingUp size={18} className="text-emerald-500" />
            </div>
            <div className="flex items-end gap-3 h-40">
              {weeklyVisitors.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${(d.v / 100) * 140}px`,
                      background: d.v >= 80 ? '#2563EB' : d.v >= 60 ? '#60A5FA' : '#BFDBFE',
                    }} />
                  <span className="text-[10px] text-slate-500">{d.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Всего за неделю</span>
              <span className="font-semibold text-slate-700">42 380</span>
            </div>
          </motion.div>
        </div>

        {/* Channels Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.42 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Топ каналов привлечения</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">Канал</th>
                <th className="px-5 py-3 font-medium">Сессии</th>
                <th className="px-5 py-3 font-medium">Конверсия</th>
                <th className="px-5 py-3 font-medium">Выручка</th>
                <th className="px-5 py-3 font-medium">Динамика</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c, i) => (
                <tr key={c.name} className={i % 2 === 1 ? 'bg-slate-50' : 'bg-white'}>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{c.name}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.sessions}</td>
                  <td className="px-5 py-3.5 text-slate-600">{c.conv}</td>
                  <td className="px-5 py-3.5 font-semibold text-slate-800">{c.revenue}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      c.up ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {c.up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{c.change}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
