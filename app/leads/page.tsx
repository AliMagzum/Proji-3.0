'use client';
import { useState } from 'react';
import { Users, TrendingUp, Phone, Mail, MoreHorizontal, Search, X, Filter } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
interface Lead {
  id: string; name: string; company: string; email: string; phone: string;
  source: string; status: LeadStatus; score: number; value: string; date: string; manager: string;
}

const STATUS: Record<LeadStatus, { label: string; cls: string }> = {
  new:       { label: 'Новый',      cls: 'bg-blue-100 text-blue-600' },
  contacted: { label: 'Контакт',    cls: 'bg-purple-100 text-purple-600' },
  qualified: { label: 'Квалификац.',cls: 'bg-yellow-100 text-yellow-700' },
  proposal:  { label: 'КП отправлен',cls: 'bg-orange-100 text-orange-600' },
  won:       { label: 'Выиграно',   cls: 'bg-green-100 text-green-600' },
  lost:      { label: 'Проигран',   cls: 'bg-red-100 text-red-600' },
};

const MOCK: Lead[] = [
  { id: '1', name: 'Иванов Алексей', company: 'ООО "Вектор"', email: 'ivanov@vector.ru', phone: '+7 909 123-45-67', source: 'Google', status: 'proposal', score: 85, value: '₽ 480 000', date: '12.04.2024', manager: 'Мария К.' },
  { id: '2', name: 'Петрова Ольга',   company: 'ЗАО "Апекс"',   email: 'o.petrova@apex.ru', phone: '+7 905 234-56-78', source: 'Реферал',status: 'qualified', score: 72, value: '₽ 220 000', date: '10.04.2024', manager: 'Дмитрий С.' },
  { id: '3', name: 'Сидоров Игорь',  company: 'ИП Сидоров',     email: 'sidorov@mail.ru',   phone: '+7 912 345-67-89', source: 'VK',    status: 'new', score: 41, value: '₽ 90 000', date: '09.04.2024', manager: 'Мария К.' },
  { id: '4', name: 'Козлова Анна',   company: 'ООО "Примус"',   email: 'kozlova@primus.ru', phone: '+7 903 456-78-90', source: 'Email', status: 'contacted', score: 58, value: '₽ 150 000', date: '08.04.2024', manager: 'Дмитрий С.' },
  { id: '5', name: 'Морозов Виктор', company: 'АО "СтройПром"', email: 'v.morozov@sp.ru',   phone: '+7 916 567-89-01', source: 'Google',status: 'won', score: 95, value: '₽ 1 200 000', date: '01.04.2024', manager: 'Мария К.' },
  { id: '6', name: 'Федорова Татьяна',company: 'ООО "Базис"',   email: 'fedorova@bazis.ru', phone: '+7 925 678-90-12', source: 'Звонок',status: 'lost', score: 30, value: '₽ 60 000', date: '28.03.2024', manager: 'Дмитрий С.' },
];

const PIPELINE: LeadStatus[] = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];

export default function LeadsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [view, setView] = useState<'table' | 'kanban'>('table');

  const filtered = MOCK.filter((l) => {
    const q = search.toLowerCase();
    return (l.name.toLowerCase().includes(q) || l.company.toLowerCase().includes(q))
      && (statusFilter === 'all' || l.status === statusFilter);
  });

  const stats = {
    total:      MOCK.length,
    won:        MOCK.filter((l) => l.status === 'won').length,
    pipeline:   MOCK.filter((l) => !['won','lost'].includes(l.status)).length,
    conversion: Math.round(MOCK.filter((l) => l.status === 'won').length / MOCK.length * 100),
  };

  const TAB = (t: string) =>
    `px-4 py-1.5 text-sm font-bold rounded-lg transition-colors ${view === t ? 'bg-proji-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto w-full px-4 md:px-10 pb-16">

        <div className="flex items-center justify-between mb-2 pt-1">
          <div className="flex items-center gap-2">
            <Users size={20} className="text-proji-primary" />
            <h1 className="text-xl font-black text-slate-900">Лиды</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button className={TAB('table')} onClick={() => setView('table')}>Таблица</button>
              <button className={TAB('kanban')} onClick={() => setView('kanban')}>Kanban</button>
            </div>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-8">CRM: управление лидами и воронкой продаж</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Всего лидов',    value: stats.total,      icon: Users,       color: 'text-blue-500' },
            { label: 'В воронке',       value: stats.pipeline,   icon: TrendingUp,  color: 'text-proji-primary' },
            { label: 'Выиграно',        value: stats.won,        icon: TrendingUp,  color: 'text-green-500' },
            { label: 'Конверсия',       value: `${stats.conversion}%`, icon: Filter, color: 'text-orange-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex-1 min-w-48 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl">
            <Search size={14} className="text-slate-300 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, компании..."
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
            />
            {search && <button onClick={() => setSearch('')}><X size={13} className="text-slate-300" /></button>}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button onClick={() => setStatusFilter('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-xl ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
            >Все</button>
            {PIPELINE.map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl ${statusFilter === s ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
              >
                {STATUS[s].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table view */}
        {view === 'table' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Лид</span><span>Компания</span><span>Статус</span><span>Оценка</span><span>Сумма</span><span>Менеджер</span>
            </div>
            {filtered.map((l) => (
              <div key={l.id} className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] gap-2 md:gap-3 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                <div>
                  <p className="text-sm font-bold text-slate-800">{l.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <a href={`mailto:${l.email}`} className="text-[10px] text-slate-400 flex items-center gap-0.5 hover:text-proji-primary transition-colors">
                      <Mail size={9} />{l.email}
                    </a>
                  </div>
                </div>
                <p className="text-sm text-slate-600 self-center">{l.company}</p>
                <span className={`self-center text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${STATUS[l.status].cls}`}>
                  {STATUS[l.status].label}
                </span>
                <div className="self-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-proji-primary rounded-full" style={{ width: `${l.score}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{l.score}</span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-700 self-center">{l.value}</p>
                <p className="text-xs text-slate-500 self-center">{l.manager}</p>
              </div>
            ))}
            {filtered.length === 0 && <div className="py-10 text-center text-sm text-slate-400">Ничего не найдено</div>}
          </div>
        )}

        {/* Kanban view */}
        {view === 'kanban' && (
          <div className="flex gap-3 overflow-x-auto pb-4">
            {PIPELINE.map((stage) => {
              const stagLeads = MOCK.filter((l) => l.status === stage);
              return (
                <div key={stage} className="shrink-0 w-56">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-black px-2 py-1 rounded-full ${STATUS[stage].cls}`}>{STATUS[stage].label}</span>
                    <span className="text-xs text-slate-400 font-bold">{stagLeads.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {stagLeads.map((l) => (
                      <div key={l.id} className="bg-white rounded-xl border border-slate-100 p-3">
                        <p className="text-sm font-bold text-slate-800 mb-0.5">{l.name}</p>
                        <p className="text-xs text-slate-400 mb-2">{l.company}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-proji-primary">{l.value}</span>
                          <span className="text-[10px] text-slate-400">★ {l.score}</span>
                        </div>
                      </div>
                    ))}
                    {stagLeads.length === 0 && <div className="py-6 text-center text-xs text-slate-300 bg-slate-50 rounded-xl">Пусто</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
