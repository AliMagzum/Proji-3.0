import {
  Workflow, Shield, Target, TrendingUp, Package, Settings2, Clock, Scale,
  BarChart3, Database, FileText, Search, Users, Globe, FilePlus, History,
  Activity, Truck, Layers, AlertCircle, Calendar, ClipboardCheck, RefreshCw,
  Smile, Briefcase, RotateCcw, BookOpen,
} from 'lucide-react';
import type { BusinessDomain, Scenario } from '../types';

export const domainConsultants: Record<BusinessDomain, string> = {
  'Общий': 'Универсальный бизнес-ассистент',
  'Финансы': 'Финансовый директор (CFO)',
  'Маркетинг': 'Директор по маркетингу (CMO)',
  'Стратегия': 'Бизнес-стратег и визионер',
  'Операции': 'Операционный директор (COO)',
  'Юридический': 'Главный юрисконсульт',
  'Управление': 'CEO / Генеральный директор',
  'Производство': 'Технический директор (CTO/Plant Manager)',
  'Оборудование': 'Главный механик / Инженер по надежности',
};

export const domainViewData: Record<BusinessDomain, any> = {
  'Общий': {
    analytics: [
      { label: 'Общая эффективность', value: '88%', trend: '+2%' },
      { label: 'Загрузка команды', value: '72%', trend: '-5%' },
      { label: 'Выполненные KPI', value: '12/15', trend: '+1' },
    ],
    reports: [
      { name: 'Общий годовой отчет', date: '2023', size: '5.2 MB', type: 'General' },
      { name: 'Протоколы встреч', date: '2024', size: '1.2 MB', type: 'Admin' },
    ],
    roadmap: ['Этап 1: Инфраструктура', 'Этап 2: Найм', 'Этап 3: Экспансия'],
    okrs: [{ title: 'Стабильность системы', progress: 95, keyResults: ['Uptime 99.9%', 'Тикеты < 10'] }],
    team: [
      { name: 'Анна К.', role: 'HR', status: 'В сети', tasks: [{ title: 'Онбординг новых лидов', status: 'pending' }, { title: 'Обновление базы знаний', status: 'completed' }] },
      { name: 'Сергей П.', role: 'Admin', status: 'В сети', tasks: [{ title: 'Мониторинг серверов', status: 'pending' }, { title: 'Патч безопасности #12', status: 'completed' }] },
    ],
    leads: [{ name: 'ООО "Вектор"', company: 'Индустрия', score: 85, source: 'Прямой' }],
    processes: [{ name: 'Общий документооборот', steps: 5, status: 'Активен', icon: Workflow }],
    documents: [
      {
        name: 'Устав компании.docx',
        type: 'word',
        size: '45 KB',
        date: '12.01.2024',
        author: 'Юридический отдел',
        pages: [
          'ОБЩИЕ ПОЛОЖЕНИЯ\n1.1. Общество с ограниченной ответственностью «Проджи» (далее — «Общество») создано в соответствии с Гражданским кодексом Российской Федерации.\n1.2. Общество является юридическим лицом.',
          'ЦЕЛИ И ПРЕДМЕТ ДЕЯТЕЛЬНОСТИ\n2.1. Основной целью деятельности Общества является извлечение прибыли.\n2.2. Общество вправе осуществлять любые виды деятельности, не запрещенные законом.',
          'УСТАВНЫЙ КАПИТАЛ ОБЩЕСТВА\n3.1. Уставный капитал Общества составляет 100 000 (сто тысяч) рублей.\n3.2. Разделен на доли между участниками пропорционально их вкладам.',
        ],
      },
      {
        name: 'Бюджет 2024.xlsx',
        type: 'excel',
        size: '120 KB',
        date: '15.02.2024',
        author: 'Сергей П.',
        data: {
          headers: ['Статья расходов', 'План Q1', 'Факт Q1', 'Отклонение'],
          rows: [
            ['ФОТ', '5 000 000', '4 800 000', '-200 000'],
            ['Аренда', '1 200 000', '1 200 000', '0'],
            ['Маркетинг', '2 500 000', '2 750 000', '+250 000'],
            ['Серверы', '800 000', '780 000', '-20 000'],
            ['Прочее', '500 000', '450 000', '-50 000'],
          ],
        },
      },
      { name: 'Анкета сотрудника.pdf', type: 'form', size: '85 KB', date: '20.03.2024', author: 'HR Отдел', content: 'ФОРМА АНКЕТЫ СОТРУДНИКА\n\nФИО: _________________________\nДолжность: ____________________\nДата начала работы: ____________' },
    ],
  },
  'Финансы': {
    analytics: [
      { label: 'Чистая прибыль', value: '$840k', trend: '+12%' },
      { label: 'Маржинальность', value: '34%', trend: '+2.1%' },
      { label: 'Burn Rate', value: '$45k/мес', trend: '-8%' },
    ],
    reports: [
      { name: 'P&L Statement - Q1', date: '12.04.2024', size: '2.4 MB', type: 'Finance' },
      { name: 'Balance Sheet', date: '01.04.2024', size: '1.8 MB', type: 'Finance' },
    ],
    roadmap: ['Этап 1: Аудит', 'Этап 2: Фандрейзинг', 'Этап 3: IPO Prep'],
    okrs: [{ title: 'Прибыльность', progress: 78, keyResults: ['Снизить OPEX на 15%', 'Увеличить чистую маржу'] }],
    team: [
      { name: 'Виктор М.', role: 'CFO', status: 'В сети', tasks: [{ title: 'Подготовка к аудиту', status: 'pending' }, { title: 'Сверка счетов', status: 'completed' }] },
      { name: 'Ольга Ф.', role: 'Бухгалтер', status: 'Занята', tasks: [{ title: 'Годовой отчет', status: 'pending' }, { title: 'Выплата бонусов', status: 'completed' }] },
    ],
    leads: [{ name: 'Инвест-Фонд Альфа', company: 'VC', score: 98, source: 'Networking' }],
    processes: [{ name: 'Квартальное закрытие', steps: 15, status: 'Активен', icon: Shield }],
    documents: [
      { name: 'Налоговая отчетность Q1.xlsx', type: 'excel', size: '200 KB', date: '10.04.2024' },
      { name: 'Договор займа #442.docx', type: 'word', size: '32 KB', date: '05.04.2024' },
      { name: 'Заявка на возврат.pdf', type: 'form', size: '15 KB', date: '11.04.2024' },
    ],
  },
  'Маркетинг': {
    analytics: [
      { label: 'CAC', value: '$12.50', trend: '-15%' },
      { label: 'ROAS', value: '4.8x', trend: '+0.5x' },
      { label: 'Лиды', value: '2,450', trend: '+22%' },
    ],
    reports: [
      { name: 'Marketing ROI Q1', date: '10.04.2024', size: '3.5 MB', type: 'Marketing' },
      { name: 'Social Media Audit', date: '05.04.2024', size: '1.1 MB', type: 'Marketing' },
    ],
    roadmap: ['Этап 1: Брендинг', 'Этап 2: Контент Хаб', 'Этап 3: Глобальный PR'],
    okrs: [{ title: 'Узнаваемость', progress: 55, keyResults: ['1M упоминаний в соцсетях', 'Топ-3 в выдаче'] }],
    team: [
      { name: 'Лиза Т.', role: 'CMO', status: 'В сети', tasks: [{ title: 'Запуск рекламной кампании', status: 'pending' }, { title: 'Анализ конкурентов Q1', status: 'completed' }] },
      { name: 'Максим Р.', role: 'SMM', status: 'В сети', tasks: [{ title: 'Контент-план на июнь', status: 'pending' }, { title: 'Отчет по Tik-Tok', status: 'completed' }] },
    ],
    leads: [{ name: 'Алексей Н.', company: 'E-commerce', score: 88, source: 'LinkedIn' }],
    processes: [{ name: 'Медиапланирование', steps: 8, status: 'Активен', icon: Target }],
    documents: [
      { name: 'Медиаплан Май 2024.xlsx', type: 'excel', size: '600 KB', date: '12.04.2024' },
      { name: 'Брендбук v2.pdf', type: 'word', size: '12 MB', date: '01.03.2024' },
      { name: 'Опрос лояльности.form', type: 'form', size: '5 KB', date: '15.04.2024' },
    ],
  },
  'Стратегия': {
    analytics: [
      { label: 'Доля рынка', value: '18%', trend: '+1.5%' },
      { label: 'NPS', value: '72', trend: '+5' },
      { label: 'LTV', value: '$850', trend: '+$120' },
    ],
    reports: [
      { name: 'Strategic Roadmap 2025', date: '01.03.2024', size: '8.4 MB', type: 'Strategy' },
      { name: 'Competitor Analysis', date: '15.02.2024', size: '12.1 MB', type: 'Market' },
    ],
    roadmap: ['Этап 1: Исследование', 'Этап 2: Pivot Check', 'Этап 3: M&A'],
    okrs: [{ title: 'Лидерство', progress: 30, keyResults: ['Занять нишу AI-Ops', 'Партнерство with BigTech'] }],
    team: [
      { name: 'Артем Д.', role: 'Visionary', status: 'В сети', tasks: [{ title: 'Разработка Vision 2030', status: 'pending' }, { title: 'M&A фильтрация', status: 'completed' }] },
      { name: 'Елена В.', role: 'Analyst', status: 'В сети', tasks: [{ title: 'Анализ конкурентов', status: 'pending' }, { title: 'Рыночный отчет', status: 'completed' }] },
    ],
    leads: [{ name: 'BigCorp Inc.', company: 'Fortune 500', score: 75, source: 'Inbound' }],
    processes: [{ name: 'Стратегическая сессия', steps: 4, status: 'Активен', icon: TrendingUp }],
    documents: [
      { name: 'M&A Pipeline.xlsx', type: 'excel', size: '45 KB', date: '10.04.2024' },
      { name: 'Vision 2030.docx', type: 'word', size: '1.2 MB', date: '01.01.2024' },
      { name: 'Feedback Board.pdf', type: 'form', size: '22 KB', date: '12.04.2024' },
    ],
  },
  'Операции': {
    analytics: [
      { label: 'Order Cycle Time', value: '4.2 дня', trend: '-0.8 дн' },
      { label: 'Inventory Turnover', value: '8.5x', trend: '+1.2x' },
      { label: 'Cost per Unit', value: '$14.20', trend: '-5%' },
    ],
    reports: [
      { name: 'Supply Chain Audit', date: '11.04.2024', size: '4.2 MB', type: 'Ops' },
      { name: 'Resource Allocation', date: '02.04.2024', size: '2.1 MB', type: 'HR' },
    ],
    roadmap: ['Этап 1: Автоматизация СК', 'Этап 2: ERP внедрение', 'Этап 3: Zero Waste'],
    okrs: [{ title: 'Эффективность', progress: 85, keyResults: ['Автоматизация 90% склада', 'Снижение брака < 1%'] }],
    team: [
      { name: 'Игорь С.', role: 'COO', status: 'В сети', tasks: [{ title: 'Оптимизация логистики', status: 'pending' }, { title: 'Внедрение ERP', status: 'completed' }] },
      { name: 'Наталья Ю.', role: 'Logistics', status: 'Занята', tasks: [{ title: 'График отгрузок', status: 'pending' }, { title: 'Аудит склада', status: 'completed' }] },
    ],
    leads: [{ name: 'Global Logistics', company: '3PL', score: 65, source: 'Trade Show' }],
    processes: [{ name: 'Оптимизация маршрутов', steps: 12, status: 'Активен', icon: Package }],
    documents: [
      { name: 'Логистическая схема.pdf', type: 'word', size: '3.5 MB', date: '12.04.2024' },
      { name: 'График смен Май.xlsx', type: 'excel', size: '95 KB', date: '15.04.2024' },
      { name: 'Чек-лист отгрузки.pdf', type: 'form', size: '12 KB', date: '16.04.2024' },
    ],
  },
  'Юридический': {
    analytics: [
      { label: 'Активных дел', value: '42', trend: '+3' },
      { label: 'Win Rate', value: '87%', trend: '+2%' },
      { label: 'Риск-фактор', value: 'Низкий', trend: 'Stable' },
    ],
    reports: [
      { name: 'Legal Audit 2024', date: '01.05.2024', size: '3.2 MB', type: 'Compliance' },
      { name: 'Contract Summary', date: '28.04.2024', size: '1.5 MB', type: 'Legal' },
    ],
    roadmap: ['Подача апелляции', 'Регистрация ТЗ', 'M&A Due Diligence'],
    okrs: [{ title: 'Минимизация рисков', progress: 90, keyResults: ['Проверка всех договоров', 'Выигрыш дела Apex'] }],
    team: [
      {
        name: 'Олег П.',
        role: 'Старший юрист',
        status: 'В сети',
        tasks: [
          { title: 'Доработать договор аренды', status: 'pending' },
          { title: 'Подготовка к суду Apex', status: 'pending' },
          { title: 'Анализ рисков проекта Zeta', status: 'completed' },
        ],
        functions: ['Договорная работа', 'Судебное представительство', 'Compliance'],
        kpis: [
          { label: 'Win Rate', value: 87, target: 80 },
          { label: 'Срок согласования', value: 92, target: 100 },
          { label: 'Отсутствие штрафов', value: 100, target: 100 },
        ],
        planFact: [
          { month: 'Янв', plan: 10, fact: 8 },
          { month: 'Фев', plan: 12, fact: 14 },
          { month: 'Мар', plan: 15, fact: 15 },
          { month: 'Апр', plan: 20, fact: 18 },
        ],
        efficiencyBreakdown: [
          { name: 'Право', value: 45 },
          { name: 'Анализ', value: 30 },
          { name: 'Митинги', value: 15 },
          { name: 'Отчеты', value: 10 },
        ],
      },
      {
        name: 'Мария Д.',
        role: 'Юрист (M&A)',
        status: 'Занята',
        tasks: [
          { title: 'Due Diligence проекта Delta', status: 'pending' },
          { title: 'Сверка документов', status: 'completed' },
        ],
        functions: ['M&A сделки', 'Корпоративное право', 'Аудит'],
        kpis: [
          { label: 'Эффективность M&A', value: 75, target: 90 },
          { label: 'Качество аудита', value: 95, target: 95 },
        ],
        planFact: [
          { month: 'Янв', plan: 5, fact: 4 },
          { month: 'Фев', plan: 5, fact: 6 },
          { month: 'Мар', plan: 8, fact: 7 },
          { month: 'Апр', plan: 10, fact: 9 },
        ],
        efficiencyBreakdown: [
          { name: 'Сделки', value: 60 },
          { name: 'Аудит', value: 25 },
          { name: 'Админ', value: 15 },
        ],
      },
    ],
    leads: [{ name: 'ООО "Апекс"', company: 'Судебный спор', score: 95, source: 'Internal' }],
    processes: [{ name: 'Согласование договоров', steps: 6, status: 'Активен', icon: Scale }],
    documents: [
      { name: 'Договор аренды_v2.docx', type: 'word', size: '45 KB', date: '02.05.2024' },
      { name: 'Исковое заявление.pdf', type: 'form', size: '120 KB', date: '01.05.2024' },
    ],
  },
  'Управление': {
    analytics: [
      { label: 'Маржинальность', value: '24%', trend: '+2%' },
      { label: 'EBITDA', value: '$2.4M', trend: '+$400K' },
      { label: 'Churn Rate', value: '1.2%', trend: '-0.1%' },
    ],
    reports: [
      { name: 'Monthly Board Report', date: '01.05.2024', size: '5.2 MB', type: 'Executive' },
      { name: 'Expansion Strategy', date: '25.04.2024', size: '3.1 MB', type: 'Growth' },
    ],
    roadmap: ['Глобальная экспансия', 'IPO Preparation', 'Digital Transformation'],
    okrs: [{ title: 'Рост капитализации', progress: 45, keyResults: ['Выход на рынок ОАЭ', 'Снижение OPEX на 15%'] }],
    team: [
      { name: 'Александр В.', role: 'CEO', status: 'В сети', tasks: [{ title: 'Совет директоров', status: 'pending' }, { title: 'Переговоры с инвесторами', status: 'completed' }], functions: ['Стратегия', 'Лидерство'], kpis: [{ label: 'Performance', value: 95, target: 90 }], planFact: [{ month: 'Апр', plan: 100, fact: 105 }] },
      { name: 'Дмитрий К.', role: 'CTO', status: 'В сети', tasks: [{ title: 'Архитектура ИИ', status: 'pending' }, { title: 'Безопасность данных', status: 'completed' }], functions: ['Технологии', 'Инновации'], kpis: [{ label: 'Uptime', value: 99.9, target: 99.9 }], planFact: [{ month: 'Апр', plan: 100, fact: 100 }] },
    ],
    leads: [{ name: 'Tech Capital', company: 'PE Fund', score: 92, source: 'Referral' }],
    processes: [{ name: 'Цикл принятия решений', steps: 3, status: 'Активен', icon: Target }],
    documents: [{ name: 'Investment Deck.pdf', type: 'word', size: '15 MB', date: '30.04.2024' }],
  },
  'Производство': {
    analytics: [
      { label: 'OEE (Performance)', value: '84.2%', trend: '+1.5%' },
      { label: 'Простой линий', value: '12 ч/мес', trend: '-2 ч' },
      { label: 'Брак продукции', value: '0.8%', trend: '-0.1%' },
    ],
    reports: [
      { name: 'Production Report Q1', date: '02.05.2024', size: '4.8 MB', type: 'Factory' },
      { name: 'Maintenance Log May', date: '01.05.2024', size: '1.2 MB', type: 'Technical' },
    ],
    roadmap: ['Модернизация конвейера B2', 'Инсталляция робота R5', 'Внедрение MES'],
    okrs: [{ title: 'Рост выработки', progress: 85, keyResults: ['Увеличить OEE до 90%', 'Снизить энергопотребление'] }],
    team: [
      { name: 'Михаил Л.', role: 'Operations', status: 'В сети', tasks: [{ title: 'Контроль смены', status: 'pending' }, { title: 'Отчет по браку', status: 'completed' }], functions: ['Управление сменой', 'Качество'], kpis: [{ label: 'Efficiency', value: 88, target: 90 }], planFact: [{ month: 'Апр', plan: 100, fact: 110 }] },
    ],
    leads: [{ name: 'Завод Авангард', company: 'Партнер', score: 90, source: 'Direct' }],
    processes: [{ name: 'Цикл тех. обслуживания', steps: 8, status: 'Активен', icon: Settings2 }],
    documents: [{ name: 'Регламент цеха #1.pdf', type: 'word', size: '1.5 MB', date: '12.03.2024' }],
  },
  'Оборудование': {
    analytics: [
      { label: 'OEE (Avg)', value: '82.5%', trend: '+1.2%' },
      { label: 'MTBF', value: '450 ч', trend: '+12 ч' },
      { label: 'Затраты на ТО', value: '$8.4k', trend: '-5%' },
    ],
    reports: [
      { name: 'Maintenance Log Q1', date: '01.05.2024', size: '2.8 MB', type: 'Technical' },
      { name: 'Inspection Report #42', date: '28.04.2024', size: '1.2 MB', type: 'Safety' },
    ],
    roadmap: ['Замена роликов B2', 'Инсталляция сенсоров R5', 'Обновление ПО'],
    okrs: [{ title: 'Надежность парка', progress: 80, keyResults: ['MTBF > 500 ч', 'Снижение аварийных простоев на 20%'] }],
    team: [
      { name: 'Виктор М.', role: 'Chief Mechanic', status: 'В сети', tasks: [{ title: 'Сервис R1', status: 'pending' }, { title: 'Заказ подшипников', status: 'completed' }], functions: ['Гидровлика', 'Пневматика', 'ТО'], kpis: [{ label: 'Fix Rate', value: 92, target: 95 }], planFact: [{ month: 'Апр', plan: 100, fact: 110 }] },
    ],
    leads: [{ name: 'Сервис-Маркет', company: 'Поставщик', score: 95, source: 'Partnership' }],
    processes: [{ name: 'ТО-1 (Ежемесячно)', steps: 12, status: 'Активен', icon: Clock }],
    documents: [
      { name: 'Паспорт линии B2.pdf', type: 'word', size: '4.5 MB', date: '01.01.2024' },
      { name: 'Схема смазки R1.dwg', type: 'word', size: '2.1 MB', date: '15.03.2024' },
    ],
  },
};

export const domainScenarios: Record<BusinessDomain, Scenario[]> = {
  'Общий': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Общий]', icon: Database },
    { title: 'Бизнес-план', text: 'Разработать [Бизнес-план] на [2025 год] с учетом [Ресурсов]', icon: FileText },
    { title: 'Анализ рынка', text: 'Провести анализ [Рынка ЦА] в регионе [Европа] с помощью [Функции]', icon: Search },
    { title: 'Командный митап', text: 'Назначить встречу с [Командой] для обсуждения [Стратегии]', icon: Users },
  ],
  'Финансы': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Финансы]', icon: Database },
    { title: 'Отчет P&L', text: 'Создать отчет [P&L] за [Q1 2024] для [Инвесторов]', icon: BarChart3 },
    { title: 'Прогноз кэшфлоу', text: 'Рассчитать [CashFlow] на [6 месяцев] на основе [Периодов]', icon: TrendingUp },
    { title: 'Налоговый аудит', text: 'Проверить [Налоговые риски] для проекта [Global Scale]', icon: Shield },
  ],
  'Маркетинг': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Маркетинг]', icon: Database },
    { title: 'CTR Оптимизация', text: 'Анализ [CTR] для кампании [Spring Launch] с [Сотрудником]', icon: TrendingUp },
    { title: 'SEO Аудит', text: 'Запустить [SEO Аудит] сайта [proji.ai]', icon: Globe },
    { title: 'Контент-план', text: 'Составить [Контент план] на [Май] для [SMM отдела]', icon: FilePlus },
  ],
  'Стратегия': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Стратегия]', icon: Database },
    { title: 'OKR Ревью', text: 'Обновить статус [OKRs] для направления [Growth] с [Коллегой]', icon: Target },
    { title: 'Управленческий дневник', text: 'Проанализируй мои голосовые заметки за [неделю] и составь [управленческий отчет]', icon: History },
    { title: 'SWOT Анализ', text: 'Провести [SWOT Анализ] для продукта [Proji Vault]', icon: Activity },
  ],
  'Юридический': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Юридический]', icon: Database },
    { title: 'Аудит договоров', text: 'Провести [Аудит] всех [Договоров аренды] на [Риски]', icon: Scale },
    { title: 'Регистрация ТЗ', text: 'Подать заявку на [Регистрацию Товарного Знака] для [Proji]', icon: Shield },
  ],
  'Операции': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Операции]', icon: Database },
    { title: 'Оптимизация логистики', text: 'Проанализируй [Логистику] и предложи [Оптимизацию] для узла [Склад A]', icon: Truck },
    { title: 'Ресурсная карта', text: 'Создать [Карту ресурсов] для проекта [Линия 5]', icon: Layers },
    { title: 'Узкие места', text: 'Найти [узкие места] в текущих [процессных цепочках]', icon: AlertCircle },
  ],
  'Управление': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Управление]', icon: Database },
    { title: 'Оценка команды', text: 'Провести [Оценку 360] для [Командой разработки]', icon: Users },
    { title: 'Мотивация', text: 'Разработать систему [Мотивации] для [Отдела продаж]', icon: Activity },
  ],
  'Производство': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Производство]', icon: Database },
    { title: 'График смен', text: 'Составить [График смен] для [Цеха №4] на [Июнь]', icon: Calendar },
    { title: 'Контроль качества', text: 'Запустить [Аудит качества] продукции [Артикул X]', icon: ClipboardCheck },
  ],
  'Оборудование': [
    { title: 'Основные данные', text: 'Показать [основные данные] по домену [Оборудование]', icon: Database },
    { title: 'Плановое ТО', text: 'Назначить [Плановое ТО] для [Станка B2] на [Понедельник]', icon: Settings2 },
    { title: 'Запчасти', text: 'Проверить [Наличие запчастей] для [Робота R5]', icon: Package },
  ],
};

export const domainNavItems: Record<BusinessDomain, Record<string, string[]>> = {
  'Общий': { 'Основные': ['Чат', 'Сообщения', 'Задачи'], 'Команда': ['Вся команда'], 'Библиотека': ['Документы', 'Дневник'] },
  'Финансы': { 'Учет': ['Отчеты', 'Документы'], 'Аналитика': ['OKRs', 'Дорожная карта'] },
  'Маркетинг': { 'Продвижение': ['Кампании', 'SEO'], 'Лиды': ['Лиды', 'Аналитика'] },
  'Стратегия': { 'Планирование': ['Стратегия', 'OKRs'], 'Анализ': ['Конкуренты', 'Дорожная карта'] },
  'Операции': { 'Процессы': ['Процессы', 'Ресурсы'], 'Логистика': ['Логистика', 'Команда'] },
  'Юридический': { 'Право': ['Юридический', 'Документы'], 'Контроль': ['Юридический Дашборд', 'Дорожная карта'] },
  'Управление': { 'Команда': ['Команда', 'Обсуждения'], 'HR': ['Страницы', 'Геймификация'] },
  'Производство': { 'Цех': ['TQM Dashboard', 'Непрерывное улучшение'], 'Качество': ['Аудиты качества', 'Удовлетворенность клиентов'] },
  'Оборудование': { 'Техника': ['Журнал оборудования', 'Доска оборудования'], 'Сервис': ['Журнал проверок', 'Архив ремонтов'] },
};

export const ALL_DOMAINS: BusinessDomain[] = [
  'Общий', 'Финансы', 'Маркетинг', 'Стратегия', 'Операции',
  'Юридический', 'Управление', 'Производство', 'Оборудование',
];

export const domainInfoCards = [
  { name: 'Финансы' as BusinessDomain, icon: BarChart3, why: 'Cash is King', description: 'Управление P&L, бюджетирование и финансовое планирование', functions: ['P&L', 'Бюджет', 'Аудит', 'Инвестиции'] },
  { name: 'Маркетинг' as BusinessDomain, icon: Globe, why: 'Growth Engine', description: 'Привлечение клиентов, управление брендом и digital-каналами', functions: ['SEO', 'Кампании', 'Лиды', 'Аналитика'] },
  { name: 'Стратегия' as BusinessDomain, icon: Target, why: 'North Star', description: 'Долгосрочное видение, конкурентный анализ и OKR-системы', functions: ['OKRs', 'SWOT', 'Roadmap', 'M&A'] },
  { name: 'Операции' as BusinessDomain, icon: Workflow, why: 'Execution Layer', description: 'Процессы, логистика, ресурсы и операционная эффективность', functions: ['Логистика', 'Ресурсы', 'KPI', 'Процессы'] },
  { name: 'Юридический' as BusinessDomain, icon: Scale, why: 'Risk Shield', description: 'Договорная работа, compliance и защита интересов компании', functions: ['Договоры', 'Риски', 'Compliance', 'M&A'] },
  { name: 'Управление' as BusinessDomain, icon: Users, why: 'People First', description: 'Управление командой, HR и организационное развитие', functions: ['Команда', 'OKRs', 'Геймификация', 'KPI'] },
  { name: 'Производство' as BusinessDomain, icon: Settings2, why: 'Factory Floor', description: 'TQM, контроль качества, управление производством и ISO', functions: ['TQM', 'ISO', 'OEE', 'Аудиты'] },
  { name: 'Оборудование' as BusinessDomain, icon: Package, why: 'Asset Control', description: 'Техническое обслуживание, надёжность и жизненный цикл активов', functions: ['ТО', 'MTBF', 'Ремонты', 'Инспекции'] },
];

// Re-exports for convenience
export { RefreshCw, Smile, Briefcase, RotateCcw, BookOpen };
