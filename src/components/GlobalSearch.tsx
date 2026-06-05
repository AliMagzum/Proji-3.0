'use client';
import { useState, useRef } from 'react';
import { Search, X, CheckCircle2, Folder, FileText, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../store/useAppStore';

type Result = { type: string; label: string; sub: string; href: string };

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { allTasks, projects } = useAppStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const results: Result[] = query.trim().length > 1
    ? [
        ...allTasks
          .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4)
          .map((t) => ({ type: 'task', label: t.title, sub: t.relatedToType ?? '', href: '/tasks' })),
        ...projects
          .filter((p) => p.name?.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 3)
          .map((p) => ({ type: 'project', label: p.name ?? '', sub: 'Проект', href: '/projects' })),
      ]
    : [];

  const go = (r: Result) => {
    router.push(r.href);
    setQuery('');
    setOpen(false);
  };

  const icons: Record<string, React.ComponentType<any>> = {
    task: CheckCircle2,
    project: Folder,
    document: FileText,
    team: Users,
  };

  return (
    <div className="relative">
      <div className="relative flex items-center">
        <Search size={13} className="absolute left-2.5 text-slate-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Поиск..."
          className="h-8 pl-8 pr-7 w-44 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-proji-primary focus:w-56 transition-all duration-200"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
            className="absolute right-2 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={11} />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-[200] py-1 overflow-hidden">
          {results.map((r, i) => {
            const Icon = icons[r.type] ?? CheckCircle2;
            return (
              <button
                key={i}
                onMouseDown={() => go(r)}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 text-left transition-colors"
              >
                <Icon size={13} className="text-proji-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-slate-800 truncate">{r.label}</p>
                  {r.sub && <p className="text-[10px] text-slate-400">{r.sub}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {open && query.trim().length > 1 && results.length === 0 && (
        <div className="absolute top-full mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-[200] py-3 px-3">
          <p className="text-xs text-slate-400 text-center">Ничего не найдено</p>
        </div>
      )}
    </div>
  );
}
