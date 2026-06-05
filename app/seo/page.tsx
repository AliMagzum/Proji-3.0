'use client';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, TrendingUp, TrendingDown, Globe, BarChart3, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';

interface Keyword {
  keyword: string; position: number; prevPosition: number; volume: number; difficulty: number; url: string;
}
interface Page { url: string; sessions: number; bounce: string; duration: string; conversions: number; }

const KEYWORDS: Keyword[] = [
  { keyword: 'crm система для бизнеса',     position: 3,  prevPosition: 7,  volume: 8400,  difficulty: 62, url: '/crm' },
  { keyword: 'управление проектами онлайн',  position: 5,  prevPosition: 5,  volume: 12000, difficulty: 71, url: '/projects' },
  { keyword: 'таск менеджер для команды',    position: 8,  prevPosition: 12, volume: 5200,  difficulty: 48, url: '/tasks' },
  { keyword: 'бизнес аналитика dashboard',   position: 14, prevPosition: 9,  volume: 3100,  difficulty: 55, url: '/analytics' },
  { keyword: 'автоматизация бизнес процессов',position: 2,  prevPosition: 4,  volume: 6700,  difficulty: 68, url: '/' },
  { keyword: 'корпоративный мессенджер',     position: 21, prevPosition: 25, volume: 4500,  difficulty: 74, url: '/chat' },
  { keyword: 'okr система постановки целей', position: 11, prevPosition: 11, volume: 2800,  difficulty: 43, url: '/okrs' },
];

const TOP_PAGES: Page[] = [
  { url: '/',           sessions: 12400, bounce: '32%', duration: '3:24', conversions: 187 },
  { url: '/crm',        sessions: 8700,  bounce: '41%', duration: '2:58', conversions: 134 },
  { url: '/projects',   sessions: 6200,  bounce: '38%', duration: '4:12', conversions: 98 },
  { url: '/analytics',  sessions: 4100,  bounce: '45%', duration: '2:10', conversions: 52 },
  { url: '/tasks',      sessions: 3800,  bounce: '36%', duration: '3:41', conversions: 71 },
];

function PositionDelta({ curr, prev }: { curr: number; prev: number }) {
  const delta = prev - curr;
  if (delta > 0) return <span className="flex items-center gap-0.5 text-green-600 text-xs font-bold"><ArrowUp size={11} />{delta}</span>;
  if (delta < 0) return <span className="flex items-center gap-0.5 text-red-500 text-xs font-bold"><ArrowDown size={11} />{Math.abs(delta)}</span>;
  return <span className="flex items-center gap-0.5 text-slate-400 text-xs"><Minus size={11} />0</span>;
}

export default function SEOPage() {
  const [tab, setTab] = useState<'keywords' | 'pages'>('keywords');

  const top10  = KEYWORDS.filter((k) => k.position <= 10).length;
  const top3   = KEYWORDS.filter((k) => k.position <= 3).length;
  const avgPos = Math.round(KEYWORDS.reduce((s, k) => s + k.position, 0) / KEYWORDS.length);
  const rising = KEYWORDS.filter((k) => k.prevPosition > k.position).length;

  const TAB = (t: string) =>
    `px-4 py-2 text-sm font-bold rounded-xl transition-all ${tab === t ? 'bg-proji-primary text-white' : 'text-slate-500 hover:bg-slate-100'}`;

  return (
    <PageWrapper>
      <div className="max-w-5xl mx-auto w-full px-4 md:px-10 pb-16">

        <div className="flex items-center gap-2 mb-2 pt-1">
          <Search size={20} className="text-proji-primary" />
          <h1 className="text-xl font-black text-slate-900">SEO аналитика</h1>
        </div>
        <p className="text-sm text-slate-400 mb-8">Позиции ключевых слов, органический трафик, топ страницы</p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Средняя позиция', value: avgPos,      icon: BarChart3,   color: 'text-proji-primary' },
            { label: 'В топ-10',         value: top10,       icon: TrendingUp,  color: 'text-green-500' },
            { label: 'В топ-3',          value: top3,        icon: Globe,       color: 'text-blue-500' },
            { label: 'Растут',           value: rising,      icon: TrendingUp,  color: 'text-orange-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <Icon size={16} className={`${color} mb-2`} />
              <p className="text-2xl font-black text-slate-900">{value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Visibility bar */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-6">
          <p className="text-xs font-bold text-slate-500 mb-3">Видимость сайта в поиске</p>
          <div className="flex gap-2 items-end h-12">
            {[28, 31, 29, 35, 38, 42, 41, 44, 48, 51, 47, 54].map((v, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-proji-primary/20 rounded-t hover:bg-proji-primary/40 transition-colors relative group"
                initial={{ height: 0 }} animate={{ height: `${(v / 60) * 100}%` }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {v}%
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 mt-1">
            <span>Янв</span><span>Фев</span><span>Мар</span><span>Апр</span><span>Май</span><span>Июн</span>
            <span>Июл</span><span>Авг</span><span>Сен</span><span>Окт</span><span>Ноя</span><span>Дек</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button className={TAB('keywords')} onClick={() => setTab('keywords')}>Ключевые слова</button>
          <button className={TAB('pages')} onClick={() => setTab('pages')}>Топ страницы</button>
        </div>

        {/* Keywords */}
        {tab === 'keywords' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr_2fr] gap-3 px-5 py-3 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Ключевое слово</span><span>Позиция</span><span>Динамика</span><span>Объём</span><span>URL</span>
            </div>
            {KEYWORDS.map((k) => (
              <div key={k.keyword} className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_2fr] gap-2 md:gap-3 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{k.keyword}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${k.difficulty < 40 ? 'bg-green-400' : k.difficulty < 65 ? 'bg-yellow-400' : 'bg-red-400'}`}
                        style={{ width: `${k.difficulty}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">сложность {k.difficulty}</span>
                  </div>
                </div>
                <div className="self-center">
                  <span className={`text-lg font-black ${k.position <= 3 ? 'text-green-600' : k.position <= 10 ? 'text-proji-primary' : 'text-slate-500'}`}>
                    #{k.position}
                  </span>
                </div>
                <div className="self-center"><PositionDelta curr={k.position} prev={k.prevPosition} /></div>
                <p className="text-xs text-slate-600 self-center">{k.volume.toLocaleString()}/мес</p>
                <p className="text-xs text-proji-primary font-semibold self-center truncate">{k.url}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pages */}
        {tab === 'pages' && (
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-3 px-5 py-3 border-b border-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Страница</span><span>Сессии</span><span>Отказы</span><span>Время</span><span>Конверсии</span>
            </div>
            {TOP_PAGES.map((p) => (
              <div key={p.url} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-2 md:gap-3 px-5 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                <p className="text-sm font-bold text-proji-primary self-center">{p.url}</p>
                <p className="text-sm font-bold text-slate-700 self-center">{p.sessions.toLocaleString()}</p>
                <p className="text-sm text-slate-500 self-center">{p.bounce}</p>
                <p className="text-sm text-slate-500 self-center">{p.duration}</p>
                <p className="text-sm font-bold text-green-600 self-center">{p.conversions}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </PageWrapper>
  );
}
