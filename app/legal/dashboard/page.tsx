'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scale, FileText, AlertTriangle, CheckCircle2, Clock,
  ChevronDown, X, Search, Filter, ExternalLink, Shield, Gavel,
} from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';
import { adminTasksApi, type AdminTask } from '../../../src/lib/api';

type ContractStatus = 'active' | 'expired' | 'pending' | 'terminated';
type CaseStatus     = 'open' | 'closed' | 'appeal';
type RiskLevel      = 'low' | 'medium' | 'high' | 'critical';

interface Contract {
  id: string; name: string; counterparty: string; type: string;
  status: ContractStatus; signDate: string; expireDate: string; value: string; risk: RiskLevel;
}
interface LegalCase {
  id: string; title: string; type: string; status: CaseStatus; date: string; court?: string; result?: string;
}

const STATUS_CONTRACT: Record<ContractStatus, { label: string; cls: string }> = {
  active:     { label: 'Активен',    cls: 'bg-green-100 text-green-600' },
  expired:    { label: 'Истёк',      cls: 'bg-red-100 text-red-600' },
  pending:    { label: 'На подписи', cls: 'bg-yellow-100 text-yellow-700' },
  terminated: { label: 'Расторгнут', cls: 'bg-slate-100 text-slate-500' },
};
const STATUS_CASE: Record<CaseStatus, { label: string; cls: string }> = {
  open:   { label: 'Открыт',    cls: 'bg-orange-100 text-orange-600' },
  closed: { label: 'Закрыт',    cls: 'bg-green-100 text-green-600' },
  appeal: { label: 'Апелляция', cls: 'bg-purple-100 text-purple-600' },
};
const RISK_COLORS: Record<RiskLevel, string> = {
  low: 'bg-green-100 text-green-600', medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-600', critical: 'bg-red-100 text-red-600',
};

const MOCK_CONTRACTS: Contract[] = [
  { id: '1', name: 'Договор аренды офиса', counterparty: 'ООО "Деловой Центр"', type: 'Аренда', status: 'active', signDate: '01.01.2024', expireDate: '31.12.2024', value: '1 200 000 ₽', risk: 'low' },
  { id: '2', name: 'Рамочный договор поставки', counterparty: 'ЗАО "ТехСнаб"', type: 'Поставка', status: 'active', signDate: '15.03.2024', expireDate: '15.03.2025', value: '5 400 000 ₽', risk: 'medium' },
  { id: '3', name: 'NDA с партнёром', counterparty: 'ИП Смирнов А.В.', type: 'Конфиденциальность', status: 'pending', signDate: '—', expireDate: '—', value: '—', risk: 'low' },
  { id: '4', name: 'Лицензионный договор ПО', counterparty: 'SoftPro LLC', type: 'Лицензия', status: 'expired', signDate: '01.06.2023', expireDate: '01.06.2024', value: '320 000 ₽', risk: 'high' },
  { id: '5', name: 'Договор на оказание услуг', counterparty: 'ООО "МаркетГрупп"', type: 'Услуги', status: 'active', signDate: '10.04.2024', expireDate: '10.04.2025', value: '850 000 ₽', risk: 'low' },
];
const MOCK_CASES: LegalCase[] = [
  { id: '1', title: 'Взыскание задолженности с ООО "Альфа"', type: 'Арбитраж', status: 'open', date: '12.03.2024', court: 'АС г. Москвы' },
  { id: '2', title: 'Трудовой спор — незаконное увольнение', type: 'Трудовой', status: 'appeal', date: '05.01.2024', court: 'Московский горсуд', result: 'Частичное удовлетворение' },
  { id: '3', title: 'Защита товарного знака', type: 'ИС', status: 'closed', date: '20.11.2023', result: 'Выиграно' },
];

export default function LegalDashboardPage() {
  const [contracts]   = useState<Contract[]>(MOCK_CONTRACTS);
  const [cases]       = useState<LegalCase[]>(MOCK_CASES);
  const [adminTasks, setAdminTasks] = useState<AdminTask[]>([]);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilter]   = useState<ContractStatus | 'all'>('all');
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab]   = useState<'contracts' | 'cases' | 'tasks'>('contracts');

  useEffect(() => { setAdminTasks(adminTasksApi.getByDomain('Юридический')); }, []);

  const filtered = contracts.filter((c) => {
    const q = search.toLowerCase();
    return (c.name.toLowerCase().includes(q) || c.counterparty.toLowerCase().includes(q))
      && (filterStatus === 'all' || c.status === filterStatus);
  });

  const stats = {
    active:   contracts.filter((c) => c.status === 'active').length,
    expiring: contracts.filter((c) => c.status === 'expired').length,
    pending:  contracts.filter((c) => c.status === 'pending').length,
    highRisk: contracts.filter((c) => c.risk === 'high' || c.risk === 'critical').length,
  };

  const TAB = (t: string) =>
    `px-4 py-2 text-sm font-bold rounded-xl transition-all ${activeTab === t ? 'bg-proji-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto w-full px-4 md:px-10 pb-16">

        <div className="flex items-center gap-3 mb-2 pt-1">
          <Scale size={20} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">Юридический дашборд</h1>
        </div>
        <p className="text-sm text-slate-400 mb-8">Договоры, судебные дела, задачи юридического отдела</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Активных договоров', value: stats.active,   icon: FileText,      color: 'text-green-500' },
            { label: 'Истёкших',           value: stats.expiring, icon: Clock,         color: 'text-red-500' },
            { label: 'На подписании',       value: stats.pending,  icon: CheckCircle2,  color: 'text-yellow-500' },
            { label: 'Высокий риск',        value: stats.highRisk, icon: AlertTriangle, color: 'text-orange-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button className={TAB('contracts')} onClick={() => setActiveTab('contracts')}>
            <FileText size={13} className="inline mr-1.5" />Договоры
          </button>
          <button className={TAB('cases')} onClick={() => setActiveTab('cases')}>
            <Gavel size={13} className="inline mr-1.5" />Дела
          </button>
          <button className={TAB('tasks')} onClick={() => setActiveTab('tasks')}>
            <Shield size={13} className="inline mr-1.5" />От руководства
            {adminTasks.length > 0 && (
              <span className="ml-1.5 bg-white/30 px-1.5 rounded-full text-[10px] font-black">{adminTasks.length}</span>
            )}
          </button>
        </div>

        {/* Contracts */}
        {activeTab === 'contracts' && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl">
                <Search size={14} className="text-slate-300 shrink-0" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по договорам..."
                  className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 outline-none"
                />
                {search && <button onClick={() => setSearch('')}><X size={13} className="text-slate-300" /></button>}
              </div>
              <div className="relative">
                <button onClick={() => setShowFilter((v) => !v)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 hover:border-proji-primary/40 transition-colors"
                >
                  <Filter size={13} />
                  {filterStatus === 'all' ? 'Все' : STATUS_CONTRACT[filterStatus].label}
                  <ChevronDown size={13} />
                </button>
                <AnimatePresence>
                  {showFilter && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                      className="absolute right-0 z-20 top-full mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden"
                    >
                      {(['all', 'active', 'pending', 'expired', 'terminated'] as const).map((s) => (
                        <button key={s} onClick={() => { setFilter(s); setShowFilter(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-50 ${filterStatus === s ? 'text-proji-primary font-bold' : 'text-slate-700'}`}
                        >
                          {s === 'all' ? 'Все' : STATUS_CONTRACT[s].label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Договор</span><span>Контрагент</span><span>Тип</span><span>Статус</span><span>Срок</span><span>Риск</span>
              </div>
              {filtered.map((c) => (
                <div key={c.id} className="grid grid-cols-1 md:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr] gap-2 md:gap-4 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{c.name}</p>
                    <p className="text-xs text-slate-400">{c.value}</p>
                  </div>
                  <p className="text-sm text-slate-600 self-center">{c.counterparty}</p>
                  <p className="text-xs text-slate-500 self-center">{c.type}</p>
                  <span className={`self-center text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${STATUS_CONTRACT[c.status].cls}`}>
                    {STATUS_CONTRACT[c.status].label}
                  </span>
                  <p className="text-xs text-slate-500 self-center">{c.expireDate}</p>
                  <span className={`self-center text-[10px] font-bold px-2 py-0.5 rounded-full w-fit ${RISK_COLORS[c.risk]}`}>
                    {c.risk === 'low' ? 'Низкий' : c.risk === 'medium' ? 'Средний' : c.risk === 'high' ? 'Высокий' : 'Критич.'}
                  </span>
                </div>
              ))}
              {filtered.length === 0 && <div className="py-10 text-center text-sm text-slate-400">Ничего не найдено</div>}
            </div>
          </>
        )}

        {/* Cases */}
        {activeTab === 'cases' && (
          <div className="flex flex-col gap-3">
            {cases.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <p className="text-sm font-bold text-slate-800">{c.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CASE[c.status].cls}`}>
                    {STATUS_CASE[c.status].label}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{c.type}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  {c.court && <span className="flex items-center gap-1"><ExternalLink size={10} />{c.court}</span>}
                  <span className="flex items-center gap-1"><Clock size={10} />{c.date}</span>
                  {c.result && <span className="text-green-600 font-semibold">{c.result}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Admin tasks */}
        {activeTab === 'tasks' && (
          <div className="flex flex-col gap-3">
            {adminTasks.length === 0 ? (
              <div className="py-12 text-center bg-white rounded-2xl border border-slate-100">
                <Shield size={28} className="text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Нет задач от руководства</p>
              </div>
            ) : adminTasks.map((task) => (
              <div key={task.id} className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-bold text-slate-800">{task.title}</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-600' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {task.priority === 'high' ? 'Срочно' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                </div>
                {task.description && <p className="text-xs text-slate-500 mb-2">{task.description}</p>}
                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                  <span>От: {task.assignedBy}</span>
                  {task.deadline && <span className="text-orange-500">до {task.deadline}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
