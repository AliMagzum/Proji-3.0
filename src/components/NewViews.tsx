import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Target, Users, Settings, Plus, LayoutDashboard, Search, FileText, ArrowRight, CornerRightDown, AlertTriangle, Monitor, Package, CheckCircle, Folder, Activity } from 'lucide-react';

interface GoalsTreeViewProps {
  prevView: string;
}
export const GoalsTreeView = ({ prevView }: GoalsTreeViewProps) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 w-full h-full overflow-y-auto">
      <div className="mb-12 text-left text-slate-800">
        <h2 className="text-4xl font-light text-[#0D47A1] tracking-tighter">Дерево целей</h2>
        <p className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-widest">Стратегические цели и декомпозиция задач</p>
      </div>

      <div className="flex flex-col items-center">
        {/* Main Goal */}
        <div className="bg-[#0D47A1] text-white p-6 rounded-2xl w-96 text-center shadow-lg mb-8 relative">
          <Target className="mx-auto mb-2 opacity-80" size={32} />
          <h3 className="text-xl font-bold mb-2">Глобальная цель: Лидерство на рынке</h3>
          <p className="text-sm opacity-80">Захватить 30% доли рынка в целевом сегменте до Q4</p>
          <div className="absolute -bottom-8 left-1/2 w-0.5 h-8 bg-slate-300"></div>
        </div>

        {/* Sub Goals */}
        <div className="flex gap-16 relative">
          <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-300"></div>
          
          <div className="flex flex-col items-center pt-8 relative">
            <div className="absolute top-0 left-1/2 w-0.5 h-8 bg-slate-300"></div>
            <div className="bg-white border-2 border-blue-200 p-4 rounded-xl w-64 text-center shadow-sm mb-6">
              <h4 className="font-bold text-slate-800 text-sm">Продукт v2.0</h4>
              <p className="text-xs text-slate-500 mt-1">Релиз новой версии</p>
            </div>
            {/* Tasks */}
            <div className="flex flex-col gap-3 w-64">
               <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-3">
                 <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                 <p className="text-xs font-medium text-slate-700 text-left">UX/UI Дизайн приложения</p>
               </div>
               <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                 <p className="text-xs font-medium text-slate-700 text-left">Разработка Backend API</p>
               </div>
            </div>
          </div>

          <div className="flex flex-col items-center pt-8 relative">
            <div className="absolute top-0 left-1/2 w-0.5 h-8 bg-slate-300"></div>
            <div className="bg-white border-2 border-emerald-200 p-4 rounded-xl w-64 text-center shadow-sm mb-6">
              <h4 className="font-bold text-slate-800 text-sm">Маркетинг и PR</h4>
              <p className="text-xs text-slate-500 mt-1">Охват 1 млн пользователей</p>
            </div>
            {/* Tasks */}
            <div className="flex flex-col gap-3 w-64">
               <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                 <p className="text-xs font-medium text-slate-700 text-left">Запуск рекламной кампании</p>
               </div>
               <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg flex items-start gap-3">
                 <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0 mt-0.5"></div>
                 <p className="text-xs font-medium text-slate-700 text-left">Участие в конференции Tech Crunch</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const PagesTreeView = ({ prevView, navigateToView }: { prevView?: string, navigateToView?: any }) => {
  const [hoveredLink, setHoveredLink] = useState<{ x: number, y: number, text: string, desc: string } | null>(null);

  const getWikiDesc = (view: string) => {
    const descriptions: Record<string, string> = {
      'Чат': 'Основной интерфейс взаимодействия с ИИ-ассистентом для решения рабочих задач.',
      'Проекты': 'Реестр всех текущих и завершенных инициатив компании с отслеживанием прогресса.',
      'Управление проектом': 'Детальная настройка, ресурсы и статус управления конкретным проектом.',
      'Доска задач': 'Канбан-доска для визуализации статуса задач в рамках спринта или проекта.',
      'Команда': 'Список сотрудников, их роли, загрузка и распределение по проектам.',
      'OKRs': 'Система постановки и отслеживания амбициозных целей (Objective) и ключевых результатов (Key Results).',
      'Стратегия': 'Глобальное видение развития, долгосрочные цели и приоритеты бизнеса.',
      'Документы': 'Хранилище файлов, справочных материалов и проектной документации.',
      'Дерево страниц': 'Сводный каталог всех разделов системы с краткой справкой (вы находитесь здесь).',
      'Аналитика': 'Дашборды с ключевыми метриками, графиками и бизнес-показателями.',
    };
    return descriptions[view] || `Страница "${view}" предназначена для работы с соответствующими данными в рамках модулей системы.`;
  };

  const structure = [
    {
      module: 'Главная и Общение',
      views: ['Чат', 'Сообщения', 'Обсуждения', 'Прямой эфир']
    },
    {
      module: 'Проекты и Задачи',
      views: ['Проекты', 'Управление проектом', 'Создать проект', 'Задачи', 'Доска задач', 'Задачи проекта', 'Все сценарии', 'Дерево целей']
    },
    {
      module: 'Команда и Ресурсы',
      views: ['Команда', 'Карта стейкхолдеров', 'Профиль сотрудника', 'Ресурсы']
    },
    {
      module: 'Стратегия и TQM',
      views: ['Стратегия', 'OKRs', 'TQM Dashboard', 'TQM DWM Chart', 'Непрерывное улучшение', 'Аудиты качества', 'HADI Циклы', 'Список болей', 'Боли']
    },
    {
      module: 'Документы и Страницы',
      views: ['Документы', 'Регламенты', 'Страницы', 'Дерево страниц', 'Просмотр файла', 'Управленческий Журнал', 'Управленческий Отчет']
    },
    {
      module: 'Аналитика и Рынок',
      views: ['Аналитика', 'Отчеты', 'Конкуренты', 'Процессы', 'Логистика', 'Удовлетворенность клиентов']
    },
    {
      module: 'Специфичные Домены',
      views: ['Журнал оборудования', 'Доска оборудования', 'Архив ремонтов', 'Журнал ремонтов', 'Схемы ТП', 'Журнал проверок', 'Кампании', 'Лиды', 'SEO', 'Юридический', 'Юридический Дашборд']
    }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 w-full h-full overflow-y-auto bg-white font-sans relative">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 pb-2 border-b border-gray-300">
          <h1 className="text-4xl font-serif text-gray-900">Дерево страниц</h1>
          <p className="text-sm text-gray-600 mt-2">Материал из базы знаний Proji</p>
        </div>

        <p className="mb-6 text-sm text-gray-800 leading-relaxed max-w-3xl">
          Это служебная страница-указатель, демонстрирующая полную архитектуру представлений (Views) в системе. 
          Выберите интересующий раздел для быстрой навигации. При наведении курсора на ссылку появится краткая справка о назначении страницы.
        </p>

        <div className="bg-[#f8f9fa] border border-[#a2a9b1] p-5 mb-8 inline-block min-w-[300px]">
          <div className="text-center font-bold mb-3 text-sm">Содержание</div>
          <ul className="text-sm space-y-1">
            {structure.map((mod, idx) => (
              <li key={idx}>
                <button 
                  onClick={() => {
                    document.getElementById(`section-${idx}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-[#0645ad] hover:underline bg-transparent border-none p-0 text-left cursor-pointer"
                >
                  <span className="text-gray-500 mr-2">{idx + 1}</span>
                  {mod.module}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-8 pb-32">
          {structure.map((mod, idx) => (
            <div key={idx} id={`section-${idx}`}>
              <h2 className="text-2xl font-serif text-gray-900 border-b border-gray-300 pb-2 mb-4 flex items-center gap-3">
                {mod.module}
              </h2>
              <div className="columns-1 md:columns-2 lg:columns-3 gap-8">
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-800">
                  {mod.views.map((view, vIdx) => (
                    <li key={vIdx} className="break-inside-avoid">
                      <span 
                        className="text-[#0645ad] hover:underline cursor-pointer"
                        onMouseEnter={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setHoveredLink({
                            x: rect.left,
                            y: rect.bottom + window.scrollY,
                            text: view,
                            desc: getWikiDesc(view)
                          });
                        }}
                        onMouseLeave={() => setHoveredLink(null)}
                        onClick={() => navigateToView && navigateToView(view)}
                      >
                        {view}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {hoveredLink && (
        <div 
          className="fixed z-[500] bg-white border border-gray-300 shadow-xl p-4 w-72 pointer-events-none rounded-sm"
          style={{ 
            left: Math.min(hoveredLink.x, window.innerWidth - 300), 
            top: hoveredLink.y + 5 > window.innerHeight - 150 ? hoveredLink.y - 100 : hoveredLink.y + 5 
          }}
        >
          <div className="font-bold text-gray-900 mb-1 font-serif text-base">{hoveredLink.text}</div>
          <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2 rounded">{hoveredLink.desc}</p>
        </div>
      )}
    </motion.div>
  );
};

export const EmployeeProfileView = ({ navigateToView }: any) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 w-full h-full overflow-y-auto bg-slate-50">
      <div className="mb-8 text-left text-slate-800">
        <h2 className="text-4xl font-light text-[#0D47A1] tracking-tighter">Профиль сотрудника</h2>
        <p className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-widest">Алексей Иванов — Фронтенд-разработчик</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Info & Assets */}
        <div className="space-y-8">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="w-24 h-24 bg-[#0D47A1] rounded-full text-white flex items-center justify-center text-3xl font-bold mb-4">
                АИ
              </div>
              <h3 className="text-xl font-bold text-slate-800">Алексей Иванов</h3>
              <p className="text-sm text-slate-500 mb-6 font-medium">Frontend Developer • Отдел продукта</p>

              <div className="space-y-4">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Загрузка (Capacity):</span>
                   <span className="font-bold text-slate-800">85%</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Успешность (KPI):</span>
                   <span className="font-bold text-emerald-600">92%</span>
                 </div>
              </div>
           </div>

           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
             <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
               <Package size={18} className="text-slate-500" /> Материальные ценности
             </h4>
             <div className="space-y-3">
               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-3">
                   <Monitor size={16} className="text-slate-500" />
                   <span className="text-sm font-medium text-slate-700">Рабочий ноутбук (MacBook Pro)</span>
                 </div>
                 <div className="flex items-center text-xs font-bold text-emerald-600 gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                   <CheckCircle size={14} /> Достаточен
                 </div>
               </div>
               
               <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl border border-red-100">
                 <div className="flex items-center gap-3 relative">
                   {/* Красная точка - нехватка */}
                   <div className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                   <Monitor size={16} className="text-red-500 ml-2" />
                   <span className="text-sm font-medium text-red-800">Лицензии Платформы (Figma Pro)</span>
                 </div>
                 <div className="flex items-center text-xs font-bold text-red-600 gap-1 bg-white px-2 py-1 rounded-md shadow-sm">
                   <AlertTriangle size={14} /> Недостаточно
                 </div>
               </div>

               <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                 <div className="flex items-center gap-3">
                   <Package size={16} className="text-slate-500" />
                   <span className="text-sm font-medium text-slate-700">Оборудование: Монитор 4K</span>
                 </div>
                 <div className="flex items-center text-xs font-bold text-emerald-600 gap-1 bg-emerald-50 px-2 py-1 rounded-md">
                   <CheckCircle size={14} /> Достаточен
                 </div>
               </div>
             </div>
           </div>
        </div>

        {/* Right Col: Task Stack */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 h-full">
             <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
               <Target size={20} className="text-blue-500" /> Стек задач сотрудника
             </h4>
             
             <div className="space-y-4">
                {[
                  { title: 'Реализация страницы Проектов', project: 'Платформа 2.0', status: 'В работе', deadline: 'Завтра', okr: 'Улучшить UX на 20%' },
                  { title: 'Оптимизация рендеринга', project: 'Платформа 2.0', status: 'В работе', deadline: 'До конца недели', okr: 'Стабильность системы' },
                  { title: 'Подключение новых API', project: 'Интеграции', status: 'В очереди', deadline: 'След. неделя', okr: 'Расширение функционала' },
                  { title: 'Исправление багов в Чате', project: 'Поддержка', status: 'В очереди', deadline: 'Без дедлайна', okr: 'Удержание клиентов' }
                ].map((t, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 transition-colors bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-bold text-slate-800 text-sm">{t.title}</h5>
                      <span className={`px-2 py-1 text-[10px] uppercase font-bold rounded-full ${t.status === 'В работе' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                        {t.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                       <span className="flex items-center gap-1"><Folder size={12} className="text-slate-400" /> {t.project}</span>
                       <span>Дедлайн: <strong className="text-slate-700">{t.deadline}</strong></span>
                    </div>
                    <div className="mt-3 text-xs bg-slate-50 p-2 rounded-lg text-slate-600 inline-block font-medium">
                       🎯 Ссылка на OKR: {t.okr}
                    </div>
                  </div>
                ))}
             </div>
           </div>
        </div>

      </div>
    </motion.div>
  );
};

export const ProjectTasksView = ({ project, navigateToView }: any) => {
  const [viewMode, setViewMode] = useState<'list' | 'kanban' | 'gantt' | 'eisenhower'>('list');

  const tasks = [
    { title: 'Аналитика требований', assignee: 'Алексей Иванов', status: 'done', importance: 'high', urgency: 'high', sprint: 'Sprint 1', okr: 'Запуск MVP', kpi: '100% готовность макетов' },
    { title: 'Дизайн архитектуры', assignee: 'Алексей Иванов', status: 'doing', importance: 'high', urgency: 'low', sprint: 'Sprint 1', okr: 'Безопасность', kpi: 'Uptime 99.9%' },
    { title: 'Разработка лендинга', assignee: 'Мария С.', status: 'todo', importance: 'low', urgency: 'high', sprint: 'Sprint 2', okr: 'Увеличение конверсии', kpi: 'CTR +5%' },
    { title: 'Написание тестов', assignee: 'System', status: 'todo', importance: 'low', urgency: 'low', sprint: 'Sprint 2', okr: 'Quality Assurance', kpi: 'Покрытие 80%' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 w-full h-full overflow-y-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4 text-left text-slate-800">
        <div>
          <h2 className="text-4xl font-light text-[#0D47A1] tracking-tighter">Задачи проекта</h2>
          <p className="text-sm text-slate-500 mt-2 font-bold uppercase tracking-widest">{project?.name || 'Выбранный проект'}</p>
        </div>
        
        {/* Toggle views */}
        <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner overflow-x-auto w-full md:w-auto">
          {[
            { id: 'list', label: 'Список', icon: LayoutDashboard },
            { id: 'kanban', label: 'Канбан', icon: LayoutDashboard },
            { id: 'gantt', label: 'Гант', icon: LayoutDashboard },
            { id: 'eisenhower', label: 'Изенхауэр', icon: LayoutDashboard }
          ].map(m => (
            <button 
              key={m.id}
              onClick={() => setViewMode(m.id as any)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg flex-1 md:flex-none transition-all whitespace-nowrap ${viewMode === m.id ? 'bg-white text-[#0D47A1] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 min-h-[500px]">
        
        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            <div className="grid grid-cols-12 gap-4 pb-2 border-b border-slate-200 text-xs font-bold uppercase tracking-widest text-slate-400">
              <div className="col-span-4">Задача</div>
              <div className="col-span-2">Ответственный</div>
              <div className="col-span-2">Статус</div>
              <div className="col-span-4">Цели (OKR & KPI)</div>
            </div>
            {tasks.map((t, i) => (
              <div key={i} className="grid grid-cols-12 gap-4 items-center py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors rounded-lg px-2">
                <div className="col-span-4 font-medium text-slate-800 text-sm truncate">{t.title}</div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                    {t.assignee.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-slate-600 hover:text-blue-600 cursor-pointer" onClick={() => navigateToView && navigateToView('Профиль сотрудника')}>{t.assignee}</span>
                </div>
                <div className="col-span-2">
                  <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${t.status === 'done' ? 'bg-emerald-100 text-emerald-700' : t.status === 'doing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>{t.status}</span>
                </div>
                <div className="col-span-4 text-xs text-slate-500 flex flex-col gap-1">
                  <div className="flex items-center gap-1"><Target size={10} className="text-blue-400"/> {t.okr}</div>
                  <div className="flex items-center gap-1"><Activity size={10} className="text-amber-400"/> {t.kpi}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="flex gap-6 h-full overflow-x-auto pb-4">
             {['todo', 'doing', 'done'].map(status => (
               <div key={status} className="flex-1 min-w-[300px] bg-slate-50 rounded-2xl p-4 flex flex-col">
                 <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">{status === 'todo' ? 'К выполнению' : status === 'doing' ? 'В работе' : 'Готово'}</h4>
                 <div className="flex flex-col gap-3">
                   {tasks.filter(t => t.status === status).map((t, i) => (
                     <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors">
                       <h5 className="font-bold text-slate-800 text-sm mb-2">{t.title}</h5>
                       <div className="text-[10px] bg-slate-100 p-2 rounded-lg text-slate-600 mb-3 space-y-1">
                         <div className="font-medium text-blue-600">OKR: {t.okr}</div>
                         <div className="font-medium text-amber-600">KPI: {t.kpi}</div>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="text-[10px] px-2 py-1 bg-slate-100 uppercase font-bold text-slate-500 rounded-md">{t.sprint}</span>
                         <span className="text-xs font-medium text-slate-600 hover:text-blue-600 cursor-pointer" onClick={() => navigateToView && navigateToView('Профиль сотрудника')}>{t.assignee}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        )}

        {/* Gantt View (Simplified) */}
        {viewMode === 'gantt' && (
          <div className="relative pt-8">
            <div className="absolute top-0 left-48 right-0 flex justify-between px-4 text-xs font-bold text-slate-400 border-b border-slate-200 pb-2">
              <span>Неделя 1</span>
              <span>Неделя 2</span>
              <span>Неделя 3</span>
              <span>Неделя 4</span>
            </div>
            <div className="mt-4 space-y-4">
              {tasks.map((t, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-44 truncate text-sm font-medium text-slate-700">{t.title}</div>
                  <div className="flex-1 bg-slate-100 h-8 rounded-lg relative overflow-hidden">
                    <div className={`absolute top-0 bottom-0 rounded-lg ${t.status === 'done' ? 'bg-emerald-400' : t.status === 'doing' ? 'bg-blue-400' : 'bg-slate-300'}`} style={{ left: `${i * 15}%`, width: `${30 + (i%3)*10}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eisenhower Matrix View */}
        {viewMode === 'eisenhower' && (
          <div className="grid grid-cols-2 gap-4 h-full min-h-[400px]">
            {/* High/High */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-red-600 mb-4 border-b border-red-200 pb-2">Срочно и Важно (Делать)</h4>
              <div className="space-y-2">
                {tasks.filter(t => t.importance === 'high' && t.urgency === 'high').map((t,i) => (
                   <div key={i} className="bg-white p-3 shadow-sm rounded-xl border border-red-100 text-sm font-medium text-slate-800">{t.title}</div>
                ))}
              </div>
            </div>
            {/* High/Low */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-4 border-b border-amber-200 pb-2">Важно, Не срочно (Планировать)</h4>
              <div className="space-y-2">
                {tasks.filter(t => t.importance === 'high' && t.urgency === 'low').map((t,i) => (
                   <div key={i} className="bg-white p-3 shadow-sm rounded-xl border border-amber-100 text-sm font-medium text-slate-800">{t.title}</div>
                ))}
              </div>
            </div>
            {/* Low/High */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 border-b border-blue-200 pb-2">Срочно, Не важно (Делегировать)</h4>
              <div className="space-y-2">
                {tasks.filter(t => t.importance === 'low' && t.urgency === 'high').map((t,i) => (
                   <div key={i} className="bg-white p-3 shadow-sm rounded-xl border border-blue-100 text-sm font-medium text-slate-800 text-left">
                     {t.title}
                     <div className="text-[10px] text-slate-500 mt-1">Ответственный: <span className="font-bold underline cursor-pointer hover:text-blue-600" onClick={() => navigateToView && navigateToView('Профиль сотрудника')}>{t.assignee}</span></div>
                   </div>
                ))}
              </div>
            </div>
            {/* Low/Low */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-4 border-b border-slate-200 pb-2">Не срочно, Не важно (Удалить)</h4>
              <div className="space-y-2">
                {tasks.filter(t => t.importance === 'low' && t.urgency === 'low').map((t,i) => (
                   <div key={i} className="bg-white p-3 shadow-sm rounded-xl border border-slate-100 text-sm font-medium text-slate-800 opacity-60 line-through">{t.title}</div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
};
