/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Mic, Send, Mail, CheckCircle2, FileText, Users, ChevronRight, ChevronLeft, X, LayoutDashboard, BarChart3, Target, Workflow, TrendingUp, Settings, Shield, Archive, Search, Share2, Link as LinkIcon, Sparkles, UserPlus, FilePlus, Code2, Plus, Globe, Package, Truck, Activity, History, Monitor, Moon, Sun, User, Calendar, HardDrive, Layers, Zap, Save, Terminal, Cpu, Braces, RotateCcw, Dna, MessageSquare, Database, Bell, Award, Trophy, Coins, ClipboardCheck, Smile, RefreshCw, Circle, Briefcase, Scale, AlertTriangle, FileSignature, Gavel, Clock, FileCheck, Settings2, Factory, FileDown, BookOpen, Layout, Maximize2, AlertCircle, Edit, Wind, Scissors, ShieldCheck, ChevronUp, ChevronDown, Info, ArrowUp, Folder, PenTool } from 'lucide-react';
import { processBusinessCommand } from './lib/gemini';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { GoalsTreeView, PagesTreeView, EmployeeProfileView, ProjectTasksView } from './components/NewViews';
import type { Message, Task, View, Project, BusinessDomain, Scenario, Theme } from './types';
import { domainConsultants, domainViewData, domainScenarios, domainNavItems } from './data/domainData';
import { getChipColor, renderHighlightedText, verifyDocumentCriteria, parseOptions } from './lib/helpers';
import { CollapsibleText } from './components/ui/CollapsibleText';
import { ChartCard } from './components/ui/ChartCard';
import { BottleneckDashboard } from './components/ui/BottleneckDashboard';
import { ContextSidebar } from './components/ContextSidebar';
import { DomainInfoView } from './components/DomainInfoView';
import { TQMDashboardView, ContinuousImprovementView, QualityAuditsView, CustomerSatisfactionView, TQMDWMChartView } from './views/TQMViews';

export default function App() {
  const [allTasks, setAllTasks] = useState<Task[]>([
    { id: '1', title: 'Отчет по маркетингу', status: 'pending', relatedToType: 'Проект', relatedToName: 'Marketing Q2' },
    { id: '2', title: 'Встреча: Strategy Sync', status: 'completed', relatedToType: 'Общий' },
    { id: 'journal-1', title: 'Доработать договор аренды', status: 'pending', relatedToType: 'Юридический', relatedToName: 'Аренда Офиса' },
    { id: 'journal-2', title: 'Подготовить форму отчетности KPI', status: 'pending', relatedToType: 'Документ', relatedToName: 'KPI Template' },
    { id: 'journal-3', title: 'Запустить TikTok креативы', status: 'pending', relatedToType: 'Проект', relatedToName: 'Gen Z Campaign' },
  ]);

  const activeTasks = allTasks.filter(t => t.status === 'pending');

  const [allDocs, setAllDocs] = useState<Record<BusinessDomain, any[]>>(
    Object.keys(domainViewData).reduce((acc, key) => ({
      ...acc,
      [key]: domainViewData[key as BusinessDomain].documents
    }), {} as any)
  );

  const [navItems, setNavItems] = useState<Record<BusinessDomain, Record<string, string[]>>>(domainNavItems);
  const [activeView, setActiveView] = useState<View>('Чат');
  const [prevView, setPrevView] = useState<View>('Чат');
  const [currentDomain, setCurrentDomain] = useState<BusinessDomain>('Общий');
  const PageBackButton = (_props: any) => null;

  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newPagePrompt, setNewPagePrompt] = useState('');
  const [customPageContent, setCustomPageContent] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedKanbanTask, setSelectedKanbanTask] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);
  const [hoveredStepId, setHoveredStepId] = useState<string | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [expandedFramework, setExpandedFramework] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const [processStarted, setProcessStarted] = useState(false);
  
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddType, setQuickAddType] = useState<string>('заметка');
  const [quickAddCustomType, setQuickAddCustomType] = useState<string>('');
  const [quickAddText, setQuickAddText] = useState<string>('');
  const [openDropdown, setOpenDropdown] = useState<'domains' | 'functions' | null>(null);

  const popularActions = [
    { label: 'Создать бизнес-план', icon: FileText, action: 'Сделай детальный бизнес-план для моего проекта' },
    { label: 'Анализ конкурентов', icon: Search, action: 'Проведи анализ основных конкурентов в нише' },
    { label: 'Финансовый прогноз', icon: TrendingUp, action: 'Подготовь финансовый прогноз на следующий квартал' },
  ];

  const domainsList = ['Финансы', 'Маркетинг', 'Стратегия', 'Операции', 'Юридический', 'Управление', 'Производство'];
  const functionsList = ['Сгенерировать отчет', 'Найти узкие места', 'Подготовь презентацию', 'Оптимизируй процессы', 'Разработай документ', 'Проведи аудит'];

  const [projects, setProjects] = useState<Project[]>([
    { 
      id: 'p1', 
      name: 'Модернизация цеха №4', 
      description: 'Масштабное обновление производственных линий с интеграцией промышленного интернета вещей (IIoT).',
      status: 'In Progress', 
      framework: 'Agile', 
      startDate: '2024-01-15',
      deadline: '2024-06-30', 
      progress: 65, 
      team: ['Иван К.', 'Анна С.', 'Олег Д.'],
      budget: '$2,500,000',
      spent: '$1,650,000',
      taskObjective: 'Замена устаревшего оборудования на линии А1 на автоматизированные комплексы с поддержкой протоколов IIoT.',
      strategicGoal: 'Снижение себестоимости единицы продукции на 15% за счет оптимизации энергопотребления и сокращения брака.',
      originResearch: 'Аудит эффективности 2023 года выявил потерю 12% времени из-за простоев старой линии. Опрос инженеров подтвердил потребность в цифровом мониторинге.',
      riskLevel: 'Medium',
      priority: 'P0',
      stakeholder: 'Технический Директор',
      roi: '22% Yearly',
      milestones: ['Закупка оборудования', 'Монтаж линии А1', 'Тестирование софта'],
      tasks: [
        { title: 'Калибровка датчиков', status: 'done' },
        { title: 'Настройка шлюза MQTT', status: 'doing' },
        { title: 'Обучение персонала', status: 'todo' }
      ],
      reports: [
        { name: 'Аудит безопасности А1', date: '12.04.2024' },
        { name: 'Промежуточный фин. отчет', date: '28.04.2024' }
      ],
      complianceStatus: 'Verified',
      resourceUtilization: 88,
      qualityMetric: '99.8% Pass Rate',
      scalabilityIndex: 9.5,
      createdBy: 'Михаил Л.',
      lastEditedBy: 'Анна С.',
      frameworks: {
        swot: {
          strengths: ['Высокая автоматизация', 'Собственная команда инженеров'],
          weaknesses: ['Устаревшая энергосеть'],
          opportunities: ['Гранты на цифровизацию'],
          threats: ['Задержки поставок чипов'],
          authors: ['Михаил Л.', 'Артем К.']
        },
        stakeholders: [
          { name: 'Ген. Директор', role: 'Спонсор', influence: 'High', interest: 'High' },
          { name: 'Начальник цеха', role: 'Пользователь', influence: 'Medium', interest: 'High' }
        ],
        painPoints: [
          { point: 'Низкая точность данных', impact: 'Major', status: 'In Analysis' }
        ]
      }
    },
    { 
      id: 'p2', 
      name: 'ERP Трансформация', 
      description: 'Миграция всех бизнес-процессов на новую платформу управления ресурсами.',
      status: 'On Hold', 
      framework: 'Waterfall', 
      startDate: '2024-03-01',
      deadline: '2024-12-15', 
      progress: 15, 
      team: ['Михаил Л.', 'Дмитрий В.'],
      budget: '$1,200,000',
      spent: '$180,000',
      taskObjective: 'Полный переход с разрозненных Excel-таблиц на единую архитектуру SAP Cloud.',
      strategicGoal: 'Обеспечение прозрачности цепочки поставок и сокращение времени закрытия финансового периода с 10 до 3 дней.',
      originResearch: 'Strategic Gap Analysis показал критические ошибки в учете остатков на складах. 30% заказов задерживались из-за отсутствия синхронизации данных.',
      riskLevel: 'High',
      priority: 'P1',
      stakeholder: 'Финансовый Департамент',
      roi: '15% Efficiency Gain',
      milestones: ['Audit Phase', 'Data Migration', 'UAT Testing'],
      tasks: [
        { title: 'Маппинг данных', status: 'doing' },
        { title: 'Интервью с владельцами процессов', status: 'done' }
      ],
      reports: [{ name: 'Анализ рисков миграции', date: '05.05.2024' }],
      complianceStatus: 'Pending',
      resourceUtilization: 45,
      qualityMetric: 'N/A',
      scalabilityIndex: 10,
      createdBy: 'Сергей П.',
      lastEditedBy: 'Сергей П.',
      frameworks: {
        swot: {
          strengths: ['Поддержка акционеров'],
          weaknesses: ['Сопротивление изменениям'],
          opportunities: ['AI Аналитика'],
          threats: ['Санкционные риски ПО'],
          authors: ['Сергей П.']
        },
        stakeholders: [
          { name: 'Акционеры', role: 'Инвесторы', influence: 'High', interest: 'Low' }
        ],
        painPoints: [
          { point: 'Дублирование заказов', impact: 'Critical', status: 'Targeted' }
        ]
      }
    },
    { 
      id: 'p3', 
      name: 'Web-платформа Proji', 
      description: 'Разработка новой клиентской части платформы с использованием React 18 и Tailwind CSS.',
      status: 'In Progress', 
      framework: 'Scrum', 
      startDate: '2024-04-01',
      deadline: '2024-08-15', 
      progress: 40, 
      team: ['Алексей В.', 'Елена М.', 'Игорь С.'],
      budget: '$450,000',
      spent: '$120,000',
      taskObjective: 'Создание интуитивно понятного интерфейса для управления крупными индустриальными проектами в реальном времени.',
      strategicGoal: 'Увеличение NPS платформы на 40 пунктов и снижение времени на онбординг новых пользователей на 50%.',
      originResearch: 'UX-лаборатория выявила, что пользователи тратят до 20 минут в день на поиск нужного отчета. Анализ конкурентов показал отсутствие адаптивности в текущих решениях.',
      riskLevel: 'Low',
      priority: 'P1',
      stakeholder: 'Head of Product',
      roi: '40% UX Conversion',
      milestones: ['Design Freeze', 'MVP Release', 'Performance Audit'],
      tasks: [
        { title: 'Верстка дашборда', status: 'done' },
        { title: 'Интеграция API', status: 'doing' },
        { title: 'Unit-тестирование', status: 'todo' }
      ],
      reports: [{ name: 'Lighthouse Score Audit', date: '25.04.2024' }],
      complianceStatus: 'Verified',
      resourceUtilization: 95,
      qualityMetric: '98% Code Coverage',
      scalabilityIndex: 9.8,
      createdBy: 'Алексей В.',
      lastEditedBy: 'Елена М.',
      frameworks: {
        swot: {
          strengths: ['Современный стек', 'Опытные фронтенд-разработчики'],
          weaknesses: ['Сжатые сроки по дизайну'],
          opportunities: ['Мобильное приложение (PWA)'],
          threats: ['Изменения в API смежных систем'],
          authors: ['Алексей В.', 'Максим Р.']
        },
        stakeholders: [
          { name: 'Marketing Lead', role: 'Заказчик', influence: 'Medium', interest: 'High' }
        ],
        painPoints: [
          { point: 'Медленная загрузка страниц', impact: 'Major', status: 'Resolved' }
        ]
      }
    }
  ]);
  const [newProject, setNewProject] = useState<Partial<Project>>({
    framework: 'Agile',
    status: 'In Progress',
    progress: 0,
    team: []
  });
  const [equipmentLog, setEquipmentLog] = useState([
    { 
      id: 'eq-1', 
      name: 'Конвейерная лента B2', 
      status: 'Работает', 
      nextService: '2024-05-15', 
      health: 92,
      maintenanceSchedule: ['15.05.2024', '15.08.2024', '15.11.2024'],
      docLink: 'https://example.com/docs/b2-conveyor'
    },
    { 
      id: 'eq-2', 
      name: 'Роботизированная рука R1', 
      status: 'Требует обслуживания', 
      nextService: '2024-05-03', 
      health: 45,
      maintenanceSchedule: ['03.05.2024', '03.07.2024', '03.09.2024'],
      docLink: 'https://example.com/docs/r1-robot'
    },
    { 
      id: 'eq-3', 
      name: 'Охладительная установка C4', 
      status: 'Работает', 
      nextService: '2024-06-01', 
      health: 98,
      maintenanceSchedule: ['01.06.2024', '01.12.2024'],
      docLink: 'https://example.com/docs/c4-cooling'
    },
    { 
      id: 'eq-4', 
      name: 'Печь индукционная P7', 
      status: 'В ремонте', 
      nextService: '2024-05-02', 
      health: 12,
      maintenanceSchedule: ['02.05.2024', '10.05.2024'],
      docLink: 'https://example.com/docs/p7-furnace'
    },
  ]);
  const [inspectionLogs, setInspectionLogs] = useState([
    { id: 'insp-1', date: '2024-05-01', inspector: 'Иван Петров', result: 'Норма', comment: 'Лента B2 проверена, ролики в порядке.' },
    { id: 'insp-2', date: '2024-05-02', inspector: 'Система ИИ', result: 'Критично', comment: 'R1 показывает вибрацию выше нормы 2.4g.' },
  ]);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [isFileAiOpen, setIsFileAiOpen] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [isEditingDoc, setIsEditingDoc] = useState(false);
  const [editedContent, setEditedContent] = useState<string | string[] | any>('');
  
  const [chatHistory, setChatHistory] = useState<{ id: string; date: Date; domain: BusinessDomain; messages: Message[] }[]>([]);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  
  const startNewChat = () => {
    if (allMessages.length > 0) {
      setChatHistory(prev => [
        {
          id: Date.now().toString(),
          date: new Date(),
          domain: currentDomain,
          messages: [...allMessages]
        },
        ...prev
      ]);
      setAllMessages([]);
    }
  };
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentThought, setCurrentThought] = useState('');
  const [pendingDraft, setPendingDraft] = useState<{ title: string, content: string, reasoning: string[] } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const thoughtSteps = [
    'Идентификация запроса на бизнес-документацию...',
    'Сбор данных из текущего контекста и метаданных...',
    'Применение инструкций бизнес-архитектуры Proji...',
    'Верификация по критериям отраслевых стандартов...',
    'Синтез структурированного контента...',
    'Валидация целостности и связности данных...'
  ];
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTopMenu, setShowTopMenu] = useState(true);
  const [showBottomBar, setShowBottomBar] = useState(false);
  const [isCoreExpanded, setIsCoreExpanded] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDomainDropdown, setShowDomainDropdown] = useState(false);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [activeSidePanel, setActiveSidePanel] = useState<string | null>(null);
  const [panelPos, setPanelPos] = useState({ top: 0 });
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const sidebarRef = useRef<HTMLElement>(null);
  const [isAiMinimized, setIsAiMinimized] = useState(false);
  const [showDomainWelcome, setShowDomainWelcome] = useState<{ domain: BusinessDomain; active: boolean }>({ domain: 'Общий', active: false });

  const domainWelcomeData: Record<BusinessDomain, { description: string, jtbd: string[], functions: { label: string, view: View }[] }> = {
    'Общий': {
      description: 'Центральный хаб управления вашей бизнес-экосистемой.',
      jtbd: ['Координация команд', 'Быстрый доступ к знаниям', 'Глобальный мониторинг'],
      functions: [{ label: 'Открыть Чат', view: 'Чат' }, { label: 'Задачи', view: 'Все сценарии' }]
    },
    'Финансы': {
      description: 'Управление капиталом, ликвидностью и финансовой отчетностью.',
      jtbd: ['Контроль ДДС', 'Анализ прибыльности', 'Налоговое планирование'],
      functions: [{ label: 'Аналитика', view: 'Аналитика' }, { label: 'Отчеты', view: 'Отчеты' }]
    },
    'Маркетинг': {
      description: 'Масштабирование влияния и привлечение клиентов.',
      jtbd: ['Лидогенерация', 'Управление брендом', 'Анализ конкурентов'],
      functions: [{ label: 'Кампании', view: 'Кампании' }, { label: 'SEO', view: 'SEO' }]
    },
    'Стратегия': {
      description: 'Проектирование будущего бизнеса.',
      jtbd: ['Постановка OKR', 'Roadmapping', 'Сценарное планирование'],
      functions: [{ label: 'Дорожная карта', view: 'Дорожная карта' }, { label: 'OKRs', view: 'OKRs' }]
    },
    'Операции': {
      description: 'Оптимизация внутренних потоков и ресурсов.',
      jtbd: ['Управление процессами', 'Логистика', 'Контроль ресурсов'],
      functions: [{ label: 'Процессы', view: 'Процессы' }, { label: 'Логистика', view: 'Логистика' }]
    },
    'Юридический': {
      description: 'Правовая безопасность и защита активов.',
      jtbd: ['Договорная работа', 'Защита IP', 'Комплаенс'],
      functions: [{ label: 'Юридический Дашборд', view: 'Юридический Дашборд' }, { label: 'Документы', view: 'Документы' }]
    },
    'Управление': {
      description: 'Развитие человеческого капитала.',
      jtbd: ['Найм и онбординг', 'Оценка персонала', 'Культура'],
      functions: [{ label: 'Команда', view: 'Команда' }, { label: 'Обсуждения', view: 'Обсуждения' }]
    },
    'Производство': {
      description: 'Эффективность и качество продукта.',
      jtbd: ['Загрузка линий', 'Контроль TQM', 'Бережливое производство'],
      functions: [{ label: 'TQM Dashboard', view: 'TQM Dashboard' }, { label: 'Схемы ТП', view: 'Схемы ТП' }]
    },
    'Оборудование': {
      description: 'Техническая готовность и обслуживание.',
      jtbd: ['Предиктивный ремонт', 'Учет запчастей', 'Технадзор'],
      functions: [{ label: 'Журнал ремонтов', view: 'Журнал ремонтов' }, { label: 'Архив ремонтов', view: 'Архив ремонтов' }]
    }
  };

  const DomainWelcomeView = ({ domain, onClose, navigateToView }: { domain: BusinessDomain, onClose: () => void, navigateToView: (v: View) => void }) => {
    const data = domainWelcomeData[domain];
    const scenarios = domainScenarios[domain] || [];

    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="p-8 max-w-5xl mx-auto space-y-12 pb-32"
      >
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="space-y-0">
             <h1 className="text-7xl font-black tracking-tight uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">
               {domain}
             </h1>
             <p className="text-sm font-black uppercase tracking-[0.4em] text-blue-500/60 mt-2">домен</p>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3 max-w-xl">
             <div className="p-2 bg-blue-500 rounded-lg text-white">
                <Info size={16} />
             </div>
             <p className="text-xs text-blue-700 font-bold text-left italic leading-relaxed">
               Подсказка: Этот домен объединяет инструменты и аналитику для максимально точного управления в области {domain.toLowerCase()}. Используйте AI-консультанта для генерации специфических отчетов.
             </p>
          </div>

          <p className="text-lg text-proji-secondary font-medium max-w-2xl leading-relaxed mt-6">{data.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
           <div className="bg-white p-8 rounded-3xl border border-proji-border shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-proji-primary">Основные задачи (JTBD)</h3>
              </div>
              <div className="space-y-3">
                 {data.jtbd.map((j, i) => (
                    <div key={i} className="flex items-start gap-4 p-4 bg-proji-sidebar rounded-2xl border border-transparent transition-all hover:border-proji-border group">
                       <CheckCircle2 size={18} className="text-proji-primary mt-0.5 shrink-0" />
                       <p className="text-sm font-bold text-proji-dark leading-snug">{j}</p>
                    </div>
                 ))}
              </div>
           </div>

           <div className="bg-white p-8 rounded-3xl border border-proji-border shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-proji-primary">Приступить к функциям</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                 {data.functions.map((f, i) => (
                    <button 
                      key={i} 
                      onClick={() => { navigateToView(f.view); onClose(); }}
                      className="group flex items-center justify-between p-5 bg-proji-sidebar border border-transparent rounded-2xl hover:bg-proji-primary hover:text-white hover:border-proji-primary transition-all text-left active:scale-95"
                    >
                       <div className="flex flex-col">
                          <span className="text-[14px] font-black uppercase tracking-wider">{f.label}</span>
                       </div>
                       <ChevronRight size={20} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                    </button>
                 ))}
              </div>
           </div>
        </div>

        {/* AI Scenarios Section */}
        <div className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="h-px flex-1 bg-slate-200" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Сценарии AI-консультанта</h3>
             <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             {scenarios.map((s, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ y: -5 }}
                  className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer group"
                >
                   <div className="flex items-center gap-3 mb-4">
                      <div className="p-3 bg-white rounded-xl text-blue-500 shadow-sm group-hover:bg-blue-500 group-hover:text-white transition-all">
                         <s.icon size={20} />
                      </div>
                      <h4 className="font-black text-slate-800 uppercase text-xs tracking-wider">{s.title}</h4>
                   </div>
                   <p className="text-xs text-slate-500 font-medium leading-relaxed italic line-clamp-3">«{s.text}»</p>
                </motion.div>
             ))}
          </div>

          <div className="flex justify-center pt-8">
             <button 
               onClick={onClose}
               className="px-10 py-5 bg-black text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-blue-600 transition-all shadow-xl active:scale-95"
             >
               Начать работу в домене
             </button>
          </div>
        </div>
      </motion.div>
    );
  };
  const [theme, setTheme] = useState<Theme>('light');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter messages based on current domain
  const messages = allMessages.filter(m => m.domain === currentDomain || (!m.domain && m.id === 'welcome'));

  useEffect(() => {
    const root = window.document.documentElement;
    const updateTheme = () => {
      root.classList.remove('light', 'dark');
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
      }
    };

    updateTheme();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => updateTheme();
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const scenarios = domainScenarios[currentDomain];
  const dynamicNavItems = navItems[currentDomain];

  const navigateToView = (view: View) => {
    setPrevView(activeView);
    setActiveView(view);
    // If moving from Chat to a view, or between views, auto-minimize AI if it's the same content
    if (view === 'Чат') {
      setIsAiMinimized(true);
    }
  };

  const handleCreatePage = () => {
    if (!newPagePrompt.trim()) return;
    
    const pageName = newPagePrompt.split(' ').slice(0, 2).join(' ') || 'Новая страница';
    const categoryName = 'Интерфейс: ' + (newPagePrompt.split(' ')[0] || 'AI');
    
    setNavItems(prev => {
      const currentDomainNav = { ...prev[currentDomain] };
      if (!currentDomainNav[categoryName]) {
        currentDomainNav[categoryName] = [];
      }
      currentDomainNav[categoryName] = [...currentDomainNav[categoryName], pageName];
      return { ...prev, [currentDomain]: currentDomainNav };
    });
    
    setCustomPageContent(prev => ({ ...prev, [pageName]: newPagePrompt }));
    setNewPagePrompt('');
    setShowCreatePageModal(false);
    setActiveView(pageName as any);
  };

  const handleCreateTask = (title: string, tags?: string[]) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: title || 'Новая задача',
      status: 'pending',
      tags: tags
    };
    setAllTasks(prev => [...prev, newTask]);
    alert(`Создана задача: ${newTask.title}`);
  };

  const handleUpdateTaskTags = (taskId: string, newTags: string[]) => {
    setAllTasks(prev => prev.map(t => t.id === taskId ? { ...t, tags: newTags } : t));
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask({ ...selectedTask, tags: newTags });
    }
  };

  const handleIntegrateData = async (text: string) => {
    setIsProcessing(true);
    setCurrentThought('Выполняется интеллектуальная экстракция данных...');
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Simulate extraction of tasks from brackets
    const extractedTasks: Task[] = [];
    const taskRegex = /\[([^\]]+)\]/g;
    let match;
    while ((match = taskRegex.exec(text)) !== null) {
      extractedTasks.push({
        id: `ext-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title: match[1],
        status: 'pending',
        tags: ['Из документа', currentDomain]
      });
    }

    if (extractedTasks.length > 0) {
      setAllTasks(prev => [...prev, ...extractedTasks]);
    }

    const integrationMessage: Message = {
      id: Date.now().toString(),
      role: 'model',
      text: `🚀 **Интеграция завершена!**\n\nИз документа успешно извлечено и добавлено в систему **${extractedTasks.length}** задач(и).\n\nВсе новые элементы теперь доступны в ваших рабочих модулях («Задачи», «Доска») и связаны с доменом **${currentDomain}**. Вы можете приступать к их исполнению.`,
      mainText: `Интеграция завершена. Добавлено ${extractedTasks.length} задач.`,
      comment: "Данные успешно маппированы на операционный уровень системы.",
      timestamp: new Date(),
      domain: currentDomain,
      consultant: 'Proji Data Integrator'
    };
    
    setAllMessages(prev => [...prev, integrationMessage]);
    setIsProcessing(false);
    setCurrentThought('');
    
    // Also save as actual doc in library
    handleCreateDoc(text);
  };

  const handleCreateDoc = (text: string) => {
    const newDoc = {
      name: `AI_Extracted_${Date.now().toString().slice(-4)}.pdf`,
      type: 'form',
      size: `${(text.length / 1024).toFixed(1)} KB`,
      date: new Date().toLocaleDateString('ru-RU')
    };
    setAllDocs(prev => ({
      ...prev,
      [currentDomain]: [newDoc, ...prev[currentDomain]]
    }));
    alert(`Документ "${newDoc.name}" добавлен в библиотеку`);
  };

  const handleContextAction = (actionLabel: string) => {
    const actionMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: `/run ${actionLabel}`,
      timestamp: new Date(),
      domain: currentDomain,
      sourceView: activeView
    };
    
    setAllMessages(prev => [...prev, actionMsg]);
    handleSend(`Запусти контекстную функцию страницы "${activeView}": "${actionLabel}". Проведи соответствующий анализ или действие.`);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing]);

  useEffect(() => {
    // Removed automatic switch to 'Чат'
  }, [currentDomain]);


  const handleSend = async (text?: string) => {
    const messageToSend = text || inputText;
    if (!messageToSend.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: messageToSend,
      timestamp: new Date(),
      domain: currentDomain,
      sourceView: activeView
    };

    setAllMessages(prev => [...prev, userMessage]);
    if (!text) setInputText('');
    setIsProcessing(true);
    
    // Phased thinking reveal
    try {
      for (let i = 0; i < thoughtSteps.length; i++) {
        setCurrentThought(thoughtSteps[i]);
        await new Promise(resolve => setTimeout(resolve, i >= 4 ? 1200 : 800));
      }

      const historyItems = allMessages.map(m => ({ role: m.role, text: m.text }));
      const responseText = await processBusinessCommand(messageToSend, historyItems);

      // Verify document criteria
      const criteria = verifyDocumentCriteria(responseText || '', messageToSend);
      const isDocument = criteria.length >= 5; 
      const options = parseOptions(responseText || '');
      
      const reasoning = [
        `Данные домена ${currentDomain} верифицированы.`,
        isDocument ? `Документальный статус подтвержден (Полнота: ${criteria.length}/5).` : `Запрос классифицирован как интерактивное взаимодействие.`,
        `Контрольные точки: KPI, риски, ресурсы.`
      ];

      if (isDocument) {
        setPendingDraft({
          title: messageToSend.length > 40 ? messageToSend.substring(0, 40) + '...' : messageToSend,
          content: responseText || '',
          reasoning: reasoning
        });
      }
      
      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "Извините, я не смог обработать этот запрос.",
        mainText: responseText || "Нет данных",
        comment: isDocument 
          ? `Сформирован полноценный бизнес-документ. Соответствует критериям: ${criteria.join(', ')}.` 
          : options 
            ? `Необходимы уточнения для продолжения формирования документа.`
            : undefined,
        timestamp: new Date(),
        domain: currentDomain,
        consultant: domainConsultants[currentDomain],
        reasoning: isDocument ? reasoning : undefined,
        matchingCriteria: isDocument ? criteria : undefined,
        options: options
      };
      
      setAllMessages(prev => [...prev, modelMessage]);
      if (allMessages.length === 0) {
        setIsAiPanelOpen(true);
        setShowTopMenu(true);
        setShowBottomBar(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
      setCurrentThought('');
    }
  };

  const [activeTopHover, setActiveTopHover] = useState<string | null>(null);
  const [hoveredSideItem, setHoveredSideItem] = useState<string | null>(null);

  const sideItemsBase: { icon: any, label: View, details: { label: View, icon: any }[] }[] = [
    { icon: LayoutDashboard, label: 'Чат', details: [
      { label: 'Чат', icon: Sparkles }, 
      { label: 'Все сценарии', icon: CheckCircle2 },
      { label: 'Agile', icon: Workflow },
      { label: 'Sprint Review', icon: Search }
    ] },
    { icon: Mail, label: 'Сообщения', details: [{ label: 'Сообщения', icon: Mail }, { label: 'Обсуждения', icon: MessageSquare }] },
    { icon: Folder, label: 'Проекты', details: [{ label: 'Проекты', icon: Folder }, { label: 'Дерево целей', icon: Target }, { label: 'Управление проектом', icon: Settings }] },
    { icon: Target, label: 'Задачи', details: [{ label: 'Задачи проекта', icon: CheckCircle2 }, { label: 'Доска задач', icon: LayoutDashboard }, { label: 'Задачи', icon: CheckCircle2 }] },
    { icon: Users, label: 'Команда', details: [{ label: 'Команда', icon: Users }, { label: 'Карта стейкхолдеров', icon: Users }, { label: 'Профиль сотрудника', icon: User }] },
    { icon: FileText, label: 'Документы', details: [{ label: 'Документы', icon: Archive }, { label: 'Регламенты', icon: BookOpen }] },
    { icon: Layout, label: 'Страницы', details: [{ label: 'Страницы', icon: Layout }, { label: 'Дерево страниц', icon: LayoutDashboard }] },
  ];

  const sideItems = currentDomain === 'Оборудование' ? [
    ...sideItemsBase,
    { icon: Settings2, label: 'Оборудование', details: [
      { label: 'Журнал оборудования', icon: Settings2 },
      { label: 'Доска оборудования', icon: LayoutDashboard },
      { label: 'Архив ремонтов', icon: Archive }
    ]}
  ] : currentDomain === 'Производство' ? [
    ...sideItemsBase,
    { icon: Factory, label: 'Завод', details: [
      { label: 'Журнал проверок', icon: ClipboardCheck },
      { label: 'Схемы ТП', icon: Workflow },
      { label: 'Регламенты', icon: BookOpen }
    ]}
  ] : [
    ...sideItemsBase,
    { icon: Shield, label: 'TQM Dashboard', details: [
      { label: 'TQM Dashboard', icon: Shield },
      { label: 'TQM DWM Chart', icon: BarChart3 },
      { label: 'Непрерывное улучшение', icon: RefreshCw },
      { label: 'Аудиты качества', icon: ClipboardCheck },
      { label: 'Удовлетворенность клиентов', icon: Smile }
    ]},
    { icon: Target, label: 'Стратегия', details: [
      { label: 'Список болей', icon: Activity },
      { label: 'Карта стейкхолдеров', icon: Users },
      { label: 'HADI Циклы', icon: RotateCcw }
    ]},
    { icon: Briefcase, label: 'Юридический', details: [
      { label: 'Юридический Дашборд', icon: Scale }
    ]},
    { icon: History, label: 'Дневник ИИ', details: [
      { label: 'Управленческий Журнал', icon: History },
      { label: 'Управленческий Отчет', icon: FileText }
    ]}
  ];

  const handleSideItemClick = (e: MouseEvent, label: string) => {
    e.stopPropagation();
    if (activeSidePanel === label) {
      setActiveSidePanel(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setPanelPos({ top: rect.top + rect.height / 2 });
      setActiveSidePanel(label);
    }
  };

  useEffect(() => {
    // Auto-create purchase tasks for low-health equipment
    setAllTasks(prevTasks => {
      const newTasksToAdd: Task[] = [];
      equipmentLog.forEach(eq => {
        if (eq.health < 50) {
          // Check if task already exists by ID
          const taskExists = prevTasks.some(t => t.id === `buy-${eq.id}`);
          if (!taskExists) {
            newTasksToAdd.push({ 
              id: `buy-${eq.id}`, 
              title: `Закуп: ${eq.name} (Запчасти)`, 
              status: 'pending', 
              relatedToType: 'Оборудование',
              relatedToName: eq.name 
            });
          }
        }
      });
      
      if (newTasksToAdd.length === 0) return prevTasks;
      return [...prevTasks, ...newTasksToAdd];
    });
  }, [equipmentLog]);

  useEffect(() => {
    const handleClose = (e: MouseEvent | Event) => {
      setActiveSidePanel(null);
      setShowAccountMenu(false);
      setShowDomainDropdown(false);
      
      // sidebar closes only via its own toggle button
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, []);

  // Minimalist view components
  const renderTaskDetailModal = () => {
    if (!selectedTask) return null;
    return (
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsTaskModalOpen(false)}
              className="absolute inset-0 bg-proji-dark/60 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-proji-bg rounded-[40px] shadow-2xl p-12 border border-proji-border overflow-hidden"
            >
              <button onClick={() => { setIsTaskModalOpen(false); setProcessStarted(false); }} className="absolute top-10 right-10 text-proji-secondary hover:text-proji-dark transition-colors"><X size={24} /></button>
              
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-proji-amber/10 text-proji-amber text-[10px] font-black uppercase tracking-widest rounded-full border border-proji-amber/20">Задача #{selectedTask.id}</span>
                  <span className="text-[10px] font-bold text-proji-secondary uppercase tracking-widest">Просмотр детализации</span>
                </div>
                <h3 className="text-4xl font-light text-proji-dark tracking-tight leading-tight">{selectedTask.title}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-12 mb-12">
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-3">Статус задачи</h4>
                    <div className="flex items-center gap-3">
                       <div className="w-2.5 h-2.5 rounded-full bg-proji-amber animate-pulse" />
                       <span className="text-sm font-bold text-proji-dark uppercase tracking-widest">{selectedTask.status === 'pending' ? 'В работе' : 'Завершено'}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-3">Связанный объект</h4>
                    <div 
                      onClick={() => {
                        if (selectedTask.relatedToType === 'Проект') {
                          const project = projects.find(p => p.name === selectedTask.relatedToName);
                          if (project) {
                            setSelectedProject(project);
                            setIsProjectModalOpen(true);
                            setIsTaskModalOpen(false);
                          }
                        } else if (selectedTask.relatedToType === 'Оборудование') {
                          navigateToView('Журнал оборудования');
                          setIsTaskModalOpen(false);
                        }
                      }}
                      className={`flex items-center gap-3 p-4 bg-proji-sidebar rounded-2xl border border-proji-border transition-all ${
                        (selectedTask.relatedToType === 'Проект' || selectedTask.relatedToType === 'Оборудование') ? 'cursor-pointer hover:border-proji-amber hover:bg-proji-amber/5 group/link' : ''
                      }`}
                    >
                       <div className={`p-2 rounded-lg transition-all ${
                         selectedTask.relatedToType === 'Оборудование' ? 'bg-proji-amber/10 text-proji-amber group-hover/link:bg-proji-amber group-hover/link:text-white' : 
                         selectedTask.relatedToType === 'Проект' ? 'bg-proji-dark/10 text-proji-dark group-hover/link:bg-proji-dark group-hover/link:text-white' : 'bg-proji-dark/10 text-proji-dark'
                       }`}>
                         {selectedTask.relatedToType === 'Оборудование' ? <Settings2 size={16} /> : <Target size={16} />}
                       </div>
                       <div className="flex-1">
                          <p className="text-[10px] font-bold text-proji-secondary uppercase tracking-widest leading-none mb-1">{selectedTask.relatedToType || 'Общий'}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-proji-dark">
                              {selectedTask.relatedToName || 'Не указано'}
                            </p>
                            {(selectedTask.relatedToType === 'Проект' || selectedTask.relatedToType === 'Оборудование') && (
                              <ChevronRight size={14} className="text-proji-amber opacity-0 group-hover/link:opacity-100 transition-all ml-2" />
                            )}
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-3">Исполнитель</h4>
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-proji-dark text-white flex items-center justify-center text-xs font-bold shadow-lg">AK</div>
                       <div>
                          <p className="text-sm font-bold text-proji-dark">Alex K.</p>
                          <p className="text-[10px] text-proji-secondary font-medium uppercase tracking-widest">Lead Engineer</p>
                       </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-3">Дедлайн</h4>
                    <div className="flex items-center gap-3 text-proji-secondary">
                       <Calendar size={18} />
                       <span className="text-sm font-bold text-proji-dark">15 Мая, 2024</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-proji-sidebar rounded-3xl border border-proji-border">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-4">AI Рекомендация</h4>
                <p className="text-[13px] leading-relaxed text-proji-dark italic">"На основе истории обслуживания данного типа оборудования, рекомендуется провести полную проверку гидравлических узлов перед запуском конвейера."</p>
              </div>

              <div className="mt-8">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-4">Теги</h4>
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedTask.tags?.map((tag: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-proji-sidebar border border-proji-border rounded-lg text-[10px] font-bold uppercase tracking-widest text-proji-dark">
                      {tag}
                    </span>
                  ))}
                  <button 
                    onClick={() => {
                      const newTag = prompt('Введите новый тег:');
                      if (newTag) {
                        handleUpdateTaskTags(selectedTask.id, [...(selectedTask.tags || []), newTag]);
                      }
                    }}
                    className="px-3 py-1 border border-dashed border-proji-border rounded-lg text-[10px] font-bold uppercase tracking-widest text-proji-secondary hover:border-proji-amber hover:text-proji-amber transition-all"
                  >
                    + Добавить
                  </button>
                </div>
              </div>

              <div className="mt-12">
                 {!processStarted ? (
                   <button 
                    disabled={isLaunching}
                    onClick={() => {
                      setIsLaunching(true);
                      setTimeout(() => {
                        setIsLaunching(false);
                        setProcessStarted(true);
                      }, 1500);
                    }}
                    className="w-full py-4 bg-proji-dark text-proji-bg rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-proji-dark/10 flex items-center justify-center gap-3"
                   >
                     {isLaunching ? (
                       <>
                         <RefreshCw className="animate-spin" size={16} />
                         Инициализация...
                       </>
                     ) : (
                       <>
                         <Zap size={16} />
                         Запустить процесс
                       </>
                     )}
                   </button>
                 ) : (
                   <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-8 bg-proji-success/10 border border-proji-border rounded-[32px]"
                   >
                     <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-proji-success text-white rounded-full">
                           <CheckCircle2 size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-proji-success uppercase tracking-widest">Процесс запущен</h4>
                     </div>
                     <div className="space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary">Следующие шаги:</p>
                        <div className="space-y-3">
                           {[
                             'Уведомление отправлено ответственному (Олег П.)',
                             'Бронирование запчастей на центральном складе',
                             'Обновление статуса в Журнале Оборудования'
                           ].map((step, i) => (
                             <div key={i} className="flex items-center gap-3 text-xs text-proji-dark">
                                <div className="w-1.5 h-1.5 rounded-full bg-proji-success" />
                                {step}
                             </div>
                           ))}
                        </div>
                     </div>
                   </motion.div>
                 )}
                 {!processStarted && (
                   <button 
                    onClick={() => { setIsTaskModalOpen(false); setProcessStarted(false); }}
                    className="mt-4 w-full py-4 bg-proji-sidebar border border-proji-border text-proji-dark rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white transition-all"
                   >
                     Закрыть
                   </button>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderProjectDetailModal = () => {
    if (!selectedProject) return null;
    return (
      <AnimatePresence>
        {isProjectModalOpen && (
          <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsProjectModalOpen(false)}
              className="absolute inset-0 bg-proji-dark/80 backdrop-blur-xl"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-white rounded-[32px] shadow-2xl border border-proji-border overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 md:p-8 pb-6 border-b border-proji-border flex flex-col md:flex-row justify-between items-center md:items-start gap-6 text-center md:text-left">
                <div className="flex flex-col items-center md:items-start">
                  <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-proji-dark text-white text-[9px] font-bold uppercase tracking-widest rounded-full">Project ID: {selectedProject.id}</span>
                    <span className={`px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded-full ${
                      selectedProject.status === 'Completed' ? 'bg-proji-success/10 text-proji-success' : 'bg-proji-amber/10 text-proji-amber'
                    }`}>{selectedProject.status}</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-light text-proji-dark tracking-tight leading-tight mb-2">{selectedProject.name}</h3>
                  <p className="max-w-xl text-sm font-medium text-proji-secondary leading-relaxed">{selectedProject.description}</p>
                </div>
                <button onClick={() => setIsProjectModalOpen(false)} className="absolute top-4 right-4 md:static md:p-3 bg-proji-sidebar rounded-full md:rounded-2xl text-proji-secondary hover:text-proji-dark transition-all hover:scale-105 shadow-md md:shadow-none"><X size={20} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 proji-scrollbar">
                {/* At a Glance Summary */}
                <div className="bg-proji-sidebar/40 border border-proji-border rounded-3xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2 border-r border-proji-border/50 pr-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary mb-2 flex items-center gap-2">
                       <FileText size={12} className="text-proji-amber" /> Резюме проекта
                    </h4>
                    <p className="text-xs font-medium text-proji-dark leading-relaxed line-clamp-3">
                      {selectedProject.description}
                    </p>
                  </div>
                  <div className="border-r border-proji-border/50 pr-6">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary mb-3 flex items-center gap-2">
                       <Activity size={12} className="text-proji-success" /> Ключевые метрики
                    </h4>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-proji-secondary font-bold">ROI:</span>
                          <span className="text-[11px] font-bold text-proji-dark">{selectedProject.roi}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-proji-secondary font-bold">Риск:</span>
                          <span className={`text-[11px] font-bold ${selectedProject.riskLevel === 'High' || selectedProject.riskLevel === 'Critical' ? 'text-red-500' : 'text-proji-success'}`}>{selectedProject.riskLevel}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-proji-secondary font-bold">Бюджет:</span>
                          <span className="text-[11px] font-bold text-proji-dark">{selectedProject.budget}</span>
                       </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary mb-3 flex items-center gap-2">
                       <Clock size={12} className="text-proji-dark" /> Текущий статус
                    </h4>
                    <div className="space-y-2">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-proji-secondary font-bold">Состояние:</span>
                          <span className="text-[11px] font-bold text-proji-amber">{selectedProject.status}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-proji-secondary font-bold">Прогресс:</span>
                          <span className="text-[11px] font-bold text-proji-dark">{selectedProject.progress}%</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-proji-secondary font-bold">Дедлайн:</span>
                          <span className="text-[11px] font-bold text-proji-dark">{selectedProject.deadline}</span>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard & Business Plan Section */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                  
                  {/* Left: Business Plan / Architecture */}
                  <div className="xl:col-span-7 space-y-6">
                    <div className="bg-white border border-proji-border rounded-3xl p-8">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary mb-6 flex items-center gap-2">
                        <BookOpen size={14} className="text-proji-amber" /> Бизнес-архитектура
                      </h4>
                      
                      <div className="space-y-6">
                        <div>
                          <p className="text-[8px] font-bold uppercase tracking-widest text-proji-secondary/60 mb-2">Задача проекта</p>
                          <p className="text-lg font-light text-proji-dark leading-relaxed">{selectedProject.taskObjective}</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-proji-border/50">
                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-proji-secondary/60 mb-2">Стратегическая цель</p>
                            <p className="text-xs font-bold text-proji-dark">{selectedProject.strategicGoal}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-widest text-proji-secondary/60 mb-2">Обоснование</p>
                            <p className="text-xs font-bold text-proji-dark">{selectedProject.originResearch}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="task-card !p-8 bg-proji-sidebar/20 border border-proji-border">
                      <div className="space-y-6">
                         <div>
                            <div className="flex justify-between items-center mb-2">
                               <span className="text-[10px] font-bold text-proji-secondary uppercase tracking-widest">Прогресс реализации</span>
                               <span className="text-2xl font-light text-proji-dark">{selectedProject.progress}%</span>
                            </div>
                            <div className="h-2 w-full bg-proji-border rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }} 
                                 animate={{ width: `${selectedProject.progress}%` }} 
                                 className="h-full bg-proji-dark" 
                               />
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metric Dashboard */}
                  <div className="xl:col-span-5 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      {[
                        { label: 'Priority / Risk', value: `${selectedProject.priority} / ${selectedProject.riskLevel}`, icon: Shield, color: 'text-red-500' },
                        { label: 'ROI Forecast', value: selectedProject.roi, icon: TrendingUp, color: 'text-proji-amber' },
                        { label: 'Res. Utilization', value: `${selectedProject.resourceUtilization}%`, icon: Users, color: 'text-proji-dark' },
                        { label: 'Quality Metric', value: selectedProject.qualityMetric, icon: Activity, color: 'text-proji-success' }
                      ].map((m, i) => (
                        <div key={i} className="p-8 bg-proji-sidebar/50 rounded-3xl border border-proji-border group hover:bg-white transition-all">
                           <div className="flex items-center justify-between mb-4">
                              <m.icon size={18} className={m.color} />
                              <span className="text-[8px] font-black uppercase tracking-widest text-proji-secondary">Metric #{i+1}</span>
                           </div>
                           <p className="text-[10px] font-bold text-proji-secondary uppercase tracking-[0.2em] mb-1">{m.label}</p>
                           <p className="text-xl font-bold text-proji-dark">{m.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="task-card !p-10 bg-proji-sidebar/30 border border-proji-border">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-proji-secondary mb-8 flex items-center gap-3">
                         <Coins size={18} /> Финансовый Дашборд
                      </h4>
                      <div className="grid grid-cols-2 gap-8 mb-8">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary mb-2">Бюджет</p>
                            <p className="text-3xl font-light text-proji-dark">{selectedProject.budget}</p>
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary mb-2">Освоено</p>
                            <p className="text-3xl font-light text-proji-amber">{selectedProject.spent}</p>
                         </div>
                      </div>
                      <div className="p-6 bg-white rounded-2xl border border-proji-border space-y-3">
                         <div className="flex justify-between items-center">
                            <p className="text-[11px] font-bold text-proji-dark">Стейкхолдер:</p>
                            <span className="text-[11px] text-proji-secondary font-bold">{selectedProject.stakeholder}</span>
                         </div>
                         <div className="flex justify-between items-center">
                            <p className="text-[11px] font-bold text-proji-dark">Compliance:</p>
                            <span className={`text-[11px] font-black ${selectedProject.complianceStatus === 'Verified' ? 'text-proji-success' : 'text-proji-amber'}`}>{selectedProject.complianceStatus}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Frameworks & Tasks */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                   <div className="lg:col-span-2 space-y-12">
                      <div className="space-y-6">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-proji-secondary flex items-center gap-3 border-b border-proji-border pb-4">
                           <Layout size={18} className="text-proji-amber" /> Стратегические Фреймворки
                        </h4>
                        
                        <div className="space-y-4">
                          {/* SWOT Framework */}
                          <div className={`border border-proji-border rounded-3xl overflow-hidden transition-all ${expandedFramework === 'swot' ? 'bg-white shadow-xl' : 'bg-proji-sidebar/20 hover:bg-white'}`}>
                            <button 
                              onClick={() => setExpandedFramework(expandedFramework === 'swot' ? null : 'swot')}
                              className="w-full p-6 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl"><Maximize2 size={18} /></div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-proji-dark">SWOT Анализ</p>
                                  <p className="text-[10px] text-proji-secondary uppercase tracking-widest font-medium">Сильные и слабые стороны, возможности, угрозы</p>
                                </div>
                              </div>
                              <ChevronRight size={20} className={`text-proji-secondary transition-transform ${expandedFramework === 'swot' ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedFramework === 'swot' && selectedProject.frameworks.swot && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-8 pt-0 grid grid-cols-2 gap-4">
                                {[
                                  { label: 'Strengths', items: selectedProject.frameworks.swot.strengths, color: 'bg-green-50' },
                                  { label: 'Weaknesses', items: selectedProject.frameworks.swot.weaknesses, color: 'bg-red-50' },
                                  { label: 'Opportunities', items: selectedProject.frameworks.swot.opportunities, color: 'bg-blue-50' },
                                  { label: 'Threats', items: selectedProject.frameworks.swot.threats, color: 'bg-amber-50' }
                                ].map((box) => (
                                  <div key={box.label} className={`p-4 rounded-2xl ${box.color}`}>
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-50">{box.label}</p>
                                    <ul className="space-y-2">
                                      {box.items.map((it, i) => <li key={i} className="text-xs font-bold text-proji-dark flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-current" /> {it}</li>)}
                                    </ul>
                                  </div>
                                ))}
                                <div className="col-span-2 mt-4 pt-4 border-t border-proji-border flex justify-between items-center text-[10px] font-bold text-proji-secondary uppercase tracking-widest">
                                  <span>Авторы: {selectedProject.frameworks.swot.authors.join(', ')}</span>
                                  <button className="text-proji-amber hover:underline">Редактировать</button>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Stakeholders Framework */}
                          <div className={`border border-proji-border rounded-3xl overflow-hidden transition-all ${expandedFramework === 'stakeholders' ? 'bg-white shadow-xl' : 'bg-proji-sidebar/20 hover:bg-white'}`}>
                            <button 
                              onClick={() => setExpandedFramework(expandedFramework === 'stakeholders' ? null : 'stakeholders')}
                              className="w-full p-6 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-purple-500/10 text-purple-500 rounded-xl"><Users size={18} /></div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-proji-dark">Карта Стейкхолдеров</p>
                                  <p className="text-[10px] text-proji-secondary uppercase tracking-widest font-medium">Влияние и интересы ключевых лиц</p>
                                </div>
                              </div>
                              <ChevronRight size={20} className={`text-proji-secondary transition-transform ${expandedFramework === 'stakeholders' ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedFramework === 'stakeholders' && selectedProject.frameworks.stakeholders && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-8 pt-0">
                                <div className="space-y-3">
                                  {selectedProject.frameworks.stakeholders.map((s, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-proji-sidebar/30 rounded-2xl">
                                      <div>
                                        <p className="text-xs font-bold text-proji-dark">{s.name}</p>
                                        <p className="text-[10px] text-proji-secondary font-medium uppercase tracking-widest">{s.role}</p>
                                      </div>
                                      <div className="flex gap-4">
                                        <div className="text-right">
                                          <p className="text-[8px] font-black uppercase text-proji-secondary mb-1">Influence</p>
                                          <span className="text-[10px] font-bold text-proji-dark px-2 py-0.5 bg-white rounded-lg border border-proji-border">{s.influence}</span>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-[8px] font-black uppercase text-proji-secondary mb-1">Interest</p>
                                          <span className="text-[10px] font-bold text-proji-dark px-2 py-0.5 bg-white rounded-lg border border-proji-border">{s.interest}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="mt-6 pt-4 border-t border-proji-border text-[10px] font-bold text-proji-secondary uppercase tracking-widest">
                                  <span>Добавил: {selectedProject.createdBy}</span>
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {/* Pain Points Framework */}
                          <div className={`border border-proji-border rounded-3xl overflow-hidden transition-all ${expandedFramework === 'pains' ? 'bg-white shadow-xl' : 'bg-proji-sidebar/20 hover:bg-white'}`}>
                            <button 
                              onClick={() => setExpandedFramework(expandedFramework === 'pains' ? null : 'pains')}
                              className="w-full p-6 flex items-center justify-between group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="p-2 bg-red-500/10 text-red-500 rounded-xl"><AlertCircle size={18} /></div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-proji-dark">Карта Болей</p>
                                  <p className="text-[10px] text-proji-secondary uppercase tracking-widest font-medium">Критические проблемы и статус решения</p>
                                </div>
                              </div>
                              <ChevronRight size={20} className={`text-proji-secondary transition-transform ${expandedFramework === 'pains' ? 'rotate-90' : ''}`} />
                            </button>
                            {expandedFramework === 'pains' && selectedProject.frameworks.painPoints && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="p-8 pt-0">
                                <div className="space-y-3">
                                  {selectedProject.frameworks.painPoints.map((p, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 border border-red-100 bg-red-50/30 rounded-2xl">
                                      <div className="flex items-center gap-4">
                                        <div className="w-2 h-2 rounded-full bg-red-500" />
                                        <p className="text-xs font-bold text-proji-dark">{p.point}</p>
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black uppercase text-red-500">{p.impact}</span>
                                        <span className="text-[9px] font-black uppercase text-white bg-red-500 px-3 py-1 rounded-full">{p.status}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-8">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-proji-secondary flex items-center gap-3 border-b border-proji-border pb-4">
                           <Zap size={18} className="text-proji-amber" /> Состояние задач
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {[
                             { id: 'todo', label: 'Backlog', icon: Circle, tasks: selectedProject.tasks.filter(t => t.status === 'todo'), color: 'text-proji-secondary' },
                             { id: 'doing', label: 'In Progress', icon: RefreshCw, tasks: selectedProject.tasks.filter(t => t.status === 'doing'), color: 'text-proji-amber' },
                             { id: 'done', label: 'Completed', icon: CheckCircle2, tasks: selectedProject.tasks.filter(t => t.status === 'done'), color: 'text-proji-success' }
                           ].map((col) => (
                             <div key={col.id} className="space-y-4">
                               <div className="flex items-center justify-between mb-2">
                                 <div className="flex items-center gap-2">
                                   <col.icon size={12} className={col.color} />
                                   <span className="text-[9px] font-black uppercase tracking-widest text-proji-secondary">{col.label}</span>
                                 </div>
                                 <span className="px-1.5 py-0.5 bg-proji-sidebar rounded text-[9px] font-bold text-proji-secondary">{col.tasks.length}</span>
                               </div>
                               <div className="space-y-2 min-h-[100px]">
                                 {col.tasks.map((t, idx) => (
                                   <div key={idx} className="p-3 bg-white border border-proji-border rounded-xl shadow-sm hover:border-proji-amber/40 transition-all group">
                                      <div className="flex items-start gap-2">
                                        <p className="text-[11px] font-bold text-proji-dark leading-tight flex-1">{t.title}</p>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                          <ChevronRight size={10} className="text-proji-secondary" />
                                        </div>
                                      </div>
                                   </div>
                                 ))}
                                 {col.tasks.length === 0 && (
                                   <div className="h-full border border-dashed border-proji-border/60 rounded-xl flex items-center justify-center p-6 bg-proji-sidebar/5">
                                      <p className="text-[8px] text-proji-secondary/30 font-black uppercase tracking-[0.2em]">Пусто</p>
                                   </div>
                                 )}
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>
                   </div>

                   <div className="space-y-12">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-proji-secondary flex items-center gap-3">
                         <FileText size={18} /> Отчетные документы
                      </h4>
                      <div className="space-y-4">
                         {selectedProject.reports.map((r, idx) => (
                           <div key={idx} className="p-5 bg-white rounded-2xl border border-proji-border hover:bg-proji-sidebar transition-all cursor-pointer group">
                              <div className="flex justify-between items-center mb-1">
                                 <p className="text-[11px] font-bold text-proji-dark">{r.name}</p>
                                 <FileDown size={14} className="text-proji-secondary group-hover:text-proji-dark" />
                              </div>
                              <p className="text-[10px] text-proji-secondary font-medium uppercase tracking-widest">{r.date}</p>
                           </div>
                         ))}
                         <button className="w-full py-4 border-2 border-dashed border-proji-border rounded-2xl text-[10px] font-black uppercase tracking-widest text-proji-secondary hover:border-proji-dark hover:text-proji-dark transition-all">Сгенерировать AI отчет</button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="p-8 bg-proji-sidebar border-t border-proji-border flex justify-between items-center">
                 <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary">Команда проекта:</p>
                    <div className="flex -space-x-2">
                       {selectedProject.team.map((m, i) => (
                         <div key={i} className="w-10 h-10 rounded-full bg-proji-dark text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-md">
                            {m[0]}
                         </div>
                       ))}
                       <button className="w-10 h-10 rounded-full bg-white border border-proji-border text-proji-secondary flex items-center justify-center hover:bg-proji-dark hover:text-white transition-all"><Plus size={16} /></button>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <button className="px-8 py-4 border border-proji-border rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-proji-dark hover:bg-white transition-all">Архивировать</button>
                    <button 
                      onClick={() => {
                        setActiveView('Управление проектом');
                        setIsProjectModalOpen(false);
                      }}
                      className="px-10 py-4 bg-proji-dark text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all"
                    >
                      Настройки
                    </button>
                    <button 
                      onClick={() => {
                        setActiveView('Задачи проекта');
                        setIsProjectModalOpen(false);
                      }}
                      className="px-10 py-4 bg-proji-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-blue-600 transition-all flex justify-center items-center gap-2"
                    >
                      <Target size={16} /> Перейти к задачам
                    </button>
                 </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  };

  const renderView = () => {
    switch (activeView) {
      case 'DomainInfo':
        return <DomainInfoView 
          navigateToView={navigateToView} 
          onSetCurrentDomain={setCurrentDomain}
          onSetShowDomainWelcome={setShowDomainWelcome}
          onSetActiveView={setActiveView}
        />;
      case 'DomainLanding':
        return <DomainWelcomeView domain={showDomainWelcome.domain} onClose={() => { setShowDomainWelcome({ ...showDomainWelcome, active: false }); setActiveView('Чат'); }} navigateToView={navigateToView} />;
      case 'Agile':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
           </motion.div>
        );
      case 'TQM Dashboard':
        return <TQMDashboardView />;
      case 'Непрерывное улучшение':
        return <ContinuousImprovementView />;
      case 'Аудиты качества':
        return <QualityAuditsView />;
      case 'Удовлетворенность клиентов':
        return <CustomerSatisfactionView />;
      case 'TQM DWM Chart':
        return <TQMDWMChartView reports={domainViewData[currentDomain].reports} />;
      case 'Дорожная карта':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
             
             <div className="space-y-12">
                {(domainViewData[currentDomain].roadmap || ['Этап 1: Планирование', 'Этап 2: Реализация']).map((phase: string, i: number) => (
                  <div key={`Phase-${i}`} className="relative pl-12 border-l border-proji-border pb-12 last:pb-0">
                    <div className="absolute left-[-5px] top-0 w-[9px] h-[9px] bg-proji-amber rounded-full" />
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4">{phase}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="task-card opacity-60">Завершено: Аудит {currentDomain}</div>
                      <div className="task-card">В разработке: {currentDomain} v2.0</div>
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        );
      case 'OKRs':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
            
            <div className="space-y-8">
              {(domainViewData[currentDomain].okrs || [{ title: 'Рост в домене ' + currentDomain, progress: 50, keyResults: ['Результат 1'] }]).map((okr: any, i: number) => (
                <div key={i} className="task-card">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold">{okr.title}</h3>
                    <span className="text-lg font-light text-proji-amber">{okr.progress}%</span>
                  </div>
                  <div className="w-full h-1 bg-proji-border rounded-full mb-6">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${okr.progress}%` }} 
                      className="h-full bg-proji-amber" 
                    />
                  </div>
                  <div className="space-y-3">
                    {okr.keyResults.map((kr: string, j: number) => (
                      <div key={j} className="flex items-center gap-3 text-[11px] text-proji-secondary font-medium">
                        <CheckCircle2 size={12} className="text-proji-success" />
                        {kr}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'Процессы':
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {(domainViewData[currentDomain].processes || []).map((proc: any, i: number) => (
                        <div key={i} className="task-card group cursor-pointer hover:border-proji-amber transition-all">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-proji-sidebar rounded-xl text-proji-amber">
                                    <proc.icon size={20} />
                                </div>
                                <span className={`text-[10px] uppercase font-bold tracking-widest ${proc.status === 'Активен' ? 'text-proji-success' : 'text-proji-secondary'}`}>
                                    {proc.status}
                                </span>
                            </div>
                            <h3 className="font-bold mb-1">{proc.name}</h3>
                            <p className="text-[11px] text-proji-secondary uppercase tracking-widest">{proc.steps} шагов в цепочке</p>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
      case 'Кампании':
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
                <div className="flex justify-between items-center mb-12">
                
                <button className="p-3 bg-proji-dark text-white rounded-xl"><Plus size={18} /></button>
            </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                        { title: 'Весенний запуск 2024', spend: '$12,400', roi: '3.2x', status: 'Активна' },
                        { title: 'Ретаргетинг: Ушедшие лиды', spend: '$4,500', roi: '1.8x', status: 'Черновик' },
                        { title: 'Брендинг: Визуальное обновление', spend: '$2,100', roi: '-', status: 'Архив' }
                    ].map((camp, i) => (
                        <div key={i} className="task-card relative overflow-hidden group">
                           <div className="flex justify-between items-start mb-6">
                               <div>
                                   <h3 className="font-bold text-lg mb-1">{camp.title}</h3>
                                   <span className="text-[10px] uppercase font-bold tracking-widest text-proji-secondary">{camp.status}</span>
                               </div>
                               <div className="text-right">
                                   <p className="text-xs text-proji-secondary uppercase">Бюджет</p>
                                   <p className="font-bold text-proji-dark">{camp.spend}</p>
                               </div>
                           </div>
                           <div className="flex items-center gap-2">
                               <div className="px-3 py-1 bg-proji-amber/10 rounded-full text-[10px] font-bold text-proji-amber uppercase tracking-widest">ROI: {camp.roi}</div>
                               <div className="px-3 py-1 bg-proji-dark/5 rounded-full text-[10px] font-bold text-proji-secondary uppercase tracking-widest">Анализ ИИ</div>
                           </div>
                           <div className="absolute bottom-0 left-0 w-full h-1 bg-proji-border group-hover:bg-proji-amber transition-colors" />
                        </div>
                    ))}
                </div>
            </motion.div>
        );
      case 'Лиды':
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide pb-20">
                
                <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
                    {['Новые (12)', 'В работе (5)', 'Квалифицировано (8)', 'Сделка (3)'].map((tab, i) => (
                        <button key={i} className={`whitespace-nowrap px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${i === 0 ? 'bg-proji-dark text-white border-proji-dark' : 'bg-transparent text-proji-secondary border-proji-border hover:border-proji-dark'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="space-y-4">
                    {(domainViewData[currentDomain].leads || []).map((lead: any, i: number) => (
                        <div key={i} className="task-card flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-proji-sidebar flex items-center justify-center font-bold text-xs">
                                    {lead.score}
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{lead.name}</p>
                                    <p className="text-[10px] text-proji-secondary uppercase tracking-widest">{lead.company} • {lead.source}</p>
                                </div>
                            </div>
                            <button className="p-2 border border-proji-border rounded-lg hover:border-proji-amber transition-colors">
                                <ChevronRight size={14} className="text-proji-secondary" />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
      case 'Команда':
        if (selectedMember) {
          return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 md:p-12 max-w-6xl mx-auto w-full h-full overflow-y-auto proji-scrollbar pb-32">
              <div className="flex items-center gap-4 mb-10">
                <button onClick={() => setSelectedMember(null)} className="p-2 hover:bg-proji-sidebar rounded-full transition-all border border-transparent hover:border-proji-border">
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-proji-dark text-white flex items-center justify-center text-2xl font-bold font-mono">
                    {selectedMember.name[0]}
                  </div>
                  <div>
                    <h2 className="text-3xl font-light text-proji-dark">{selectedMember.name}</h2>
                    <p className="text-[11px] text-proji-secondary font-bold uppercase tracking-widest">{selectedMember.role} • {selectedMember.status}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Key Metrics / Dashboard */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {selectedMember.kpis?.map((kpi: any, idx: number) => (
                      <div key={idx} className="task-card !p-6 flex flex-col justify-between h-full bg-proji-bg">
                        <div className="flex justify-between items-start mb-4">
                          <p className="text-[9px] font-black uppercase text-proji-secondary tracking-widest">{kpi.label}</p>
                          <Activity size={14} className="text-proji-amber" />
                        </div>
                        <div>
                          <p className="text-3xl font-light text-proji-dark mb-2">{kpi.value}%</p>
                          <div className="h-1.5 w-full bg-proji-sidebar rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }} 
                              animate={{ width: `${(kpi.value / (kpi.target || 100)) * 100}%` }}
                              className={`h-full ${kpi.value >= (kpi.target || 100) ? 'bg-proji-success' : 'bg-proji-amber'}`}
                            />
                          </div>
                          <p className="text-[10px] text-proji-secondary mt-2">Цель: {kpi.target || 100}%</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Plan-Fact Chart */}
                  <div className="task-card !p-8 bg-proji-bg h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xs font-bold uppercase tracking-widest text-proji-secondary">Динамика: План / Факт</h3>
                       <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-sm bg-proji-secondary/20" />
                             <span className="text-[10px] font-bold text-proji-secondary uppercase">План</span>
                          </div>
                          <div className="flex items-center gap-2">
                             <div className="w-3 h-3 rounded-sm bg-proji-amber" />
                             <span className="text-[10px] font-bold text-proji-amber uppercase">Факт</span>
                          </div>
                       </div>
                    </div>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedMember.planFact || []}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }}
                            dy={10}
                          />
                          <YAxis hide />
                          <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                          />
                          <Line type="monotone" dataKey="plan" stroke="#e5e7eb" strokeWidth={3} strokeDasharray="5 5" dot={false} />
                          <Line type="monotone" dataKey="fact" stroke="#f5a623" strokeWidth={4} dot={{ r: 4, fill: '#f5a623', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 pt-4 border-t border-proji-border grid grid-cols-2 gap-4">
                        <div className="p-4 bg-proji-sidebar rounded-2xl">
                          <p className="text-[8px] font-black uppercase text-proji-secondary mb-1">Средний факт</p>
                          <p className="text-xl font-bold text-proji-dark">
                            {selectedMember.planFact && selectedMember.planFact.length > 0 
                              ? (selectedMember.planFact.reduce((acc: number, cur: any) => acc + cur.fact, 0) / selectedMember.planFact.length).toFixed(1)
                              : '0.0'}
                          </p>
                        </div>
                        <div className="p-4 bg-proji-sidebar rounded-2xl">
                          <p className="text-[8px] font-black uppercase text-proji-secondary mb-1">Выполнение</p>
                          <p className="text-xl font-bold text-proji-success">92%</p>
                        </div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="task-card !p-8 bg-proji-bg">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xs font-black uppercase tracking-[0.2em] text-proji-secondary">Текущий фокус задач</h3>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-proji-amber" />
                          <span className="text-[9px] font-bold text-proji-secondary uppercase">В работе</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-proji-success" />
                          <span className="text-[9px] font-bold text-proji-secondary uppercase">Готово</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {(selectedMember.tasks || []).map((task: any, i: number) => {
                        const isObject = typeof task === 'object';
                        const title = isObject ? task.title : task;
                        const status = isObject ? task.status : 'pending';
                        
                        return (
                          <div key={i} className="flex items-center justify-between p-5 bg-proji-sidebar/40 border border-proji-border rounded-[24px] group hover:bg-white hover:shadow-xl hover:shadow-proji-dark/5 transition-all">
                             <div className="flex items-center gap-5">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                  status === 'completed' || status === 'done' 
                                    ? 'bg-proji-success/10 text-proji-success' 
                                    : 'bg-proji-amber/10 text-proji-amber'
                                }`}>
                                  {status === 'completed' || status === 'done' ? <CheckCircle2 size={16} /> : <Zap size={16} />}
                                </div>
                                <div>
                                  <p className={`text-sm font-bold transition-all ${status === 'completed' || status === 'done' ? 'text-proji-secondary line-through opacity-70' : 'text-proji-dark'}`}>
                                    {title}
                                  </p>
                                  <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-40">
                                    {status === 'completed' || status === 'done' ? 'Завершено' : 'Активно'}
                                  </p>
                                </div>
                             </div>
                             <button className="p-2 opacity-0 group-hover:opacity-100 transition-all text-proji-secondary hover:text-proji-dark">
                               <Settings2 size={14} />
                             </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Basic Functions / Skills */}
                  <div className="task-card !p-8 bg-proji-dark text-proji-bg">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-proji-bg/40 mb-6">Основные функции</h3>
                    <div className="flex flex-wrap gap-2">
                      {(selectedMember.functions || []).map((func: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:border-proji-amber transition-all">
                          {func}
                        </span>
                      ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/10">
                       <p className="text-[9px] uppercase font-bold text-white/40 mb-4 tracking-widest">Профиль компетенций</p>
                       <div className="space-y-4">
                          {['Надежность', 'Скорость', 'Инновационность'].map((skill, i) => (
                            <div key={i}>
                               <div className="flex justify-between text-[10px] uppercase font-bold mb-1.5">
                                  <span>{skill}</span>
                                  <span>{85 + i * 5}%</span>
                               </div>
                               <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className={`h-full bg-proji-amber`} style={{ width: `${85 + i * 5}%` }} />
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="task-card !p-8 h-full bg-proji-bg">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-proji-secondary mb-6">Активность</h3>
                    <div className="space-y-6">
                      {[
                        { time: '2ч назад', action: 'Завершил аудит', type: 'doc' },
                        { time: 'Вчера', action: 'Добавил 5 подзадач', type: 'task' },
                        { time: '2 дня назад', action: 'Обновил статус OKR', type: 'goal' }
                      ].map((item, i) => (
                        <div key={i} className="flex gap-4 relative">
                          {i !== 2 && <div className="absolute left-1.5 top-5 w-[1px] h-full bg-proji-border" />}
                          <div className="w-3 h-3 rounded-full bg-proji-amber ring-4 ring-proji-bg z-10" />
                          <div>
                            <p className="text-[10px] font-bold text-proji-dark mb-1">{item.action}</p>
                            <p className="text-[9px] text-proji-secondary uppercase font-bold tracking-widest">{item.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        }
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 md:p-12 max-w-5xl mx-auto w-full h-full overflow-y-auto proji-scrollbar pb-32">
            <div className="flex justify-between items-center mb-12">
              
              <button 
                onClick={() => setActiveView('Геймификация')}
                className="flex items-center gap-2 px-4 py-2 bg-proji-amber/10 border border-proji-amber/20 rounded-xl text-proji-amber text-[10px] font-bold uppercase tracking-widest hover:bg-proji-amber hover:text-white transition-all shadow-sm"
              >
                <Trophy size={14} />
                KPI & Геймификация
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(domainViewData[currentDomain].team || [
                { 
                  name: 'Специалист ИИ', role: 'AI Эксперт ' + currentDomain, status: 'В сети', 
                  tasks: [{ title: 'Анализ данных домена', status: 'pending' }, { title: 'Оптимизация процессов', status: 'completed' }], 
                  kpis: [{ label: 'Точность', value: 98, target: 95 }, { label: 'Скорость', value: 92, target: 90 }], 
                  planFact: [{ month: 'Янв', plan: 100, fact: 110 }, { month: 'Фев', plan: 100, fact: 105 }], 
                  functions: ['Data Science', 'Process Optimization'],
                  efficiencyBreakdown: [{ name: 'Анализ', value: 70 }, { name: 'Код', value: 20 }, { name: 'Митинги', value: 10 }]
                },
                { 
                  name: 'Менеджер Проекта', role: 'PM ' + currentDomain, status: 'В сети', 
                  tasks: [{ title: 'Контроль дедлайнов', status: 'pending' }, { title: 'Ресурс-менеджмент', status: 'pending' }], 
                  kpis: [{ label: 'Дедлайны', value: 100, target: 100 }], 
                  planFact: [{ month: 'Янв', plan: 10, fact: 10 }, { month: 'Фев', plan: 10, fact: 12 }], 
                  functions: ['Management', 'Agile', 'Scrum'],
                  efficiencyBreakdown: [{ name: 'Митинги', value: 50 }, { name: 'Планирование', value: 40 }, { name: 'Отчеты', value: 10 }]
                }
              ]).map((member: any, i: number) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedMember(member)}
                  className="task-card flex flex-col gap-4 group hover:border-proji-dark transition-all !p-6 cursor-pointer bg-proji-bg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-proji-sidebar border border-proji-border flex items-center justify-center font-bold text-proji-dark group-hover:border-proji-amber transition-all">
                      {member.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-proji-dark group-hover:text-proji-amber transition-colors">{member.name}</p>
                      <p className="text-[10px] text-proji-secondary uppercase tracking-widest font-bold">{member.role}</p>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-proji-secondary flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-proji-success" />
                     {member.status}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'Геймификация':
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-12 max-w-6xl mx-auto w-full overflow-y-auto h-full scrollbar-hide pb-32">
            
            <div className="space-y-4">
              {['Деловое предложение от Партнера', 'Обновление статуса проекта', 'Новое уведомление от системы'].map((msg, i) => (
                <div key={i} className="task-card flex items-center justify-between hover:border-proji-amber cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <Mail size={18} className="text-proji-secondary" />
                    <span className="text-sm font-medium">{msg}</span>
                  </div>
                  <span className="text-[10px] text-proji-secondary uppercase">2 часа назад</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'Задачи':
      case 'Доска задач':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 md:p-12 w-full h-full overflow-hidden flex flex-col">
            
            <div className="flex-1 flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
              {['В очереди', 'В процессе', 'Ревью', 'Готово'].map((column) => (
                <div key={column} className="min-w-[280px] md:min-w-[300px] w-[280px] md:w-[300px] flex flex-col gap-4 snap-center">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-proji-secondary">{column}</h3>
                    <button className="text-proji-secondary hover:text-proji-dark"><Plus size={14} /></button>
                  </div>
                  <div className="flex-1 bg-proji-sidebar/50 rounded-2xl p-4 gap-4 flex flex-col border border-proji-border">
              {allTasks.filter(t => (column === 'В очереди' && t.status === 'pending' && !t.id.includes('journal')) || (column === 'В процессе' && t.id.includes('journal')) || (column === 'Готово' && t.status === 'completed')).map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => { setSelectedTask(task); setIsTaskModalOpen(true); }}
                        className="task-card cursor-pointer hover:border-proji-amber transition-all border-l-4 border-proji-amber"
                      >
                        <p className="text-sm font-bold mb-3">{task.title}</p>
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {task.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-proji-sidebar border border-proji-border rounded text-[8px] font-black uppercase text-proji-secondary">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-proji-dark text-white text-[8px] flex items-center justify-center font-bold">
                                {task.id.includes('journal') ? 'AI' : 'SS'}
                              </div>
                              <span className="text-[10px] text-proji-secondary uppercase">2 мая</span>
                           </div>
                           {task.id.includes('journal') && (
                              <div className="p-1 bg-proji-amber/10 rounded-md text-proji-amber">
                                <History size={10} />
                              </div>
                           )}
                        </div>
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        const res = prompt('Введите название задачи и теги через запятую (например: "Дизайн, UI, UX")');
                        if (res) {
                          const parts = res.split(',');
                          const title = parts[0].trim();
                          const tags = parts.slice(1).map(s => s.trim()).filter(s => s);
                          handleCreateTask(title, tags);
                        }
                      }}
                      className="w-full py-3 border border-dashed border-proji-border rounded-xl text-[10px] uppercase font-bold tracking-widest text-proji-secondary hover:border-proji-amber hover:text-proji-amber transition-all"
                    >
                      Добавить карточку
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'Документы':
        return (
          <div className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {(allDocs[currentDomain] || []).map((doc: any, i: number) => (
                <button 
                  key={i} 
                  onClick={() => { setSelectedFile(doc); navigateToView('Просмотр файла'); }}
                  className="task-card flex flex-col group cursor-pointer hover:border-proji-amber transition-all overflow-hidden text-left w-full"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`p-4 rounded-2xl ${
                      doc.type === 'excel' ? 'bg-green-100/10 text-green-600' :
                      doc.type === 'word' ? 'bg-blue-100/10 text-blue-600' :
                      'bg-purple-100/10 text-purple-600'
                    }`}>
                      {doc.type === 'excel' ? <BarChart3 size={24} /> : 
                       doc.type === 'word' ? <FileText size={24} /> : 
                       <Code2 size={24} />}
                    </div>
                    <div className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight size={16} className="text-proji-secondary" />
                    </div>
                  </div>
                  <h3 className="font-bold mb-1 truncate text-proji-text">{doc.name}</h3>
                  <div className="flex items-center justify-between text-[10px] text-proji-secondary uppercase tracking-widest">
                    <span>{doc.size}</span>
                    <span>{doc.date}</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-proji-border flex gap-2">
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-proji-sidebar rounded text-proji-secondary">{doc.type.toUpperCase()}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 bg-proji-sidebar rounded text-proji-amber">V1.2</span>
                  </div>
                </button>
              ))}
              <div className="task-card border-dashed flex flex-col items-center justify-center py-10 gap-4 cursor-pointer hover:bg-proji-sidebar transition-colors">
                <div className="w-12 h-12 rounded-full bg-proji-sidebar flex items-center justify-center text-proji-secondary">
                  <Plus size={24} />
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-proji-secondary">Загрузить новый</p>
              </div>
            </div>
          </div>
        );
      case 'Просмотр файла': {
        const docPages = selectedFile?.pages || (selectedFile?.content ? [selectedFile.content] : ['Контент отсутствует']);
        const isExcel = selectedFile?.type === 'excel';
        const excelData = selectedFile?.data || { headers: [], rows: [] };

        const handleSaveEdit = () => {
          setIsEditingDoc(false);
          alert('Изменения сохранены локально');
        };

        return (
          <div className="flex h-full w-full bg-proji-bg relative overflow-hidden flex-col">
            {/* Action Bar Above Document */}
            <div className="flex items-center justify-between px-12 py-6 border-b border-proji-border bg-proji-bg z-10 shrink-0">
               <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 group relative cursor-default">
                    <h2 className="text-2xl font-bold text-proji-text">{selectedFile?.name || 'Документ'}</h2>
                    
                    {/* Metadata on Hover */}
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all ml-2 translate-x-4 group-hover:translate-x-0">
                       <span className="w-1.5 h-1.5 rounded-full bg-proji-amber" />
                       <div className="flex gap-4 text-[10px] uppercase font-bold tracking-[0.2em] text-proji-secondary">
                          <span className="flex items-center gap-1.5"><User size={10} /> {selectedFile?.author || 'Аноним'}</span>
                          <span className="flex items-center gap-1.5"><Calendar size={10} /> {selectedFile?.date || '---'}</span>
                          <span className="flex items-center gap-1.5"><HardDrive size={10} /> {selectedFile?.size || '0 KB'}</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                 <div className="flex bg-proji-sidebar p-1 rounded-2xl border border-proji-border shadow-sm">
                    <button 
                      onClick={() => setIsEditingDoc(!isEditingDoc)}
                      className={`flex items-center gap-2 px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${isEditingDoc ? 'bg-proji-dark text-white shadow-lg' : 'hover:bg-white text-proji-secondary'}`}
                    >
                      <Layers size={14} />
                      {isEditingDoc ? 'Предпросмотр' : 'Редактировать'}
                    </button>
                    {!isEditingDoc && (
                      <div className="flex gap-1 ml-1 pl-1 border-l border-proji-border">
                        <button className="p-2 text-proji-secondary hover:text-proji-dark hover:bg-white rounded-xl transition-all" title="Анализ рисков"><Shield size={16} /></button>
                        <button className="p-2 text-proji-secondary hover:text-proji-dark hover:bg-white rounded-xl transition-all" title="Рекомендации"><Zap size={16} /></button>
                        <button className="p-2 text-proji-secondary hover:text-proji-dark hover:bg-white rounded-xl transition-all" title="Результаты"><BarChart3 size={16} /></button>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-12 py-10 scrollbar-hide bg-[#fdfdfd]">
              <div className="max-w-5xl mx-auto w-full mb-20">
                
                {/* External Action Buttons */}
                <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                   {[
                     { label: 'Анализ рисков', icon: Shield, color: 'text-blue-500', bg: 'bg-blue-50' },
                     { label: 'Рекомендации', icon: Zap, color: 'text-proji-amber', bg: 'bg-proji-amber/5' },
                     { label: 'Результаты', icon: BarChart3, color: 'text-green-500', bg: 'bg-green-50' }
                   ].map((btn, i) => (
                     <button key={i} className="flex items-center gap-3 px-6 py-3.5 bg-white border border-proji-border rounded-2xl text-[11px] font-bold uppercase tracking-wider hover:border-proji-dark hover:shadow-md transition-all shrink-0">
                        <btn.icon size={16} className={btn.color} />
                        {btn.label}
                     </button>
                   ))}
                </div>

                {/* Content Area */}
                {isExcel ? (
                  <div className="task-card bg-white border-proji-border p-0 overflow-hidden shadow-2xl min-h-[600px] flex flex-col">
                    <div className="bg-proji-sidebar/50 p-4 border-b border-proji-border flex items-center justify-between px-8">
                       <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-proji-secondary flex items-center gap-2">
                         <BarChart3 size={12} className="text-green-600" />
                         Microsoft Excel • {selectedFile?.name}
                       </span>
                       <div className="flex gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400/30" />
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/30" />
                          <div className="w-2.5 h-2.5 rounded-full bg-green-400/30" />
                       </div>
                    </div>
                    <div className="flex-1 overflow-auto bg-[#fafafa]">
                      <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                        <thead>
                          <tr className="bg-white border-b border-proji-border sticky top-0 z-10 shadow-sm">
                            <th className="p-3 text-[10px] font-bold uppercase tracking-widest text-proji-secondary border-r border-proji-border w-12 text-center bg-proji-sidebar">#</th>
                            {excelData.headers.map((h: string, idx: number) => (
                              <th key={idx} className="p-4 text-[11px] font-bold uppercase tracking-widest text-proji-dark border-r border-proji-border bg-white">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {excelData.rows.map((row: any[], rowIdx: number) => (
                            <tr key={rowIdx} className="hover:bg-proji-amber/5 transition-colors border-b border-proji-border/50 group">
                              <td className="p-3 text-[10px] font-mono text-proji-secondary border-r border-proji-border/50 bg-proji-sidebar/20 text-center font-bold">{rowIdx + 1}</td>
                              {row.map((cell: any, cellIdx: number) => (
                                <td key={cellIdx} className="p-4 text-[13px] font-medium text-proji-dark border-r border-proji-border/50 bg-white group-hover:bg-transparent">
                                  {isEditingDoc ? (
                                    <input 
                                      type="text" 
                                      className="w-full bg-transparent outline-none focus:text-proji-amber font-medium" 
                                      value={cell} 
                                      onChange={() => {}} 
                                    />
                                  ) : cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                          {Array.from({ length: 20 }).map((_, i) => (
                            <tr key={`empty-${i}`} className="border-b border-proji-border/30 h-10 group">
                               <td className="border-r border-proji-border/30 bg-proji-sidebar/20" />
                               {excelData.headers.map((_: any, j: number) => (
                                 <td key={j} className="border-r border-proji-border/30 bg-white group-hover:bg-proji-bg/10" />
                               ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="task-card bg-white border-proji-border p-20 shadow-2xl relative min-h-[800px] flex flex-col">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-proji-amber/5 pointer-events-none" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />
                    
                    <div className="flex-1">
                      {isEditingDoc ? (
                        <div className="h-full">
                           <div className="flex justify-between items-center mb-8 pb-4 border-b border-proji-border/50">
                              <h3 className="text-[10px] font-bold uppercase tracking-widest text-proji-amber">Режим редактирования</h3>
                              <span className="text-[10px] text-proji-secondary">Страница {activePage + 1}</span>
                           </div>
                           <textarea
                             className="w-full h-[600px] bg-transparent outline-none text-[15px] leading-relaxed text-proji-dark font-sans resize-none whitespace-pre-wrap"
                             value={Array.isArray(docPages) ? docPages[activePage] : docPages}
                             onChange={(e) => {
                                if (Array.isArray(docPages)) {
                                  const next = [...docPages];
                                  next[activePage] = e.target.value;
                                  setEditedContent(next);
                                } else {
                                  setEditedContent(e.target.value);
                                }
                             }}
                             placeholder="Введите текст документа..."
                           />
                        </div>
                      ) : (
                        <div className="prose prose-slate max-w-none prose-sm leading-relaxed whitespace-pre-wrap text-proji-dark font-sans">
                          <div className="mb-16 flex justify-between items-start">
                             <div className="flex flex-col gap-2">
                                <div className="h-10 w-24 bg-proji-dark flex items-center justify-center text-white text-[8px] font-black tracking-[0.3em] rounded-sm">PROJI CORP</div>
                                <div className="text-[8px] font-bold text-proji-secondary uppercase tracking-[0.2em]">{currentDomain} DOMAIN ASSET</div>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary">Документ ID</p>
                                <p className="text-[10px] font-bold text-proji-dark">#PJ-{Date.now().toString().slice(-6)}</p>
                                <p className="text-[10px] font-bold text-proji-secondary uppercase tracking-widest mt-2">Страница</p>
                                <p className="text-[10px] font-bold text-proji-dark">{activePage + 1} / {docPages.length}</p>
                             </div>
                          </div>
                          
                          <h1 className="text-4xl font-light mb-12 text-proji-dark border-b border-proji-border pb-8 leading-tight">
                            {selectedFile?.name.replace(/\.[^/.]+$/, "")}
                          </h1>
                          
                          <div className="text-[15px] leading-relaxed text-proji-dark/80">
                            {docPages[activePage]}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Page Navigation */}
                    {docPages.length > 1 && !isExcel && (
                      <div className="mt-20 pt-10 border-t border-proji-border/40 flex items-center justify-between gap-4">
                        <button 
                          disabled={activePage === 0}
                          onClick={() => setActivePage(prev => Math.max(0, prev - 1))}
                          className="flex items-center gap-2 px-6 py-2.5 bg-proji-sidebar rounded-xl disabled:opacity-20 hover:bg-proji-amber/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                        >
                          <ChevronLeft size={16} /> Назад
                        </button>
                        
                        <div className="flex gap-2">
                           {docPages.map((_: any, idx: number) => (
                             <button
                               key={idx}
                               onClick={() => setActivePage(idx)}
                               className={`w-10 h-10 rounded-xl text-[11px] font-bold transition-all ${activePage === idx ? 'bg-proji-dark text-white shadow-xl scale-110' : 'bg-proji-sidebar text-proji-secondary hover:bg-proji-border'}`}
                             >
                               {idx + 1}
                             </button>
                           ))}
                        </div>

                        <button 
                          disabled={activePage === docPages.length - 1}
                          onClick={() => setActivePage(prev => Math.min(docPages.length - 1, prev + 1))}
                          className="flex items-center gap-2 px-6 py-2.5 bg-proji-sidebar rounded-xl disabled:opacity-20 hover:bg-proji-amber/10 transition-all text-[10px] font-bold uppercase tracking-widest"
                        >
                          Далее <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {isEditingDoc && (
                  <div className="mt-10 flex justify-end gap-4">
                     <button 
                       onClick={() => setIsEditingDoc(false)}
                       className="px-10 py-3.5 text-xs font-bold uppercase tracking-widest text-proji-secondary hover:text-proji-dark transition-all"
                     >
                       Отмена
                     </button>
                     <button 
                       onClick={handleSaveEdit}
                       className="px-12 py-3.5 bg-proji-dark text-white rounded-2xl text-[11px] font-bold uppercase tracking-widest shadow-2xl hover:bg-black transition-all flex items-center gap-3 active:scale-95"
                     >
                       <Save size={16} /> Сохранить изменения
                     </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      }
      case 'Все сценарии':
        return (
          <div className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {[...scenarios, ...scenarios].map((s, i) => (
                <div 
                  key={i} 
                  className="task-card hover:border-proji-amber cursor-pointer group" 
                  onClick={() => { 
                    setInputText(s.text); 
                    setIsAiMinimized(false);
                    setShowBottomBar(true);
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-proji-sidebar group-hover:bg-proji-amber/10 transition-colors">
                      <s.icon size={20} className="text-proji-amber" />
                    </div>
                    <div>
                      <h4 className="font-bold mb-1 text-proji-text">{s.title}</h4>
                      <p className="text-xs text-proji-secondary leading-relaxed">
                        {renderHighlightedText(s.text)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Прямой эфир':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
            <div className="flex items-center justify-between mb-12">
              
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-proji-success animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-proji-secondary">Система активна</span>
              </div>
            </div>
            <div className="space-y-4">
              {[
                { time: '14:22', event: 'Новый лид из SEO кампании', status: 'info' },
                { time: '14:15', event: 'Отчет P&L сгенерирован ИИ', status: 'success' },
                { time: '13:50', event: 'Обнаружено аномальное изменение OKR', status: 'warning' },
                { time: '13:45', event: 'Анна К. обновила Дорожную карту', status: 'info' }
              ].map((log, i) => (
                <div key={i} className="flex items-center gap-6 p-4 border-b border-proji-border text-xs">
                  <span className="font-mono text-proji-secondary">{log.time}</span>
                  <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'success' ? 'bg-proji-success' : log.status === 'warning' ? 'bg-proji-amber' : 'bg-proji-dark'}`} />
                  <span className="font-medium">{log.event}</span>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'Конкуренты':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { name: 'Competitor A', strength: 'Высокая цена', weakness: 'Плохой UI', marketShare: '15%' },
                { name: 'Competitor B', strength: 'Сильная команда', weakness: 'Медленно', marketShare: '22%' }
              ].map((comp, i) => (
                <div key={i} className="task-card">
                  <h3 className="text-lg font-bold mb-4">{comp.name}</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-[11px] uppercase tracking-wider">
                      <span className="text-proji-secondary">Доля рынка</span>
                      <span className="font-bold">{comp.marketShare}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-proji-success/10 text-proji-success text-[10px] font-bold rounded">СИЛА: {comp.strength}</span>
                    <span className="px-2 py-1 bg-proji-amber/10 text-proji-amber text-[10px] font-bold rounded">РИСК: {comp.weakness}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'Ресурсы':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'Облачные вычисления', usage: '78%', icon: Globe },
                { name: 'Бюджет проекта', usage: '42%', icon: BarChart3 },
                { name: 'API лимиты', usage: '15%', icon: Code2 },
                { name: 'Лицензии ПО', usage: '90%', icon: Shield }
              ].map((res, i) => (
                <div key={i} className="task-card flex flex-col items-center text-center">
                   <div className="p-4 bg-proji-sidebar rounded-2xl mb-4 text-proji-secondary">
                      <res.icon size={24} />
                   </div>
                   <p className="text-xs font-bold uppercase mb-2">{res.name}</p>
                   <p className={`text-sm font-bold ${parseInt(res.usage) > 85 ? 'text-proji-amber' : 'text-proji-dark'}`}>{res.usage}</p>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'Логистика':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
             
             <div className="space-y-4">
                {[
                  { ship: 'Заказ #8821', destination: 'Берлин', status: 'В пути', eta: '2 дня' },
                  { ship: 'Заказ #8822', destination: 'Токио', status: 'Таможня', eta: '5 дней' },
                  { ship: 'Заказ #8823', destination: 'Лондон', status: 'Доставлено', eta: '-' }
                ].map((item, i) => (
                  <div key={i} className="task-card flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Truck size={20} className="text-proji-secondary" />
                      <div>
                        <p className="font-bold text-sm">{item.ship}</p>
                        <p className="text-[10px] text-proji-secondary uppercase tracking-widest">{item.destination}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <span className="text-[10px] font-bold uppercase tracking-widest block mb-1">{item.status}</span>
                       <span className="text-[11px] text-proji-secondary">{item.eta}</span>
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        );
      case 'SEO':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 max-w-5xl mx-auto w-full overflow-y-auto h-full scrollbar-hide">
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="task-card">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-proji-secondary mb-6">Здоровье сайта</h3>
                   <div className="flex items-center justify-center h-32 relative">
                      <div className="text-4xl font-light text-proji-success">98</div>
                      <div className="absolute inset-0 border-[6px] border-proji-success rounded-full opacity-10" />
                   </div>
                </div>
                <div className="task-card">
                   <h3 className="text-xs font-bold uppercase tracking-widest text-proji-secondary mb-6">Ключевые слова</h3>
                   <div className="space-y-3">
                      {['Proji AI', 'Business automation', 'AI Ops'].map(kw => (
                        <div key={kw} className="flex justify-between text-xs border-b border-proji-border pb-2">
                           <span>{kw}</span>
                           <span className="text-proji-success font-bold">↑ 4</span>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
          </motion.div>
        );
      case 'Обсуждения':
        return (
          <div className="w-full max-w-[1320px] flex-1 flex flex-col mx-auto px-6 overflow-hidden relative">
            <div className="flex-1 overflow-y-auto pt-10 pb-24 space-y-8 scrollbar-hide">
              <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
                 <Mail size={48} className="mb-4" />
                 <p className="text-lg font-light uppercase tracking-widest">Начните новое обсуждение</p>
              </div>
            </div>
          </div>
        );
      case 'Журнал оборудования':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 w-full h-full overflow-y-auto proji-scrollbar pb-32">
            <div className="flex justify-between items-end mb-12">
               
                 <div className="flex gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-proji-sidebar rounded-xl border border-proji-border">
                       <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                       <span className="text-[9px] font-bold uppercase tracking-widest text-proji-dark">2 Критических ремонта</span>
                    </div>
                 </div>
              </div>
              <div className="flex-1 flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
                {['Запланировано', 'В очереди', 'В процессе', 'Тестирование'].map((column) => (
                  <div key={column} className="min-w-[320px] w-[320px] flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2 mb-2">
                      <h3 className="text-xs uppercase font-bold tracking-[0.2em] text-proji-secondary">{column}</h3>
                      <div className="w-6 h-6 rounded-lg bg-proji-sidebar flex items-center justify-center text-[10px] font-bold text-proji-secondary">{column === 'Запланировано' ? '4' : '0'}</div>
                    </div>
                    <div className="flex-1 bg-proji-sidebar/50 rounded-[32px] p-4 gap-4 flex flex-col border border-proji-border">
                      {column === 'Запланировано' && equipmentLog.filter(e => e.health < 60).map(eq => (
                        <div key={eq.id} className="task-card !p-6 border-l-4 border-red-500 bg-white shadow-md hover:scale-105 transition-all cursor-pointer">
                           <p className="text-sm font-bold text-proji-dark mb-3">{eq.name}</p>
                           <div className="flex justify-between items-center">
                              <span className="text-[9px] font-black uppercase text-red-500 bg-red-500/10 px-2 py-1 rounded">КРИТИЧЕСКИЙ УРОВЕНЬ</span>
                              <div className="flex -space-x-2">
                                 <div className="w-6 h-6 rounded-full bg-proji-dark text-white text-[8px] flex items-center justify-center border-2 border-white">EK</div>
                                 <div className="w-6 h-6 rounded-full bg-proji-secondary text-white text-[8px] flex items-center justify-center border-2 border-white">+2</div>
                              </div>
                           </div>
                        </div>
                      ))}
                      <button className="w-full py-4 border border-dashed border-proji-border rounded-2xl text-[10px] uppercase font-bold tracking-[0.2em] text-proji-secondary hover:border-proji-amber hover:text-proji-amber transition-all">
                        Перетащите сюда
                      </button>
                    </div>
                  </div>
                ))}
              </div>
           </motion.div>
        );
      case 'Дерево целей':
        return <GoalsTreeView prevView={prevView} />;
      case 'Страницы':
      case 'Дерево страниц':
        return <PagesTreeView prevView={prevView} navigateToView={navigateToView} />;
      case 'Задачи проекта':
        return <ProjectTasksView prevView={prevView} project={selectedProject} navigateToView={navigateToView} />;
      case 'Профиль сотрудника':
        return <EmployeeProfileView prevView={prevView} />;
      case 'Проекты':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 w-full h-full overflow-y-auto proji-scrollbar pb-32">
            <div className="flex justify-between items-end mb-12">
            </div>

             <div className="grid grid-cols-12 gap-8">
                {/* Left Column: Business Setup & Research */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                   <div className="p-10 bg-white border border-proji-border rounded-[40px] shadow-sm">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-proji-dark mb-6 flex items-center gap-2">
                        <BookOpen size={14} className="text-proji-amber" /> Архитектура
                      </h4>
                      <div className="space-y-6">
                        <div>
                          <p className="text-[9px] font-black uppercase text-proji-secondary mb-1">Задача</p>
                          <p className="text-sm font-bold text-proji-dark leading-snug">{selectedProject.taskObjective}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-proji-secondary mb-1">Цель</p>
                          <p className="text-sm font-bold text-proji-dark leading-snug">{selectedProject.strategicGoal}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase text-proji-secondary mb-1">Research Root</p>
                          <p className="text-[11px] font-medium text-proji-secondary leading-relaxed italic border-l-2 border-proji-amber pl-3">{selectedProject.originResearch}</p>
                        </div>
                      </div>
                   </div>

                   <div className="p-10 bg-proji-dark rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                      <div className="relative z-10">
                         <div className="flex justify-between items-center mb-8">
                            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/50">Pulse Metric</span>
                            <Activity size={20} className="text-proji-amber" />
                         </div>
                         <div className="mb-4">
                            <span className="text-6xl font-light tracking-tighter">{selectedProject.progress}%</span>
                            <p className="text-xs text-white/50 mt-2 font-bold uppercase tracking-widest">Completion Momentum</p>
                         </div>
                      </div>
                      <div className="absolute bottom-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                         <Target size={160} />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-8 bg-white border border-proji-border rounded-3xl">
                         <p className="text-[10px] font-black uppercase text-proji-secondary mb-2 tracking-widest">Budget Rate</p>
                         <p className="text-2xl font-bold text-proji-dark">{selectedProject.roi}</p>
                      </div>
                      <div className="p-8 bg-white border border-proji-border rounded-3xl">
                         <p className="text-[10px] font-black uppercase text-proji-secondary mb-2 tracking-widest">Risk Factor</p>
                         <p className={`text-2xl font-bold ${selectedProject.riskLevel === 'High' ? 'text-red-500' : 'text-proji-success'}`}>{selectedProject.riskLevel}</p>
                      </div>
                   </div>

                   <div className="p-8 bg-proji-sidebar/30 rounded-[32px] border border-proji-border">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-proji-dark mb-6">Ближайшие вехи</h4>
                      <div className="space-y-4">
                         {selectedProject.milestones.map((m, i) => (
                           <div key={i} className="flex items-center gap-4">
                              <div className="w-2 h-2 rounded-full bg-proji-amber" />
                              <span className="text-xs font-bold text-proji-dark">{m}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                {/* Right Column: Active Management Tiles */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="p-10 bg-white border border-proji-border rounded-[40px] shadow-sm">
                         <div className="flex justify-between items-center mb-8">
                            <h4 className="text-xs font-black uppercase tracking-widest text-proji-dark">Исполнение задач</h4>
                            <button onClick={() => navigateToView('Доска задач')} className="text-[10px] font-bold text-proji-amber uppercase tracking-widest hover:underline">Открыть задачи</button>
                         </div>
                         <div className="space-y-4">
                            {selectedProject.tasks.map((t, idx) => (
                               <div key={idx} className="flex items-center justify-between p-4 bg-proji-sidebar/50 rounded-2xl border border-transparent hover:border-proji-border transition-all">
                                  <div className="flex items-center gap-3">
                                     <div className={`p-1.5 rounded-lg ${t.status === 'done' ? 'bg-proji-success/10 text-proji-success' : 'bg-proji-amber/10 text-proji-amber'}`}>
                                        {t.status === 'done' ? <CheckCircle2 size={12} /> : <RefreshCw size={12} className="animate-spin" />}
                                     </div>
                                     <span className="text-[11px] font-bold text-proji-dark">{t.title}</span>
                                  </div>
                                  <ChevronRight size={14} className="text-proji-secondary" />
                               </div>
                            ))}
                         </div>
                      </div>

                      <div className="p-10 bg-white border border-proji-border rounded-[40px] shadow-sm">
                         <div className="flex justify-between items-center mb-8">
                            <h4 className="text-xs font-black uppercase tracking-widest text-proji-dark">Фреймворки</h4>
                            <button onClick={() => { setSelectedProject(selectedProject); setIsProjectModalOpen(true); }} className="text-[10px] font-bold text-proji-amber uppercase tracking-widest hover:underline">Подробнее</button>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            {['SWOT', 'Stakeholders', 'Pain Points'].map((f) => (
                               <div key={f} className="p-6 bg-proji-sidebar/20 rounded-2xl text-center border border-proji-border/30 hover:border-proji-dark transition-all cursor-pointer">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-proji-dark">{f}</p>
                                  <p className="text-[8px] text-proji-secondary mt-1">Ready to edit</p>
                               </div>
                            ))}
                            <div className="p-6 bg-proji-dark text-white rounded-2xl text-center flex items-center justify-center cursor-pointer hover:bg-black transition-all">
                               <Plus size={16} />
                            </div>
                         </div>
                      </div>
                   </div>

                   <div className="p-10 border border-proji-border bg-white rounded-[40px]">
                      <div className="flex justify-between items-center mb-10">
                         <h4 className="text-xs font-black uppercase tracking-widest text-proji-dark">Журнал изменений</h4>
                         <span className="text-[10px] text-proji-secondary font-bold">Последний раз редактировал: {selectedProject.lastEditedBy}</span>
                      </div>
                      <div className="space-y-6">
                         {[
                           { user: 'Анна С.', action: 'Обновила SWOT анализ', time: '2 часа назад', icon: Edit },
                           { user: 'Иван К.', action: 'Завершил задачу "Калибровка"', time: 'Вчера', icon: CheckCircle2 },
                           { user: 'Олег Д.', action: 'Добавил отчет по безопасности', time: '2 дня назад', icon: FilePlus }
                         ].map((event, i) => (
                           <div key={i} className="flex items-center gap-4 group">
                              <div className="w-10 h-10 rounded-full bg-proji-sidebar flex items-center justify-center text-[11px] font-bold text-proji-dark group-hover:bg-proji-dark group-hover:text-white transition-all">
                                 {event.user[0]}
                              </div>
                              <div className="flex-1 border-b border-proji-border pb-6 last:border-0">
                                 <p className="text-[13px] font-bold text-proji-dark mb-1">{event.action}</p>
                                 <p className="text-[10px] text-proji-secondary uppercase font-black tracking-widest">{event.time}</p>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        );
      case 'Создать проект':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-12 w-full h-full overflow-y-auto proji-scrollbar pb-32">
            <div className="max-w-4xl mx-auto">
               <div className="mb-16 flex items-center">
                  <div>
                    <h2 className="text-5xl font-light text-proji-dark tracking-tighter mb-4">Новый Проект</h2>
                    <p className="text-sm text-proji-secondary font-bold uppercase tracking-[0.3em]">Конструктор архитектуры управления</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                  <div className="space-y-12">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-4 block">Название проекта</label>
                        <input 
                          type="text" 
                          placeholder="Введите название..."
                          className="w-full bg-transparent border-b-2 border-proji-border py-4 text-2xl font-light focus:border-proji-amber outline-none transition-all"
                          onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                        />
                     </div>

                     <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-6 block">Методология (Framework)</label>
                        <div className="grid grid-cols-1 gap-3">
                           {[
                             { id: 'Agile', desc: 'Гибкая разработка, итерации, высокая адаптивность' },
                             { id: 'Waterfall', desc: 'Последовательные этапы, строгая фиксация требований' },
                             { id: 'Lean', desc: 'Минимизация потерь, фокус на ценности для клиента' },
                             { id: 'Scrum', desc: 'Спринты, роли, ежедневные синхронизации' },
                             { id: 'Hybrid', desc: 'Комбинация структурного и гибкого подходов' }
                           ].map((f) => (
                             <button 
                               key={f.id}
                               onClick={() => setNewProject({...newProject, framework: f.id as any})}
                               className={`p-6 rounded-3xl border-2 transition-all text-left group ${
                                 newProject.framework === f.id ? 'border-proji-amber bg-proji-amber/5' : 'border-proji-border hover:border-proji-dark'
                               }`}
                             >
                                <div className="flex justify-between items-center mb-1">
                                   <p className="font-bold text-proji-dark text-base tracking-tight">{f.id}</p>
                                   <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${newProject.framework === f.id ? 'border-proji-amber bg-proji-amber' : 'border-proji-border'}`}>
                                      {newProject.framework === f.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                   </div>
                                </div>
                                <p className="text-[11px] text-proji-secondary leading-relaxed">{f.desc}</p>
                             </button>
                           ))}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-12">
                     <div>
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-proji-secondary mb-4 block">Дедлайн проекта</label>
                        <input 
                          type="date" 
                          className="w-full bg-proji-sidebar border border-proji-border rounded-2xl p-6 text-proji-dark font-bold focus:border-proji-amber outline-none transition-all"
                          onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                        />
                     </div>

                     <div className="p-10 bg-proji-dark rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                           <Sparkles size={120} />
                        </div>
                        <h4 className="text-xl font-bold mb-4 relative z-10">AI Рекомендация</h4>
                        <p className="text-sm text-white/70 leading-relaxed italic relative z-10">
                           "Для проектов типа <b>{newProject.framework}</b> в домене <b>{currentDomain}</b> рекомендуется установить 2-недельные контрольные точки и назначить 3-х ответственных лиц со статусом Lead."
                        </p>
                        <button className="mt-8 px-6 py-3 bg-white text-proji-dark rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 hover:scale-105 transition-all">Применить структуру</button>
                     </div>

                     <button 
                        onClick={() => {
                          if (newProject.name) {
                            setProjects([...projects, { ...newProject, id: Date.now().toString() } as Project]);
                            navigateToView('Проекты');
                          }
                        }}
                        className="w-full py-6 bg-proji-amber text-proji-bg rounded-[24px] text-xs font-black uppercase tracking-[0.3em] shadow-2xl shadow-proji-amber/20 hover:scale-[1.02] active:scale-95 transition-all"
                     >
                        Инициализировать Проект
                     </button>
                  </div>
               </div>
            </div>
          </motion.div>
        );
      case 'Схемы ТП':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 w-full h-full overflow-y-auto proji-scrollbar pb-32">
              <div className="bg-proji-sidebar rounded-[32px] p-10 border border-proji-border italic text-proji-secondary leading-relaxed">
                {customPageContent[activeView] || "ТП Схемы."}
              </div>
            </motion.div>
          );
      case 'Дневник ИИ':
      case 'Управленческий Журнал':
        return (
          <div className="w-full max-w-[1320px] flex-1 flex flex-col mx-auto px-6 pt-10 pb-24 overflow-hidden relative">
            <h1 className="text-4xl font-black mb-8 text-proji-dark">Управленческий Журнал</h1>
            <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-proji-border p-8 overflow-y-auto">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4 text-proji-secondary">
                  <History className="w-6 h-6 text-proji-primary" />
                  <p className="font-bold text-proji-dark">Ваши ежедневные заметки и события для анализа ИИ</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-proji-primary font-bold rounded-xl hover:bg-blue-100 transition-colors">
                  <Mic size={16} />
                  <span>Голосовая заметка</span>
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 border border-proji-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-black text-proji-secondary uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-proji-border">Сегодня, 10:45</div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-proji-primary bg-blue-50 px-2 py-1 rounded-md">Встреча</span>
                  </div>
                  <p className="text-sm font-medium text-proji-dark leading-relaxed">Провел встречу с командой разработки. Обсудили ключевые блокеры в спринте. Принято решение увеличить ресурсы на бэкенд.</p>
                </div>
                <div className="bg-gray-50 border border-proji-border rounded-2xl p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-[10px] font-black text-proji-secondary uppercase tracking-widest bg-white px-3 py-1 rounded-lg border border-proji-border">Вчера, 16:30</div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded-md">Клиент</span>
                  </div>
                  <p className="text-sm font-medium text-proji-dark leading-relaxed">Созвон с ключевым клиентом. Утвердили бюджет на следующий квартал. Клиент просит ускорить интеграцию с внешней CRM.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'Управленческий Отчет':
        return (
          <div className="w-full max-w-[1320px] flex-1 flex flex-col mx-auto px-6 pt-10 pb-24 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-black text-proji-dark">Управленческий Отчет</h1>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-proji-dark hover:bg-black text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all">
                <Sparkles size={18} className="text-proji-amber" />
                <span>Сгенерировать ИИ Отчет</span>
              </button>
            </div>
            <div className="flex-1 bg-white rounded-[32px] shadow-sm border border-proji-border p-8 overflow-y-auto">
              <div className="flex flex-col items-center justify-center h-full opacity-60 max-w-md mx-auto text-center">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-proji-primary" />
                </div>
                <p className="text-xl font-bold text-proji-dark mb-2">Отчет не сгенерирован</p>
                <p className="text-sm text-proji-secondary font-medium leading-relaxed">
                  Нажмите кнопку выше, чтобы ИИ проанализировал ваш Управленческий Журнал и составил сводный отчет по проектам, рискам и задачам.
                </p>
              </div>
            </div>
          </div>
        );
      default:
        if (customPageContent[activeView]) {
          return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 w-full h-full overflow-y-auto proji-scrollbar pb-32">
              <div className="bg-proji-sidebar rounded-[32px] p-10 border border-proji-border italic text-proji-secondary leading-relaxed">
                {customPageContent[activeView]}
              </div>
            </motion.div>
          );
        }
        return (
          <div className="w-full max-w-[1320px] flex-1 flex flex-col mx-auto px-6 overflow-hidden relative">
            <div ref={scrollRef} className="flex-1 overflow-y-auto pt-10 pb-32 space-y-8 scrollbar-hide">
              <AnimatePresence>
                {messages.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center min-h-[60vh] text-center w-full px-4 -mt-10 overflow-hidden relative">
                    <div className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none overflow-hidden">
                      <div className="absolute inset-0 bg-white" />
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3], rotate: [0, 5, -5, 0] }} 
                        transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
                        className="w-[1000px] h-[600px] bg-gradient-to-br from-teal-100/50 via-teal-50/50 to-emerald-100/30 blur-[120px] rounded-full mix-blend-multiply"
                      />
                    </div>
                    
                    <div className="relative z-10 mb-8 w-full max-w-4xl px-8 py-10 bg-white/40 backdrop-blur-3xl rounded-[3rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)] flex flex-col items-center">
                      <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 to-teal-400 text-transparent bg-clip-text tracking-tighter mb-6 leading-[1.1] pb-2 text-center">
                        Развивайте и управляйте своей<br /> компанией через ИИ
                      </h1>
                      <p className="text-proji-secondary text-lg font-medium max-w-xl mx-auto text-center">
                        Начните с выбора действия, нужного домена или конкретной функции.
                      </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-3xl mb-12">
                      <div className="w-full">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-proji-secondary/70 mb-4 text-center">Популярные сценарии</h3>
                        <div className="flex flex-wrap justify-center gap-3">
                          {functionsList.map(f => (
                            <button 
                              key={f}
                              onClick={() => { setInputText(f); setIsAiMinimized(false); }}
                              className="px-5 py-3 bg-white border border-proji-border text-proji-dark text-sm font-bold rounded-2xl hover:border-teal-400 hover:shadow-lg hover:shadow-teal-400/10 transition-all active:scale-95 text-center"
                            >
                              {f}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button 
                        onClick={() => navigateToView('Все сценарии' as any)}
                        className="mt-4 px-8 py-4 bg-proji-sidebar border border-transparent rounded-[2rem] text-sm font-bold flex items-center justify-center gap-3 hover:bg-white hover:border-proji-primary hover:text-proji-primary transition-all text-proji-secondary group shadow-sm hover:shadow-xl"
                      >
                        <span className="flex items-center gap-3">
                          <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                          Перейти в библиотеку сценариев
                        </span>
                        <ChevronRight size={16} className="opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-3xl mb-12" />
                  </motion.div>
                )}
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar/Indicator Area */}
                      <div className="flex-shrink-0 mt-1">
                         {msg.role === 'user' ? (
                           <div 
                             className="w-10 h-10 rounded-2xl bg-proji-dark text-white flex items-center justify-center text-[10px] font-bold uppercase tracking-wider group relative"
                             style={{ background: msg.sourceView === 'Просмотр файла' ? '#FAAF3F' : '#1A1A1A' }}
                           >
                              {msg.sourceView?.substring(0, 2).toUpperCase() || 'УЗ'}
                              <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 bg-proji-dark text-white text-[9px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl z-50">
                                Контекст: {msg.sourceView || 'Чат'}
                              </div>
                           </div>
                         ) : (
                           <div className="w-10 h-10 invisible" />
                         )}
                      </div>

                      {/* Content Area */}
                      <div className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        {msg.role === 'user' ? (
                          <div className="user-message py-4 px-6 rounded-3xl bg-proji-dark text-white text-[15px] font-medium leading-relaxed shadow-lg">
                            {renderHighlightedText(msg.text)}
                          </div>
                        ) : (
                          <div className="w-full">
                            {/* Comment Section (Top) */}
                            {msg.comment && (
                              <div className="mb-4 text-[13px] text-proji-secondary italic leading-relaxed pl-1 max-w-[600px]">
                                {msg.comment}
                              </div>
                            )}

                            {/* Main Structured Response Body */}
                            <div className={`rounded-[32px] overflow-hidden max-w-[700px] ${
                              msg.matchingCriteria && msg.matchingCriteria.length >= 5 
                                ? "bg-proji-sidebar border border-proji-border p-6 shadow-sm" 
                                : "bg-transparent border-none p-0"
                            }`}>
                                {msg.text.toLowerCase().includes('узкие места') && (
                                  <BottleneckDashboard domain={currentDomain} />
                                )}

                                {msg.text.toLowerCase().includes('основные данные') && (
                                  <div className="flex flex-wrap gap-4">
                                    <ChartCard 
                                      title="Прогресс за неделю" 
                                      type="line" 
                                      data={[
                                        { name: 'Пн', value: 30 },
                                        { name: 'Вт', value: 45 },
                                        { name: 'Ср', value: 40 },
                                        { name: 'Чт', value: 65 },
                                        { name: 'Пт', value: 60 },
                                      ]} 
                                    />
                                    <ChartCard 
                                      title="Распределение ресурсов" 
                                      type="bar" 
                                      data={[
                                        { name: 'Дом A', value: 80 },
                                        { name: 'Дом B', value: 55 },
                                        { name: 'Дом C', value: 95 },
                                        { name: 'Дом D', value: 40 },
                                      ]} 
                                    />
                                     <ChartCard 
                                      title="Активность ИИ" 
                                      type="line" 
                                      data={[
                                        { name: '1', value: 20 },
                                        { name: '2', value: 40 },
                                        { name: '3', value: 30 },
                                        { name: '4', value: 70 },
                                        { name: '5', value: 50 },
                                      ]} 
                                    />
                                  </div>
                                )}

                                {msg.matchingCriteria && msg.matchingCriteria.length >= 5 && (
                                  <>
                                    {msg.reasoning && (
                                      <div className="mb-6 space-y-3 p-4 bg-proji-primary/5 rounded-3xl border border-proji-primary/10">
                                        <div className="flex items-center gap-2 mb-2">
                                          <div className="w-1.5 h-3.5 bg-proji-primary rounded-full shadow-[0_0_8px_rgba(30,64,175,0.4)]" />
                                          <span className="text-[11px] font-black uppercase tracking-widest text-proji-primary">Аналитический ход</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2.5">
                                          {msg.reasoning.map((r, idx) => (
                                            <div key={idx} className="text-[12px] font-medium text-proji-secondary flex gap-3 items-start pl-3">
                                              <div className="w-1.5 h-1.5 rounded-full bg-proji-primary mt-1.5 shrink-0 opacity-50" />
                                              {r}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {msg.matchingCriteria && msg.matchingCriteria.length > 0 && (
                                      <div className="mb-6 p-4 bg-proji-mint/5 rounded-3xl border border-proji-mint/20">
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="w-1.5 h-3.5 bg-proji-mint rounded-full shadow-[0_0_8px_rgba(13,148,136,0.4)]" />
                                          <span className="text-[11px] font-black uppercase tracking-widest text-proji-mint">Критерии верификации</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {msg.matchingCriteria.map((c, idx) => (
                                            <span key={idx} className="px-3 py-1.5 bg-proji-mint/10 text-proji-mint text-[10px] font-bold uppercase tracking-tight rounded-xl border border-proji-mint/20 flex items-center gap-1.5">
                                              <div className="w-1 h-1 rounded-full bg-proji-mint" /> {c}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}

                                  {msg.matchingCriteria && msg.matchingCriteria.length >= 5 ? (
                                    <div className="p-6 bg-white border border-proji-border shadow-inner rounded-3xl">
                                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-proji-border/50">
                                        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-proji-dark">
                                          <div className="flex items-center gap-2 text-proji-primary">
                                            <FileText size={14} />
                                            Бизнес-документ (Proji Ver.)
                                          </div>
                                        </div>
                                        <div className="text-[9px] font-black text-proji-secondary/40 font-mono">
                                          ID: {msg.id.substring(msg.id.length - 6)}
                                        </div>
                                      </div>
                                      <CollapsibleText 
                                        title="Текст документа" 
                                        text={msg.mainText || msg.text} 
                                        showTransfer={true}
                                        onTransfer={handleIntegrateData}
                                      />
                                    </div>
                                  ) : (
                                    <div className="prose prose-sm max-w-none text-[15px] leading-relaxed text-proji-dark/80 font-medium px-4 pb-2">
                                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {msg.mainText || msg.text}
                                      </ReactMarkdown>
                                    </div>
                                  )}

                                {msg.options && (
                                  <div className={`mt-8 ${msg.matchingCriteria && msg.matchingCriteria.length >= 5 ? "border-t border-proji-border pt-6" : ""}`}>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
                                      {msg.options.map((opt, i) => (
                                        <button
                                          key={i}
                                          onClick={() => handleSend(opt)}
                                          className="text-left px-6 py-5 bg-white border-2 border-proji-primary/20 rounded-[24px] text-[13px] font-bold text-proji-primary hover:bg-proji-primary hover:text-white hover:border-proji-primary transition-all shadow-md group active:scale-95 flex items-center justify-between"
                                        >
                                          <span className="flex-1 pr-4">{opt}</span>
                                          <ChevronRight size={18} className="opacity-40 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {msg.matchingCriteria && msg.matchingCriteria.length >= 5 && (
                                  <div className="mt-6 pt-5 border-t border-proji-border flex flex-col gap-4">
                                       <button 
                                          onClick={() => handleCreateDoc(msg.mainText || msg.text)}
                                          className="w-full py-4 bg-proji-primary/10 text-proji-primary rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-proji-primary hover:text-white transition-all shadow-sm flex items-center justify-center gap-3 border border-proji-primary/20"
                                        >
                                          <FilePlus size={16} />
                                          Проверить черновик документа
                                       </button>
                                       <div className="flex items-center justify-end gap-2 text-[10px] text-proji-secondary/40 font-bold uppercase tracking-widest">
                                         Верификация пройдена
                                       </div>
                                  </div>
                                )}
                            </div>
                          </div>
                        )}
                        
                        {/* Status indicators outside the bubble */}
                        <div className="flex items-center gap-4 mt-1 px-1">
                          {msg.role === 'model' && (
                            <div className="flex items-center gap-4">
                               <div className="flex items-center gap-2 mr-2">
                                  <div className="w-6 h-6 rounded-lg bg-proji-amber/10 border border-proji-amber/20 text-proji-amber flex items-center justify-center text-[8px] font-bold">
                                    {msg.consultant?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'ИИ'}
                                  </div>
                                  <div className="text-[9px] uppercase font-bold tracking-widest text-proji-amber flex items-center gap-1.5 px-2 py-1 bg-proji-amber/5 rounded-md border border-proji-amber/10 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                    <Sparkles size={10} /> {msg.consultant || domainConsultants[currentDomain]}
                                  </div>
                               </div>
                               <div className="group relative cursor-help">
                                  <History size={12} className="text-proji-secondary/40" />
                                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-proji-dark text-white text-[9px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                                    Контекст: Глубокая нейронная память активна
                                  </div>
                               </div>
                               <div className="group relative cursor-help">
                                  <Workflow size={12} className="text-proji-secondary/40" />
                                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-proji-dark text-white text-[9px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-2xl">
                                    Движок: AI Business Core v2.0
                                  </div>
                               </div>
                            </div>
                          )}
                          <div className="text-[9px] font-bold text-proji-secondary uppercase tracking-[0.2em] opacity-40">
                             {msg.role === 'user' ? `${msg.sourceView || 'Чат'}` : `${new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 h-8">
                    <div className="w-2.5 h-2.5 rounded-full bg-proji-amber animate-pulse" />
                    <span className="text-sm font-medium text-proji-dark">Обработка...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-proji-bg overflow-hidden text-proji-text">
      {renderTaskDetailModal()}
      {renderProjectDetailModal()}
      {/* Dynamic View Creation Modal */}
      <AnimatePresence>
        {showCreatePageModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreatePageModal(false)}
              className="absolute inset-0 bg-proji-dark/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-xl bg-proji-bg rounded-[40px] shadow-2xl p-10 border border-proji-border overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-proji-amber via-proji-dark to-proji-amber" />
              <button onClick={() => setShowCreatePageModal(false)} className="absolute top-8 right-8 text-proji-secondary hover:text-proji-dark"><X size={24} /></button>
              
              <h3 className="text-3xl font-light mb-1.5">Создать новую страницу</h3>
              <p className="text-sm text-proji-secondary mb-10 uppercase tracking-widest font-bold opacity-60">Опишите функционал или вид раздела</p>
              
              <div className="space-y-6">
                <textarea
                  autoFocus
                  value={newPagePrompt}
                  onChange={(e) => setNewPagePrompt(e.target.value)}
                  placeholder="Например: Карта рисков с графиком волатильности и списком ответственных лиц..."
                  className="w-full bg-proji-sidebar border border-proji-border rounded-3xl p-6 h-40 outline-none focus:border-proji-amber transition-all text-sm leading-relaxed"
                />
                
                <div className="flex justify-end gap-4 mt-6">
                  <button 
                    onClick={() => setShowCreatePageModal(false)}
                    className="px-8 py-3 text-xs font-bold uppercase tracking-widest text-proji-secondary hover:text-proji-dark transition-colors"
                  >
                    Отмена
                  </button>
                  <button 
                    onClick={handleCreatePage}
                    className="px-10 py-3 bg-proji-dark text-white rounded-2xl text-xs font-bold uppercase tracking-widest shadow-xl hover:bg-black transition-all active:scale-95 flex items-center gap-2"
                  >
                    <Sparkles size={14} className="text-proji-amber" />
                    Сгенерировать
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setShowShareModal(false)}
              className="absolute inset-0 bg-proji-dark/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-proji-bg rounded-3xl shadow-2xl p-8 border border-proji-border"
            >
              <button onClick={() => setShowShareModal(false)} className="absolute top-6 right-6 text-proji-secondary hover:text-proji-dark">
                <X size={20} />
              </button>
              <h3 className="text-2xl font-light mb-2">Поделиться</h3>
              <p className="text-sm text-proji-secondary mb-8">Отправьте контент коллегам или скопируйте ссылку.</p>
              
              <div className="space-y-4">
                <button className="w-full flex items-center justify-between p-4 bg-proji-sidebar rounded-2xl hover:bg-proji-amber/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <Mail size={20} className="text-proji-secondary group-hover:text-proji-amber" />
                    <span className="text-sm font-medium">Отправить по Email</span>
                  </div>
                  <ChevronRight size={16} className="text-proji-secondary" />
                </button>
                <button className="w-full flex items-center justify-between p-4 bg-proji-sidebar rounded-2xl hover:bg-proji-amber/10 transition-colors group">
                  <div className="flex items-center gap-4">
                    <LinkIcon size={20} className="text-proji-secondary group-hover:text-proji-amber" />
                    <span className="text-sm font-medium">Скопировать ссылку</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-proji-amber">Копировать</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Top Header Toggle */}
      {!showTopMenu && (
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowTopMenu(true)}
          className="fixed top-2 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 px-4 py-1.5 bg-white border border-proji-border rounded-full shadow-sm text-[10px] uppercase tracking-widest text-proji-secondary hover:text-proji-dark transition-all"
        >
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-proji-amber' : 'bg-proji-success'}`}
          />
          Командный центр
        </motion.button>
      )}

      {/* Top Header */}
      <AnimatePresence>
        {showTopMenu && (
          <motion.header 
            initial={{ y: -64 }}
            animate={{ y: 0 }}
            exit={{ y: -64 }}
            className="pt-4 md:pt-6 pb-2 md:pb-4 px-4 md:px-12 flex justify-between items-center md:items-start md:border-b-0 border-b border-proji-primary/10 bg-proji-bg z-[50] sticky top-0 md:shadow-none shadow-sm"
          >
            <div className="flex flex-row md:flex-col items-center md:items-start md:gap-0 flex-wrap w-full md:w-auto relative">
              {/* Line 1: Logo and slash */}
              <div className="flex items-center gap-1 md:gap-2 text-sm mr-1 md:mr-0 md:h-6">
                <div 
                  className="font-black text-lg md:text-xl leading-none tracking-tighter text-proji-primary cursor-pointer transition-all hover:opacity-80 active:scale-95 select-none"
                  onClick={() => setActiveView('DomainInfo')}
                >
                  proji
                </div>
                <span className="text-proji-primary font-bold text-base md:text-lg">/</span>
              </div>

              {/* Line 2: Domain */}
              <div className="relative group flex items-center mr-1 md:mr-0 md:h-6 z-10" 
                   onMouseEnter={() => setShowDomainDropdown(true)}
                   onMouseLeave={() => setShowDomainDropdown(false)}>
                
                {/* Invisible spacer for Desktop only to offset the Domain */}
                <div className="hidden md:flex items-center gap-2 invisible pointer-events-none text-sm mr-2">
                  <div className="font-black text-xl leading-none tracking-tighter">proji</div>
                  <span className="font-bold text-lg">/</span>
                </div>

                <button 
                  onClick={(e) => { e.stopPropagation(); setShowDomainDropdown(!showDomainDropdown); }}
                  className="text-proji-secondary font-medium hover:text-proji-dark transition-colors tracking-wide text-sm md:text-sm flex items-center gap-1"
                >
                  {currentDomain}
                </button>
                <span className="text-proji-primary font-bold text-base md:text-lg ml-1 md:ml-2">/</span>
                
                <AnimatePresence>
                  {showDomainDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute top-full right-0 md:left-full md:ml-2 mt-1 min-w-[220px] bg-white border border-proji-primary/20 rounded-[24px] shadow-2xl p-4 z-[110] shadow-proji-primary/10"
                    >
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] uppercase font-black tracking-[0.2em] text-proji-primary/40 mb-3 px-3">Доступные домены</p>
                        {(['Общий', 'Финансы', 'Маркетинг', 'Стратегия', 'Операции', 'Юридический', 'Управление', 'Производство', 'Оборудование'] as BusinessDomain[]).map(domain => (
                          <button
                            key={domain}
                            onClick={() => { 
                              setCurrentDomain(domain); 
                              setShowDomainDropdown(false); 
                              setShowDomainWelcome({ domain, active: true });
                              setActiveView('DomainLanding' as any);
                            }}
                            className={`text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${currentDomain === domain ? 'bg-proji-primary text-white shadow-lg' : 'text-proji-secondary hover:bg-proji-primary/5 hover:text-proji-primary'}`}
                          >
                            {domain}
                            {currentDomain === domain && <div className="w-1.5 h-1.5 rounded-full bg-white shadow-lg animate-pulse" />}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6 md:mt-4">
              <button 
                onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
                className={`hidden p-2 rounded-xl transition-all shadow-sm border ${isAiPanelOpen ? 'bg-proji-primary text-white border-proji-primary' : 'bg-white text-proji-secondary border-proji-border hover:border-proji-primary hover:text-proji-primary'}`}
                title="Боковое меню ИИ"
              >
                <Layout size={16} />
              </button>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {pendingDraft && (
          <div className="fixed inset-0 z-[11000] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] border border-proji-primary/20"
            >
              <div className="p-8 border-b border-proji-primary/10 flex items-center justify-between bg-proji-bg">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-proji-primary/10 rounded-2xl text-proji-primary">
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-proji-primary tracking-tight">{pendingDraft.title}</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary/60">Черновик документа | Proji AI</p>
                  </div>
                </div>
                <button onClick={() => setPendingDraft(null)} className="p-2 hover:bg-proji-primary/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
                <section className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-proji-primary px-3 py-1 bg-proji-primary/5 rounded-full inline-block">Обоснование (Reasoning)</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {pendingDraft.reasoning.map((r, i) => (
                      <div key={i} className="flex gap-4 p-4 bg-proji-bg border border-proji-primary/10 rounded-2xl">
                        <div className="w-1.5 h-1.5 bg-proji-mint rounded-full mt-1.5 shrink-0" />
                        <p className="text-sm font-bold text-proji-secondary/80 leading-relaxed italic">{r}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-proji-primary px-3 py-1 bg-proji-primary/5 rounded-full inline-block">Содержание документа</h3>
                  <div className="p-8 bg-proji-sidebar border border-proji-primary/5 rounded-[2rem] text-proji-dark font-medium leading-loose whitespace-pre-wrap text-sm shadow-inner">
                    {pendingDraft.content}
                  </div>
                </section>
              </div>

              <div className="p-8 border-t border-proji-primary/10 bg-proji-bg flex gap-4">
                <button 
                  onClick={() => {
                    const newDoc: any = { 
                      id: Date.now(), 
                      title: pendingDraft.title, 
                      date: 'Только что', 
                      size: `${(pendingDraft.content.length / 1024).toFixed(1)} KB`, 
                      type: 'DOCX', 
                      author: 'Proji AI',
                      content: pendingDraft.content
                    };
                    
                    // Add success message to chat with specific details
                    const successMessage: Message = {
                      id: (Date.now() + 500).toString(),
                      text: `📄 **Документ архивирован!**\n\nФайл: **"${pendingDraft.title}"**\nМесто: папка **"Документы"**\nПространство: **${currentDomain} Workspace**\n\n**Критерии верификации:**\n${pendingDraft.reasoning.map(r => `• ${r}`).join('\n')}\n\nПоздравляю вас с успешным созданием и переносом документа в корпоративный репозиторий!`,
                      sender: 'ИИ Консультант',
                      role: 'model',
                      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    } as any;
                    setAllMessages(prev => [...prev, successMessage]);
                    
                    setPendingDraft(null);
                    setShowCelebration(true);
                    setTimeout(() => setShowCelebration(false), 5000);
                  }}
                  className="flex-1 py-5 bg-proji-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black transition-all shadow-[0_10px_40px_rgba(0,77,153,0.4)] flex items-center justify-center gap-3 active:scale-95 group"
                >
                  <Share2 size={18} className="group-hover:rotate-12 transition-transform" />
                  Завершить и перенести в документы
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[12000] flex items-center justify-center pointer-events-none"
          >
            <div className="bg-proji-primary text-white px-10 py-6 rounded-full shadow-[0_20px_50px_rgba(59,130,246,0.5)] flex items-center gap-4 border-2 border-white/20">
               <div className="p-2 bg-white/20 rounded-full"><Sparkles size={24} /></div>
               <div>
                  <p className="text-sm font-black uppercase tracking-widest leading-none mb-1">Поздравляем!</p>
                  <p className="text-[11px] font-bold opacity-80 uppercase tracking-widest">Документ успешно создан и архиврован.</p>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-1 overflow-hidden relative pb-16 md:pb-0 md:pl-16">
        {/* Left Sidebar (Navigation) - Hidden on Mobile */}
        <aside
          ref={sidebarRef}
          className={`hidden md:flex flex-col py-6 z-[120] shrink-0 transition-all duration-500 absolute h-full top-0 left-0 ${
            isSidebarExpanded
              ? 'w-64 items-stretch px-4 bg-white border-r border-proji-primary/20 shadow-[10px_0_30px_rgba(0,0,0,0.05)]'
              : 'w-16 items-center bg-white border-r border-proji-primary/20 shadow-xl shadow-proji-primary/5'
          }`}
        >
            {/* Sidebar toggle button */}
            <button
              onClick={(e) => { e.stopPropagation(); setIsSidebarExpanded(v => !v); }}
              className={`mb-4 shrink-0 flex items-center justify-center w-9 h-9 rounded-xl text-slate-400 hover:text-[#0D47A1] hover:bg-blue-50 transition-all ${isSidebarExpanded ? 'self-end' : ''}`}
              title={isSidebarExpanded ? 'Свернуть' : 'Развернуть'}
            >
              {isSidebarExpanded ? <ChevronLeft size={18} /> : <LayoutDashboard size={18} />}
            </button>
            <div className={`flex flex-col gap-2 overflow-y-auto overflow-x-hidden scrollbar-hide flex-1 w-full proji-scrollbar ${isSidebarExpanded ? '' : 'items-center'}`}>
              {sideItems.map((item, i) => (
                <div 
                  key={i} 
                  className="flex flex-col w-full"
                >
                  <button 
                    onClick={(e) => {
                      if (item.details.length === 1) {
                        navigateToView(item.label as View);
                      } else {
                        handleSideItemClick(e, item.label);
                      }
                    }}
                    className={`rounded-xl transition-all duration-300 flex items-center ${
                      isSidebarExpanded 
                        ? 'w-full p-3.5 gap-4 text-sm font-bold justify-start' 
                        : 'p-3 justify-center'
                    } ${
                      activeSidePanel === item.label || activeView === item.label 
                        ? 'bg-[#0D47A1] text-white shadow-md' 
                        : 'text-slate-600 hover:text-[#0D47A1] hover:bg-blue-50'
                    }`}
                  >
                    <item.icon size={20} className="shrink-0" />
                    {isSidebarExpanded && <span className="whitespace-nowrap flex-1">{item.label}</span>}
                    {isSidebarExpanded && item.details.length > 1 && (
                      <ChevronDown size={14} className={`transition-transform duration-300 ${activeSidePanel === item.label ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                  
                  {/* Inline Dropdown for Expanded Menu */}
                  <AnimatePresence>
                    {isSidebarExpanded && activeSidePanel === item.label && item.details.length > 1 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex flex-col gap-1 px-4 mt-1 mb-2 overflow-hidden"
                      >
                        {item.details.map(detail => (
                          <button 
                            key={detail.label} 
                            onClick={() => {
                              if (detail.label === 'Чат') startNewChat();
                              navigateToView(detail.label as View);
                              setIsSidebarExpanded(false);
                            }}
                            className={`flex items-center gap-3 text-[11px] font-bold py-2.5 px-3 rounded-xl transition-all text-left ${
                              activeView === detail.label 
                                ? 'bg-[#0D47A1] text-white shadow-sm' 
                                : 'text-slate-500 hover:text-[#0D47A1] hover:bg-blue-50/50'
                            }`}
                          >
                            <detail.icon size={12} className="shrink-0" />
                            {detail.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Flyout for Closed Menu */}
                  <AnimatePresence>
                    {!isSidebarExpanded && activeSidePanel === item.label && item.details.length > 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 5 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 5 }}
                        className="fixed bg-[#0D47A1] text-white p-6 rounded-[32px] shadow-2xl z-[150] pointer-events-auto min-w-[220px] left-[84px]"
                        style={{ 
                          top: panelPos.top,
                          transform: 'translateY(-50%)'
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-5 text-white/30 border-b border-white/5 pb-3">{item.label}</p>
                        <div className="flex flex-col gap-3">
                          {item.details.map(detail => (
                            <button 
                              key={detail.label} 
                              onClick={() => {
                                if (detail.label === 'Чат') startNewChat();
                                navigateToView(detail.label as View);
                                setActiveSidePanel(null);
                              }}
                              className="group/sub flex items-center justify-between text-[11px] font-bold text-white/70 hover:text-white transition-all text-left p-2 rounded-xl hover:bg-white/5"
                            >
                              <div className="flex items-center gap-3">
                                 <div className="p-2 rounded-lg bg-white/5 group-hover/sub:bg-proji-amber/20 group-hover/sub:text-proji-amber transition-colors">
                                   <detail.icon size={12} />
                                 </div>
                                 {detail.label}
                              </div>
                              <ChevronRight size={10} className="opacity-0 group-hover/sub:opacity-100 transition-all" />
                            </button>
                          ))}
                        </div>
                        <div className="absolute left-[-6px] top-[50%] -translate-y-1/2 w-4 h-4 bg-[#0D47A1] rotate-45 rounded-sm" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          <div className={`mt-auto flex flex-col gap-6 ${isSidebarExpanded ? 'w-full' : ''}`}>
             <div className="relative">
                <div 
                  onClick={(e) => { e.stopPropagation(); setShowAccountMenu(!showAccountMenu); }}
                  className={`flex items-center gap-3 cursor-pointer p-2 rounded-2xl transition-all group ${isSidebarExpanded ? 'w-full px-3 hover:bg-blue-50' : 'justify-center hover:bg-proji-sidebar'}`}
                >
                  <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${isSidebarExpanded ? 'bg-[#0D47A1] text-white shadow-md' : 'bg-proji-amber/10 text-proji-amber group-hover:ring-2 group-hover:ring-proji-amber'}`}>
                    SS
                  </div>
                  {isSidebarExpanded && (
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-bold text-slate-800">Sund Serik</span>
                      <span className="text-[10px] text-slate-500 truncate w-32">sund.serik@gmail.com</span>
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {showAccountMenu && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="absolute left-full bottom-0 ml-4 min-w-[200px] bg-proji-bg border border-proji-border rounded-2xl shadow-2xl p-4 z-[110]"
                    >
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-proji-secondary mb-3 border-b border-proji-border pb-2">Аккаунт SS</p>
                      <div className="flex flex-col gap-1">
                        <div className="px-3 py-2 mb-2 bg-proji-sidebar rounded-xl border border-proji-border">
                          <p className="text-sm font-bold text-proji-dark">Sund Serik</p>
                          <p className="text-[10px] text-proji-secondary">sund.serik@gmail.com</p>
                        </div>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors">
                          <Settings size={14} /> Настройки
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark transition-colors">
                          <Users size={14} /> Профиль
                        </button>
                        <div className="h-px bg-proji-border my-2" />
                        <p className="text-[8px] uppercase font-bold tracking-widest text-proji-secondary px-3 mb-1">Режим интерфейса</p>
                        {(['light', 'dark', 'system'] as Theme[]).map(t => (
                          <button
                            key={t}
                            onClick={() => setTheme(t)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${theme === t ? 'bg-proji-dark text-white' : 'text-proji-secondary hover:bg-proji-sidebar hover:text-proji-dark'}`}
                          >
                            {t === 'light' ? <Sun size={12} /> : t === 'dark' ? <Moon size={12} /> : <Monitor size={12} />}
                            {t === 'light' ? 'Светлый' : t === 'dark' ? 'Темный' : 'Системный'}
                          </button>
                        ))}
                      </div>
                      <div className="absolute left-[-6px] bottom-5 w-3 h-3 bg-proji-bg border-b border-l border-proji-border rotate-45 rounded-sm" />
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </aside>


        <div className="flex-1 flex flex-row relative overflow-hidden bg-proji-bg">
          <div className="flex-1 flex flex-col relative overflow-hidden">


          <main className="flex-1 overflow-hidden flex flex-col bg-proji-bg overflow-y-auto pb-20 md:pb-0 relative">
            <AnimatePresence mode="popLayout" initial={false} custom={activeView === 'Чат' ? -1 : 1}>
              <motion.div
                key={activeView}
                custom={activeView === 'Чат' ? -1 : 1}
                variants={{
                  enter: (direction: number) => ({
                    x: direction > 0 ? 500 : -500,
                    opacity: 0,
                    scale: 0.95
                  }),
                  center: {
                    zIndex: 1,
                    x: 0,
                    opacity: 1,
                    scale: 1
                  },
                  exit: (direction: number) => ({
                    zIndex: 0,
                    x: direction < 0 ? 500 : -500,
                    opacity: 0,
                    scale: 0.95
                  })
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 }
                }}
                className="h-full w-full flex flex-col pt-0"
              >
                {/* GLOBAL PAGE HEADER */}
                {(activeView !== 'DomainInfo' && activeView !== 'DomainLanding' && activeView !== 'Чат') && (
                  <div className="w-full px-4 md:px-12 mb-4 md:mb-8 pt-4 shrink-0 relative z-[45]">
                     <div className="flex md:items-center w-full">
                       {/* INDENTATION FOR DESKTOP */}
                       <div className="hidden md:flex items-center gap-2 invisible pointer-events-none text-sm h-0 mr-2">
                         <div className="font-black text-xl leading-none tracking-tighter">proji</div>
                         <span className="font-bold text-lg">/</span>
                       </div>
                       <div className="hidden md:flex items-center invisible pointer-events-none text-sm h-0">
                         <span className="font-medium tracking-wide flex items-center gap-1">{currentDomain}</span>
                         <span className="font-bold text-lg ml-1 md:ml-2 mr-1">/</span>
                       </div>

                       {/* ACTUAL TITLE / DROPDOWN */}
                       <div className="relative group md:ml-2" onMouseEnter={() => setActiveTopHover('activeView')} onMouseLeave={() => setActiveTopHover(null)}>
                          <button className="text-proji-dark text-3xl md:text-[2.5rem] font-black md:underline decoration-2 tracking-tight underline-offset-[12px] flex items-center gap-2 hover:text-proji-primary transition-colors text-left pt-2 pb-2">
                            <span className="leading-none">{activeView}</span>
                            <ChevronDown size={28} className="opacity-50" />
                          </button>
                          
                          <AnimatePresence>
                            {activeTopHover === 'activeView' && (
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 5 }}
                                className="absolute top-full left-0 mt-[1px] min-w-[220px] bg-white border border-proji-border rounded-2xl shadow-xl shadow-proji-dark/5 p-4 z-[70] max-h-[60vh] overflow-y-auto"
                              >
                                <div className="flex flex-col gap-4">
                                  {Object.entries(dynamicNavItems).map(([category, items]) => (
                                    <div key={category} className="flex flex-col gap-2">
                                      <p className="text-[9px] uppercase font-black tracking-widest text-proji-secondary px-2">{category}</p>
                                      <div className="flex flex-col gap-1">
                                        {(items as string[]).map(sub => (
                                          <button 
                                            key={sub}
                                            onClick={() => { navigateToView(sub as View); setActiveTopHover(null); }}
                                            className={`text-left text-xs transition-all font-bold tracking-wide px-3 py-2 rounded-xl ${activeView === sub ? 'text-proji-primary bg-proji-primary/5' : 'text-proji-secondary hover:text-proji-primary hover:bg-proji-primary/5'}`}
                                          >
                                            {sub}
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                       </div>
                     </div>
                  </div>
                )}
                {renderView()}
              </motion.div>
            </AnimatePresence>

            {/* Restored centered AI Consultant Input for Chat and Domain views */}
            {(activeView === 'Чат' || activeView === 'DomainLanding') && (
              <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-50 transition-all duration-500 ${isAiPanelOpen ? 'xl:left-[37.5%] xl:-translate-x-1/2' : ''}`}>
                <div className="relative p-[2px] rounded-[2.5rem] bg-gradient-to-r from-blue-400 via-teal-300 to-blue-400 bg-[length:200%_auto] animate-shimmer shadow-[0_0_30px_rgba(56,189,248,0.4)] overflow-hidden">
                  <div className="bg-white/95 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-2 flex items-end gap-3 transition-all ring-1 ring-black/5">
                    <div className="p-3 bg-proji-sidebar rounded-full text-blue-500 mb-1 ml-1 transform group-hover:rotate-12 transition-transform">
                      <Sparkles size={20} className="animate-pulse" />
                    </div>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Задайте вопрос AI консультанту..."
                      rows={1}
                      style={{ height: 'auto', maxHeight: '33vh' }}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-proji-dark placeholder-proji-secondary/50 outline-none py-3 resize-none scrollbar-hide"
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = 'auto';
                        target.style.height = `${target.scrollHeight}px`;
                      }}
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={isProcessing || !inputText.trim()}
                      className="p-4 bg-gradient-to-br from-blue-500 via-teal-400 to-blue-500 bg-[length:200%_auto] animate-shimmer text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg flex-shrink-0 mb-1 mr-1"
                    >
                      {isProcessing ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ArrowUp size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Integrated AI Context Rail / Consultant Control */}
        <div className={`fixed z-100 flex flex-col items-end gap-4 pointer-events-none transition-all duration-500 ${isAiPanelOpen && !['Чат', 'DomainLanding'].includes(activeView) ? 'xl:right-0 xl:top-0 xl:bottom-0 xl:gap-0' : 'right-6 bottom-12'}`}>
          <AnimatePresence mode="wait">
            {!isAiPanelOpen && !['Чат', 'DomainLanding'].includes(activeView) ? (
              <motion.div
                key="closed"
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                whileHover={{ scale: 1.02 }}
                className="w-65 h-20 bg-blue-950 border-2 border-proji-border rounded-2.5rem shadow-[0_0_40px_rgba(45,212,191,0.3),inset_0_0_20px_rgba(45,212,191,0.1)] flex items-center justify-between px-6 group transition-all hover:bg-black pointer-events-auto cursor-pointer overflow-hidden relative"
                onClick={() => setIsAiPanelOpen(true)}
              >
                {/* Blue Mint Animation Backdrop */}
                <motion.div 
                  className="absolute inset-0 bg-blue-600/20 animate-pulse mix-blend-overlay"
                />
                
                <div className="flex flex-col items-start gap-1 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Sparkles size={16} className="text-proji-mint" />
                      <div className="absolute inset-0 blur-sm bg-proji-mint/50 animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-proji-mint">Intelligence Layer</span>
                  </div>
                  <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">Спросите AI-наставника...</span>
                </div>
                <div className="w-12 h-12 rounded-1.25rem bg-proji-mint flex items-center justify-center text-proji-dark shadow-[0_0_25px_rgba(45,212,191,0.6)] transform transition-all duration-500 group-hover:rotate-360 group-hover:scale-110 relative z-10">
                  <MessageSquare size={20} /> 
                </div>
              </motion.div>
            ) : (isAiPanelOpen && !['Чат', 'DomainLanding'].includes(activeView)) ? (
              <motion.div 
                key="open"
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-70 xl:w-[25vw] h-[60vh] xl:h-screen min-h-125 xl:min-h-0 flex flex-col pointer-events-auto shadow-2xl"
              >
                <div className="flex-1 bg-white border-2 border-proji-border rounded-4xl xl:rounded-none overflow-hidden flex flex-col ring-4 ring-proji-mint/5 relative group">
                  <div className="absolute inset-0 bg-blue-600/5 animate-pulse pointer-events-none" />
                  <ContextSidebar />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      {/* Removing bottom input to move into Sidebar/Assistant box */}

          {/* Bottom Bar Toggle */}
          {!showBottomBar && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowBottomBar(true)}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 z-50 p-3 bg-white border border-b-0 border-proji-border rounded-t-xl shadow-[0_-5px_15px_rgba(0,0,0,0.1)] text-proji-primary hover:text-blue-600 transition-all flex items-center justify-center cursor-pointer"
              title="Открыть нижнее меню"
            >
              <LayoutDashboard size={18} />
            </motion.button>
          )}

          {/* Bottom Navigation / Utility Bar */}
          <AnimatePresence>
            {showBottomBar && (
              <>
                {/* Platform Maturity Hub (Push-up) */}
                <AnimatePresence>
                  {isCoreExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 320, opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-proji-bg border-t border-proji-border z-[105] overflow-hidden"
                    >
                      <div className="relative h-full flex flex-col p-10 max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h3 className="text-xl font-bold text-proji-dark flex items-center gap-3">
                              Зрелость платформы
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-proji-amber/10 border border-proji-amber/20 rounded text-[9px] uppercase tracking-widest text-proji-amber">
                                Business Tier
                              </div>
                            </h3>
                            <p className="text-xs text-proji-secondary mt-1">Освоение функционала и готовность ассистента к работе</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className="px-5 py-2 bg-proji-sidebar rounded-2xl flex items-center gap-4">
                                <div className="text-right">
                                   <p className="text-[9px] font-bold uppercase tracking-wider text-proji-secondary">Загруженность ИИ</p>
                                   <p className="text-xs font-bold text-proji-dark">85% Контекста</p>
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-proji-amber/20 flex items-center justify-center relative">
                                   <div className="absolute inset-0 border-2 border-proji-amber rounded-full" style={{ clipPath: 'polygon(50% 50%, -50% -50%, 100% -50%, 100% 100%, -50% 100%)' }} />
                                   <Sparkles size={14} className="text-proji-amber" />
                                </div>
                             </div>
                             <button 
                               onClick={() => setIsCoreExpanded(false)}
                               className="p-2 hover:bg-proji-sidebar rounded-lg transition-all"
                             >
                                <X size={20} className="text-proji-secondary" />
                             </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {/* Utilization: Total Company */}
                          <div className="p-6 bg-proji-sidebar/30 border border-proji-border rounded-3xl relative overflow-hidden group hover:border-proji-dark transition-all">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary mb-1">Использование компанией</p>
                                   <h4 className="text-3xl font-light text-proji-dark">42 <span className="text-lg text-proji-secondary">/ 60</span></h4>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-proji-border">
                                   <Users size={20} className="text-proji-dark" />
                                </div>
                             </div>
                             <div className="w-full h-1.5 bg-proji-border rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '70.2%' }}
                                  className="h-full bg-proji-dark rounded-full" 
                                />
                             </div>
                             <p className="mt-3 text-[10px] text-proji-secondary font-medium">70% инструментов внедрено в бизнес-процессы</p>
                          </div>

                          {/* Utilization: Individual User */}
                          <div className="p-6 bg-proji-sidebar/30 border border-proji-border rounded-3xl relative overflow-hidden group hover:border-proji-dark transition-all border-dashed">
                             <div className="flex justify-between items-start mb-6">
                                <div>
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-proji-secondary mb-1">Ваша активность</p>
                                   <h4 className="text-3xl font-light text-proji-dark">12 <span className="text-lg text-proji-secondary">/ 60</span></h4>
                                </div>
                                <div className="p-3 bg-white rounded-2xl shadow-sm border border-proji-border">
                                   <User size={20} className="text-proji-dark" />
                                </div>
                             </div>
                             <div className="w-full h-1.5 bg-proji-border rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: '20%' }}
                                  className="h-full bg-proji-amber rounded-full" 
                                />
                             </div>
                             <p className="mt-3 text-[10px] text-proji-secondary font-medium">Ваш личный прогресс освоения платформы: 20%</p>
                          </div>

                          {/* Utilization: Capacity */}
                          <div className="p-6 bg-proji-dark border border-proji-dark rounded-3xl relative overflow-hidden text-white group shadow-xl">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                             <div className="flex justify-between items-start mb-6 relative z-10">
                                <div>
                                   <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Потенциал роста</p>
                                   <h4 className="text-3xl font-light">60 <span className="text-lg text-white/30">Модулей</span></h4>
                                </div>
                                <div className="p-3 bg-white/10 rounded-2xl border border-white/10 backdrop-blur-md">
                                   <Zap size={20} className="text-proji-amber" />
                                </div>
                             </div>
                             <div className="flex items-center gap-2 mt-auto relative z-10">
                                <button className="flex-1 py-2 bg-white text-proji-dark rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-proji-amber transition-colors">
                                   Открыть документацию
                                </button>
                                <button className="p-2 border border-white/20 rounded-xl hover:bg-white/10 transition-colors">
                                   <Monitor size={16} />
                                </button>
                             </div>
                             <p className="mt-3 text-[10px] text-white/30 font-medium">18 функций доступно для немедленного подключения</p>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-6 border-t border-proji-border/50">
                           <div className="flex items-center gap-8">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-proji-secondary uppercase tracking-[0.2em] font-medium">AI Readiness:</span>
                                <div className="flex gap-1">
                                   {[1,1,1,1,0].map((lit, i) => (
                                      <div key={i} className={`w-3 h-1 rounded-full ${lit ? 'bg-proji-success' : 'bg-proji-border'}`} />
                                   ))}
                                </div>
                              </div>
                              <div className="h-3 w-px bg-proji-border" />
                              <div className="flex items-center gap-3">
                                <p className="text-[10px] text-proji-secondary font-bold uppercase tracking-widest">Ассистент:</p>
                                <p className="text-[10px] text-proji-dark font-bold">Обучен вашим данным на 92%</p>
                              </div>
                           </div>
                           <p className="text-[10px] text-proji-secondary/40 font-bold uppercase tracking-[0.2em]">Efficiency Dashboard</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.footer 
                  initial={{ y: 48 }}
                  animate={{ y: 0 }}
                  exit={{ y: 48 }}
                  className="h-12 border-t border-proji-border bg-proji-bg flex items-center justify-between px-8 flex-shrink-0 z-[110] relative"
                >
                  <div className="flex items-center gap-6">
                    {[
                      { icon: LayoutDashboard, label: 'Статус: Оптимально' },
                      { icon: Activity, label: 'Node: Active' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-proji-secondary font-bold">
                        <item.icon size={12} className="text-proji-amber" />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* The Core Toggle Pill */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2">
                    <button 
                      onClick={() => setIsCoreExpanded(!isCoreExpanded)}
                      className={`flex items-center gap-3 px-6 py-2 rounded-full border transition-all duration-500 overflow-hidden ${isCoreExpanded ? 'bg-proji-dark text-white border-proji-dark shadow-2xl scale-110' : 'bg-white text-proji-dark border-proji-border hover:border-proji-dark shadow-sm'}`}
                    >
                      <div className={`transition-transform duration-700 ${isCoreExpanded ? 'rotate-[360deg]' : ''}`}>
                         <Terminal size={14} className={isCoreExpanded ? 'text-proji-amber' : 'text-proji-dark'} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Панель управления</span>
                      {isCoreExpanded && <ChevronRight size={14} className="rotate-[-90deg]" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-proji-secondary uppercase tracking-[0.2em] font-bold">v1.0.5</span>
                      <div className="w-1 h-1 rounded-full bg-proji-success" />
                    </div>
                    <button 
                      onClick={() => setShowBottomBar(false)}
                      className="p-1 text-proji-secondary hover:text-proji-dark"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </motion.footer>
              </>
            )}
          </AnimatePresence>
        </div>

      {/* Top Right Action Area */}
      <div className={`fixed top-8 z-[200] flex gap-3 items-start transition-all duration-500 ${
        isAiPanelOpen && !['Чат', 'DomainLanding'].includes(activeView)
          ? 'right-8 xl:right-[calc(25vw+2rem)]'
          : 'right-8'
      }`}>
        {/* Search input */}
        <div className="relative h-10 flex items-center shadow-sm rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm border border-proji-border hover:border-blue-400 transition-colors focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <Search size={16} className="absolute left-3 text-proji-secondary" />
          <input 
            type="text" 
            placeholder="Поиск..." 
            className="h-10 pl-9 pr-4 w-48 md:w-64 bg-transparent outline-none text-sm text-proji-dark placeholder:text-proji-secondary/50 font-medium" 
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {/* Quick Add Button */}
          <div className="relative group/add flex items-center justify-end">
            <div className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover/add:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
              Создать запись
            </div>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowQuickAddModal(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg overflow-hidden group border border-blue-400/30 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-500 to-blue-800 bg-[length:200%_200%] animate-bg-flow opacity-90 group-hover:opacity-100 transition-opacity" />
              <Plus className="text-white relative z-10 w-5 h-5 pointer-events-none" />
            </motion.button>
          </div>
          
          {/* Help Button */}
          <div className="relative group/help flex items-center justify-end">
            <div className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg opacity-0 group-hover/help:opacity-100 transition-opacity pointer-events-none shadow-xl">
              Справка
            </div>
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-proji-border bg-transparent text-proji-secondary hover:text-proji-dark hover:bg-black/5 hover:border-gray-300 transition-all"
            >
              <Info size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAddModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowQuickAddModal(false)}
              className="absolute inset-0 bg-proji-dark/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-proji-border flex flex-col overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-proji-border bg-gray-50/50">
                 <h2 className="text-2xl font-black tracking-tight text-proji-dark flex items-center gap-3">
                    <PenTool className="text-proji-dark w-6 h-6" />
                    Новая запись
                 </h2>
                 <button onClick={() => setShowQuickAddModal(false)} className="p-2 bg-white hover:bg-gray-100 rounded-full text-proji-secondary transition-colors border border-proji-border">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="p-6">
                <textarea 
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  placeholder="Что у вас на уме? Пишите здесь..."
                  className="w-full h-48 outline-none resize-none text-lg text-proji-dark placeholder:text-proji-secondary/40 font-medium"
                  autoFocus
                />
              </div>

              <div className="px-6 py-4 border-t border-proji-border bg-gray-50 flex items-center justify-end gap-3 rounded-b-[32px]">
                <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-proji-border shadow-sm">
                   <select 
                     value={quickAddType} 
                     onChange={(e) => setQuickAddType(e.target.value)}
                     className="bg-transparent text-sm font-bold text-proji-dark px-3 py-2 outline-none appearance-none cursor-pointer"
                   >
                     <option value="заметка">заметка</option>
                     <option value="задача">задача</option>
                     <option value="проект">проект</option>
                     <option value="документ">документ</option>
                     <option value="другое">другое (написать)</option>
                   </select>

                   {quickAddType === 'другое' && (
                     <input 
                       type="text" 
                       value={quickAddCustomType}
                       onChange={(e) => setQuickAddCustomType(e.target.value)}
                       placeholder="Напишите тип..." 
                       className="w-36 bg-gray-100 px-3 py-2 rounded-lg text-sm text-proji-dark outline-none font-medium border border-transparent focus:border-proji-border"
                     />
                   )}
                   
                   <button 
                     onClick={() => {
                        setShowQuickAddModal(false);
                        setQuickAddText('');
                        setQuickAddType('заметка');
                        setQuickAddCustomType('');
                     }}
                     className="bg-proji-dark text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-black transition-colors"
                   >
                     Сохранить
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Removing redundant floating toggle */}
      </div>
    );
}
