import { motion } from 'motion/react';
import { Shield, Activity, RefreshCw, ClipboardCheck, Target, TrendingUp, Plus, ChevronRight, Calendar, Smile, FileText } from 'lucide-react';

interface ReportItem {
  name: string;
  type: string;
  date: string;
  size: string;
}

export const TQMDashboardView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
      {[
        { label: 'Индекс качества', value: '98.2%', status: 'Stable', icon: Shield },
        { label: 'Процент брака', value: '0.4%', status: 'Improved', icon: Activity },
        { label: 'Цикл PDCA', value: 'Активен', status: 'Cycle 14', icon: RefreshCw },
        { label: 'Сертификация', value: 'ISO 9001', status: 'Valid', icon: ClipboardCheck },
      ].map((m, i) => (
        <div key={i} className="task-card !p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-proji-sidebar rounded-xl text-proji-dark">
              <m.icon size={18} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-proji-success">{m.status}</span>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-proji-secondary mb-1">{m.label}</p>
          <p className="text-xl font-bold text-proji-dark">{m.value}</p>
        </div>
      ))}
    </div>

    <div className="task-card !p-10 mb-8 border-2 border-proji-border">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-xl font-bold mb-1 italic">TQM Philosophy</h3>
          <p className="text-xs text-proji-secondary">Интегрированная система управления качеством во всей организации</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((n, i) => (
            <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs ${i === 0 ? 'bg-proji-dark' : i === 1 ? 'bg-proji-amber' : 'bg-proji-success'}`}>{n}</div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-proji-sidebar rounded-lg"><Target size={16} className="text-proji-dark" /></div>
            <div>
              <p className="text-sm font-bold tracking-tight">Фокус на клиента</p>
              <p className="text-[11px] text-proji-secondary mt-1">Качество определяется ожиданиями и потребностями конечного потребителя.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-proji-sidebar rounded-lg"><TrendingUp size={16} className="text-proji-dark" /></div>
            <div>
              <p className="text-sm font-bold tracking-tight">Постоянное совершенствование</p>
              <p className="text-[11px] text-proji-secondary mt-1">Непрерывный поиск возможностей для улучшения каждого аспекта деятельности.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const ContinuousImprovementView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
    <div className="flex justify-between items-center mb-12">
      <div>
        <h2 className="text-3xl font-light text-proji-dark">Кайдзен & PDCA</h2>
        <p className="text-sm text-proji-secondary mt-1">Циклический процесс постоянного улучшения качества</p>
      </div>
      <button className="flex items-center gap-2 px-4 py-2 bg-proji-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">
        <Plus size={14} /> Новый цикл
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
      {[
        { phase: 'Plan', desc: 'Планирование изменений', active: true },
        { phase: 'Do', desc: 'Внедрение (пилот)', active: false },
        { phase: 'Check', desc: 'Анализ результатов', active: false },
        { phase: 'Act', desc: 'Стандартизация', active: false },
      ].map((p, i) => (
        <div key={i} className={`p-6 rounded-3xl border flex flex-col items-center text-center transition-all ${p.active ? 'bg-proji-sidebar text-proji-dark border-proji-border' : 'bg-white opacity-40'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-4 ${p.active ? 'bg-proji-dark text-white' : 'bg-proji-border text-proji-secondary'}`}>{i + 1}</div>
          <p className="font-bold uppercase tracking-widest text-[11px] mb-2">{p.phase}</p>
          <p className="text-[10px] font-medium leading-tight">{p.desc}</p>
        </div>
      ))}
    </div>

    <h3 className="text-xs uppercase font-black tracking-[0.2em] mb-6 text-proji-secondary">Активные инициативы по улучшению</h3>
    <div className="space-y-4">
      {[
        { name: 'Оптимизация времени отклика поддержки', owner: 'Денис М.', progress: 65, phase: 'Plan' },
        { name: 'Автоматизация входного контроля материалов', owner: 'Игорь С.', progress: 20, phase: 'Do' },
        { name: 'Снижение энергопотребления в цеху №3', owner: 'Мария А.', progress: 10, phase: 'Plan' },
      ].map((init, i) => (
        <div key={i} className="task-card flex items-center justify-between group hover:border-proji-dark transition-all">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-proji-sidebar flex items-center justify-center text-proji-dark">
              <RefreshCw size={18} className="animate-spin-slow" />
            </div>
            <div>
              <p className="font-bold text-sm tracking-tight">{init.name}</p>
              <p className="text-[10px] text-proji-secondary uppercase font-bold tracking-widest">Лид: {init.owner} • Фаза: {init.phase}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-proji-dark mb-1">{init.progress}%</p>
              <div className="w-24 h-1 bg-proji-border rounded-full overflow-hidden">
                <div className="h-full bg-proji-dark" style={{ width: `${init.progress}%` }} />
              </div>
            </div>
            <button className="p-2 border border-proji-border rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export const QualityAuditsView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
    <div className="flex justify-between items-center mb-12">
      <h2 className="text-3xl font-light text-proji-dark">Аудиты качества</h2>
      <div className="flex gap-3">
        <button className="px-4 py-2 border border-proji-border rounded-xl text-[10px] font-bold uppercase tracking-widest hover:border-proji-dark transition-all">График аудитов</button>
        <button className="px-4 py-2 bg-proji-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-widest">Запустить проверку</button>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {[
        { label: 'Пройдено за год', value: '18', total: '24', icon: ClipboardCheck },
        { label: 'Критические несоответствия', value: '0', total: 'Low Risk', icon: Shield },
        { label: 'Срок ISO ре-сертификации', value: '142', total: 'дней осталось', icon: Calendar },
      ].map((stat, i) => (
        <div key={i} className="task-card text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-proji-sidebar rounded-2xl flex items-center justify-center text-proji-dark mb-4">
            <stat.icon size={20} />
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-proji-secondary mb-1">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-proji-dark">{stat.value}</span>
            <span className="text-[10px] font-medium text-proji-secondary uppercase tracking-widest">{stat.total}</span>
          </div>
        </div>
      ))}
    </div>

    <h3 className="text-xs uppercase font-black tracking-[0.2em] mb-6 text-proji-secondary">Журнал проверок</h3>
    <div className="space-y-0.5 border border-proji-border rounded-3xl overflow-hidden shadow-sm">
      {[
        { name: 'Внутренний аудит производства (Цех А)', date: '21 апр 2024', status: 'Passed', score: '98/100', lead: 'Александр К.' },
        { name: 'Проверка поставщика "Металл-Пром"', date: '14 апр 2024', status: 'Warning', score: '72/100', lead: 'Елена В.' },
        { name: 'Аудит системы документооборота', date: '02 апр 2024', status: 'Passed', score: '100/100', lead: 'Дмитрий Л.' },
        { name: 'Санитарно-эпидемиологический контроль', date: '28 мар 2024', status: 'Passed', score: '94/100', lead: 'Ольга Р.' },
      ].map((audit, i) => (
        <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white hover:bg-proji-sidebar/40 transition-colors border-b border-proji-border last:border-0 group cursor-pointer">
          <div className="flex items-center gap-4 flex-1 mb-4 md:mb-0">
            <div className={`w-2 h-10 rounded-full ${audit.status === 'Passed' ? 'bg-proji-success' : 'bg-proji-amber'}`} />
            <div>
              <p className="font-bold text-sm tracking-tight text-proji-dark">{audit.name}</p>
              <p className="text-[10px] text-proji-secondary uppercase font-bold tracking-widest">{audit.date} • Лид: {audit.lead}</p>
            </div>
          </div>
          <div className="flex items-center gap-10">
            <div className="text-right">
              <p className="text-[9px] uppercase font-bold text-proji-secondary mb-1">Оценка</p>
              <p className="font-mono text-proji-dark font-bold">{audit.score}</p>
            </div>
            <div className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${audit.status === 'Passed' ? 'bg-proji-success/5 text-proji-success border-proji-success/20' : 'bg-proji-amber/5 text-proji-amber border-proji-amber/20'}`}>
              {audit.status}
            </div>
            <ChevronRight size={16} className="text-proji-border opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

export const CustomerSatisfactionView = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
    <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 gap-6 text-center md:text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-light text-proji-dark">Голос клиента</h2>
        <p className="text-sm text-proji-secondary mt-1">Мониторинг удовлетворенности и обратной связи</p>
      </div>
      <div className="p-4 bg-proji-sidebar rounded-2xl flex items-center gap-4 w-full md:w-auto justify-center">
        <div className="text-right">
          <p className="text-[9px] font-bold uppercase text-proji-secondary leading-none mb-1">Текущий Net Promoter Score</p>
          <p className="text-xl font-bold text-proji-dark">NPS 72</p>
        </div>
        <div className="w-12 h-12 rounded-full border-4 border-proji-success flex items-center justify-center text-proji-success">
          <Smile size={24} />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
      <div className="task-card !p-8 border-2 border-proji-border">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary mb-8">Метрики лояльности</h3>
        <div className="space-y-10">
          {[
            { label: 'Customer Satisfaction Score (CSAT)', value: '4.8 / 5.0', progress: 96, color: 'bg-proji-dark' },
            { label: 'Customer Effort Score (CES)', value: '1.2 / 7.0', progress: 17, color: 'bg-proji-amber' },
            { label: 'Churn Rate (Отток)', value: '0.8%', progress: 8, color: 'bg-proji-success' },
          ].map((m, i) => (
            <div key={i}>
              <div className="flex justify-between items-baseline mb-3">
                <p className="text-xs font-bold tracking-tight text-proji-dark">{m.label}</p>
                <p className="text-sm font-bold text-proji-dark">{m.value}</p>
              </div>
              <div className="w-full h-1.5 bg-proji-border rounded-full overflow-hidden">
                <div className={`h-full ${m.color}`} style={{ width: `${m.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="task-card !p-8 bg-proji-dark text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-8">Последние отзывы (Sentiment)</h3>
        <div className="space-y-6">
          {[
            { text: 'Интерфейс стал значительно быстрее и удобнее. Работа ИИ впечатляет.', user: 'ООО Спектр', positive: true },
            { text: 'Хотелось бы более детальных отчетов по логистике в мобильном приложении.', user: 'Артем П.', positive: false },
            { text: 'Самый надежный партнер для нашего бизнеса уже 3 года.', user: 'Global Tech', positive: true },
          ].map((feedback, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 italic">
              <p className="text-[11px] leading-relaxed mb-3">«{feedback.text}»</p>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">от {feedback.user}</span>
                <div className={`w-1.5 h-1.5 rounded-full ${feedback.positive ? 'bg-proji-success' : 'bg-proji-amber'}`} />
              </div>
            </div>
          ))}
        </div>
        <button className="mt-8 w-full py-3 bg-white text-proji-dark rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-proji-amber transition-colors shadow-lg">Анализ всей базы (AI)</button>
      </div>
    </div>
  </motion.div>
);

export const TQMDWMChartView = ({ reports }: { reports: ReportItem[] }) => (
  <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="p-12 max-w-6xl mx-auto w-full h-full overflow-y-auto scrollbar-hide pb-32">
    <div className="flex justify-between items-end mb-12">
      <div>
        <h2 className="text-4xl font-light tracking-tight text-proji-dark">DWM: Actual vs Planned</h2>
        <p className="text-sm text-proji-secondary mt-2 font-medium">Daily Work Management Performance Verification</p>
      </div>
      <button className="text-xs font-bold uppercase tracking-widest border border-proji-border px-4 py-2 rounded-lg hover:border-proji-dark transition-all">Экспорт PDF</button>
    </div>
    <div className="space-y-1">
      {reports.map((report, i) => (
        <div key={i} className="flex items-center justify-between p-4 hover:bg-proji-sidebar rounded-xl group transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <FileText size={18} className="text-proji-secondary group-hover:text-proji-amber" />
            <div>
              <p className="text-sm font-bold">{report.name}</p>
              <p className="text-[10px] text-proji-secondary uppercase tracking-widest">{report.type} • {report.date}</p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-proji-secondary">{report.size}</span>
        </div>
      ))}
    </div>
  </motion.div>
);
