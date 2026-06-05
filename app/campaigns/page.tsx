'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Megaphone, TrendingUp, Users, DollarSign, Eye, MousePointer, Plus, BarChart3 } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type CampaignStatus = 'active' | 'paused' | 'completed' | 'draft';
interface Campaign {
  id: string; name: string; channel: string; status: CampaignStatus;
  budget: string; spent: string; impressions: string; clicks: string; ctr: string; leads: number; startDate: string;
}

const STATUS: Record<CampaignStatus, { label: string; cls: string }> = {
  active:    { label: 'Активна',   cls: 'bg-green-100 text-green-600' },
  paused:    { label: 'Пауза',     cls: 'bg-yellow-100 text-yellow-700' },
  completed: { label: 'Завершена', cls: 'bg-slate-100 text-slate-500' },
  draft:     { label: 'Черновик',  cls: 'bg-blue-100 text-blue-600' },
};

const MOCK: Campaign[] = [
  { id: '1', name: 'Запуск продукта Q2', channel: 'Google Ads', status: 'active', budget: '₽ 150 000', spent: '₽ 87 400', impressions: '245 000', clicks: '4 120', ctr: '1.68%', leads: 38, startDate: '01.04.2024' },
  { id: '2', name: 'Ретаргетинг VK', channel: 'VKontakte', status: 'active', budget: '₽ 80 000', spent: '₽ 51 200', impressions: '180 000', clicks: '2 340', ctr: '1.30%', leads: 21, startDate: '15.03.2024' },
  { id: '3', name: 'Email-рассылка клиентам', channel: 'Email', status: 'completed', budget: '₽ 25 000', spent: '₽ 25 000', impressions: '12 500', clicks: '1 875', ctr: '15.00%', leads: 45, startDate: '01.02.2024' },
  { id: '4', name: 'Контент-маркетинг блог', channel: 'SEO/Блог', status: 'active', budget: '₽ 60 000', spent: '₽ 32 000', impressions: '54 000', clicks: '3 200', ctr: '5.93%', leads: 14, startDate: '01.01.2024' },
  { id: '5', name: 'TikTok Gen Z кампания', channel: 'TikTok', status: 'draft', budget: '₽ 200 000', spent: '₽ 0', impressions: '—', clicks: '—', ctr: '—', leads: 0, startDate: 'Не запущена' },
];

const CHANNELS = ['Все', 'Google Ads', 'VKontakte', 'Email', 'SEO/Блог', 'TikTok'];

export default function CampaignsPage() {
  const [filter, setFilter] = useState('Все');

  const filtered = filter === 'Все' ? MOCK : MOCK.filter((c) => c.channel === filter);

  const totalBudget  = 515000;
  const totalSpent   = 195600;
  const totalLeads   = MOCK.reduce((s, c) => s + c.leads, 0);
  const activeCount  = MOCK.filter((c) => c.status === 'active').length;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto w-full px-4 md:px-10 pb-16">

        <div className="flex items-center justify-between mb-2 pt-1">
          <div className="flex items-center gap-2">
            <Megaphone size={20} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Кампании</h1>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-proji-primary text-white text-sm font-bold rounded-xl hover:bg-proji-primary/90 transition-colors">
            <Plus size={14} /> Новая кампания
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-8">Управление рекламными кампаниями по каналам</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Общий бюджет',  value: '₽ 515 000', icon: DollarSign, color: 'text-blue-500' },
            { label: 'Потрачено',     value: '₽ 195 600', icon: TrendingUp, color: 'text-orange-500' },
            { label: 'Лидов всего',   value: totalLeads,  icon: Users,      color: 'text-green-500' },
            { label: 'Активных',      value: activeCount, icon: BarChart3,  color: 'text-proji-primary' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">Общий расход бюджета</span>
            <span className="font-bold text-slate-800">{Math.round(totalSpent / totalBudget * 100)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div className="h-full bg-proji-primary rounded-full"
              initial={{ width: 0 }} animate={{ width: `${totalSpent / totalBudget * 100}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1.5">
            <span>Потрачено: ₽ 195 600</span><span>Бюджет: ₽ 515 000</span>
          </div>
        </div>

        {/* Channel filter */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {CHANNELS.map((ch) => (
            <button key={ch} onClick={() => setFilter(ch)}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-colors ${filter === ch ? 'bg-proji-primary text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >
              {ch}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span>Кампания</span><span>Статус</span><span>Бюджет</span><span>Показы</span><span>Клики</span><span>CTR</span><span>Лиды</span>
          </div>
          {filtered.map((c) => (
            <div key={c.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2 md:gap-3 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-sm font-bold text-slate-800">{c.name}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1"><MousePointer size={10} />{c.channel} · {c.startDate}</p>
              </div>
              <span className={`self-center text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${STATUS[c.status].cls}`}>
                {STATUS[c.status].label}
              </span>
              <div className="self-center">
                <p className="text-xs font-bold text-slate-700">{c.spent}</p>
                <p className="text-[10px] text-slate-400">из {c.budget}</p>
              </div>
              <p className="text-xs text-slate-600 self-center flex items-center gap-1"><Eye size={11} />{c.impressions}</p>
              <p className="text-xs text-slate-600 self-center">{c.clicks}</p>
              <p className="text-xs font-bold text-proji-primary self-center">{c.ctr}</p>
              <p className="text-xs font-bold text-green-600 self-center">{c.leads}</p>
            </div>
          ))}
        </div>

      </div>
    </PageWrapper>
  );
}
