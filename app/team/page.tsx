'use client';
import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Clock, Search } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useI18n } from '../../src/context/I18nContext';

type MemberStatus = 'online' | 'offline';

export default function TeamPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  const domainTeam = useMemo(
    () => [
      { id: '1', name: 'Анна К.', role: 'HR', status: 'online' as MemberStatus, avatar: 'АК', tasks: [{ title: 'Онбординг новых лидов', status: 'pending' }, { title: 'Обновление базы знаний', status: 'completed' }] },
      { id: '2', name: 'Сергей П.', role: 'Admin', status: 'online' as MemberStatus, avatar: 'СП', tasks: [{ title: 'Мониторинг серверов', status: 'pending' }, { title: 'Патч безопасности #12', status: 'completed' }] },
      { id: '3', name: 'Мария Л.', roleKey: 'marketing', role: t('team.roles.marketing'), status: 'offline' as MemberStatus, avatar: 'МЛ', tasks: [{ title: 'Запуск рекламной кампании', status: 'pending' }] },
      { id: '4', name: 'Дмитрий В.', roleKey: 'development', role: t('team.roles.development'), status: 'online' as MemberStatus, avatar: 'ДВ', tasks: [{ title: 'Деплой v2.4', status: 'completed' }, { title: 'Code review PR#45', status: 'pending' }] },
      { id: '5', name: 'Ольга С.', roleKey: 'finance', role: t('team.roles.finance'), status: 'online' as MemberStatus, avatar: 'ОС', tasks: [{ title: 'Квартальный отчет', status: 'pending' }] },
    ],
    [t],
  );

  const statusLabel = (status: MemberStatus) =>
    status === 'online' ? t('team.statusOnline') : t('team.statusOffline');

  const filtered = domainTeam.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()) || m.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <PageWrapper>
      <div className="px-4 md:px-12 pb-12 max-w-5xl mx-auto w-full">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-proji-border p-4">
            <p className="text-xs font-bold text-proji-secondary uppercase tracking-wide mb-1">{t('team.statsTotal')}</p>
            <p className="text-3xl font-black text-proji-dark">{domainTeam.length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-proji-border p-4">
            <p className="text-xs font-bold text-proji-secondary uppercase tracking-wide mb-1">{t('team.statsOnline')}</p>
            <p className="text-3xl font-black text-proji-success">{domainTeam.filter((m) => m.status === 'online').length}</p>
          </div>
          <div className="bg-white rounded-2xl border border-proji-border p-4">
            <p className="text-xs font-bold text-proji-secondary uppercase tracking-wide mb-1">{t('team.statsTasks')}</p>
            <p className="text-3xl font-black text-proji-primary">{domainTeam.reduce((s, m) => s + m.tasks.length, 0)}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-proji-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('team.searchPlaceholder')}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-proji-border bg-white text-sm text-proji-dark placeholder:text-proji-secondary focus:outline-none focus:border-proji-primary transition-colors"
          />
        </div>

        {/* Team grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedMember(selectedMember === member.id ? null : member.id)}
              className={`bg-white rounded-3xl border p-6 cursor-pointer transition-all hover:shadow-md ${selectedMember === member.id ? 'border-proji-primary shadow-md' : 'border-proji-border'}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-proji-primary/10 text-proji-primary font-black text-sm flex items-center justify-center">
                  {member.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-black text-proji-dark">{member.name}</p>
                  <p className="text-xs text-proji-secondary">{member.role}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${member.status === 'online' ? 'bg-proji-success/10 text-proji-success' : 'bg-slate-100 text-slate-400'}`}>
                  {statusLabel(member.status)}
                </span>
              </div>

              {selectedMember === member.id && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="border-t border-proji-border pt-4 space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-proji-secondary mb-2">{t('team.tasksLabel')}</p>
                  {member.tasks.map((task, j) => (
                    <div key={j} className="flex items-center gap-2">
                      {task.status === 'completed'
                        ? <CheckCircle2 size={12} className="text-proji-success shrink-0" />
                        : <Clock size={12} className="text-proji-amber shrink-0" />}
                      <span className={`text-xs ${task.status === 'completed' ? 'line-through text-proji-secondary' : 'text-proji-dark'}`}>{task.title}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
