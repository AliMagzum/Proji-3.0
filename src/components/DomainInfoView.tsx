import { motion } from 'motion/react';
import { Globe, Coins, Target, Workflow, Activity, Scale, Users, Factory, Settings } from 'lucide-react';
import type { View, BusinessDomain } from '../types';

interface DomainInfoViewProps {
  navigateToView: (view: View) => void;
  onSetCurrentDomain: (d: BusinessDomain) => void;
  onSetShowDomainWelcome: (val: { domain: BusinessDomain; active: boolean }) => void;
  onSetActiveView: (v: View) => void;
}

const DOMAINS: { name: BusinessDomain; why: string; description: string; functions: string[]; icon: React.ComponentType<any> }[] = [
  { name: 'Общий', why: 'Единый центр управления', description: 'Обеспечивает интеграцию всех доменов и общую координацию процессов в реальном времени.', functions: ['Командный центр', 'Глобальный поиск', 'Общие отчеты'], icon: Globe },
  { name: 'Финансы', why: 'Финансовая прозрачность', description: 'Инструменты управления денежными потоками, финансового планирования и аналитики.', functions: ['Бюджетирование', 'Учет активов', 'Прогноз окупаемости'], icon: Coins },
  { name: 'Маркетинг', why: 'Эволюция роста', description: 'Масштабирование влияния бренда через анализ данных и управление кампаниями.', functions: ['SEO Мониторинг', 'Лидогенерация', 'Управление воронкой'], icon: Target },
  { name: 'Стратегия', why: 'Визионерское планирование', description: 'Трансформация целей в реальные дорожные карты развития.', functions: ['OKR Система', 'Анализ рынка', 'Roadmap'], icon: Workflow },
  { name: 'Операции', why: 'Процессное совершенство', description: 'Оптимизация внутренних потоков и безупречная логистика.', functions: ['Ресурсная карта', 'Логистика', 'Качество'], icon: Activity },
  { name: 'Юридический', why: 'Правовая крепость', description: 'Полный контроль над контрактами и интеллектуальной собственностью.', functions: ['Реестр договоров', 'Защита IP', 'Комплаенс'], icon: Scale },
  { name: 'Управление', why: 'Культура лидерства', description: 'Развитие человеческого капитала и управление командой.', functions: ['Командный пульс', 'Мотивация', 'Трекинг навыков'], icon: Users },
  { name: 'Производство', why: 'Индустриальная мощь', description: 'Бескомпромиссный контроль качества и эффективность линий.', functions: ['TQM Dashboards', 'Стандарты', 'Supply Chain'], icon: Factory },
  { name: 'Оборудование', why: 'Техническое превосходство', description: 'Предиктивное обслуживание и точный учет активов.', functions: ['Журнал ремонтов', 'Учет запчастей', 'Схемы'], icon: Settings },
];

export const DomainInfoView = ({ onSetCurrentDomain, onSetShowDomainWelcome, onSetActiveView }: DomainInfoViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen p-12 bg-gradient-to-br from-blue-50/50 via-mint-50/50 to-blue-50/50 bg-[length:400%_400%] animate-bg-flow"
    >
      <div className="max-w-6xl mx-auto space-y-16">
        <div className="text-center space-y-6 py-12">
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tight uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-mint-500 to-blue-600 bg-[length:200%_auto] animate-shimmer">
              Архитектура управления
            </h1>
            <p className="text-sm font-black uppercase tracking-[0.4em] text-blue-600/60">Бизнес домены:</p>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed opacity-80 mt-4">
              Функциональное разделение для достижения максимальной эффективности в каждой области развития.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
          {DOMAINS.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -10 }}
              onClick={() => {
                onSetCurrentDomain(d.name);
                onSetShowDomainWelcome({ domain: d.name, active: true });
                onSetActiveView('DomainLanding');
              }}
              className="group relative bg-white/80 backdrop-blur-md border-[1.5px] border-slate-200/50 p-10 rounded-[3rem] shadow-sm hover:shadow-2xl transition-all cursor-pointer overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-mint-400/0 to-blue-400/0 group-hover:from-blue-500/10 group-hover:via-mint-400/10 group-hover:to-blue-500/10 bg-[length:200%_200%] group-hover:animate-bg-flow transition-all duration-500" />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-start justify-between mb-8">
                  <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-blue-200 group-hover:shadow-lg">
                    <d.icon size={28} />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0 text-right">
                    <p className="text-[8px] font-black uppercase tracking-widest text-blue-500 mb-2">Функционал</p>
                    <div className="flex flex-wrap justify-end gap-1">
                      {d.functions.map((f, j) => (
                        <span key={j} className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-auto">
                  <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight group-hover:text-blue-600 transition-colors uppercase">{d.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 group-hover:text-mint-600 transition-colors">{d.why}</p>
                  <p className="text-[13px] text-slate-500 leading-relaxed font-medium line-clamp-2 group-hover:text-slate-700 transition-colors">{d.description}</p>
                </div>
              </div>

              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-mint-500/20 transition-all duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
