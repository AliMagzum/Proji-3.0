'use client';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ChevronLeft, Folder, BarChart3, CheckCircle2, FileText, Calendar, Target, Users } from 'lucide-react';
import { PageWrapper } from '../../../src/components/PageWrapper';
import { useAppStore } from '../../../src/store/useAppStore';
import { useI18n } from '../../../src/context/I18nContext';

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-600',
  'Planning':    'bg-yellow-100 text-yellow-600',
  'Completed':   'bg-green-100 text-green-600',
  'On Hold':     'bg-slate-100 text-slate-500',
};

export default function ProjectOverviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return (
      <PageWrapper>
        <div className="p-12 text-center">
          <p className="text-slate-400 mb-4">{t('projects.overview.notFound')}</p>
          <button onClick={() => router.push('/projects')} className="text-proji-primary text-sm font-bold hover:underline">
            {t('projects.overview.backToList')}
          </button>
        </div>
      </PageWrapper>
    );
  }

  const taskCount = project.tasks?.length ?? 0;
  const fileCount = project.reports?.length ?? 0;

  const sections = [
    {
      label: t('projects.overview.tasks'),
      href: `/projects/${id}/tasks`,
      icon: CheckCircle2,
      desc: t('projects.overview.tasksCount').replace('{count}', String(taskCount)),
    },
    {
      label: t('projects.overview.reports'),
      href: `/projects/${id}/reports`,
      icon: BarChart3,
      desc: t('projects.overview.dailyReport'),
    },
    {
      label: t('projects.overview.documents'),
      href: `/projects/${id}/docs`,
      icon: FileText,
      desc: t('projects.overview.filesCount').replace('{count}', String(fileCount)),
    },
  ];

  const info = [
    {
      label: t('projects.overview.start'),
      value: project.startDate || '—',
      icon: <Calendar size={14} className="text-proji-primary" />,
    },
    {
      label: t('projects.overview.deadline'),
      value: project.deadline || t('projects.overview.notSet'),
      icon: <Calendar size={14} className="text-orange-400" />,
    },
    {
      label: t('projects.overview.methodology'),
      value: project.framework || '—',
      icon: <BarChart3 size={14} className="text-blue-400" />,
    },
    {
      label: t('projects.overview.budget'),
      value: project.budget || '—',
      icon: <Target size={14} className="text-green-500" />,
    },
    {
      label: t('projects.overview.spent'),
      value: project.spent || '—',
      icon: <Target size={14} className="text-red-400" />,
    },
    {
      label: t('projects.overview.team'),
      value: project.team?.length
        ? t('projects.overview.teamCount').replace('{count}', String(project.team.length))
        : '—',
      icon: <Users size={14} className="text-purple-400" />,
    },
  ];

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto w-full px-4 md:px-10 pb-16">
        <button
          onClick={() => router.push('/projects')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-6 mt-1"
        >
          <ChevronLeft size={14} /> {t('projects.overview.allProjects')}
        </button>

        <div className="flex items-start gap-4 mb-10">
          <div className="p-3 rounded-2xl bg-proji-primary/10 shrink-0">
            <Folder size={22} className="text-proji-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900">{project.name}</h1>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${STATUS_COLORS[project.status] ?? 'bg-slate-100 text-slate-500'}`}>
                {project.status}
              </span>
            </div>
            {project.description && (
              <p className="text-sm text-slate-500 mt-1">{project.description}</p>
            )}
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span className="font-semibold">{t('projects.overview.progress')}</span>
            <span className="font-bold text-slate-800">{project.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-proji-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${project.progress}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {sections.map(({ label, href, icon: Icon, desc }) => (
            <button
              key={href}
              onClick={() => router.push(href)}
              className="flex flex-col gap-3 bg-white border border-slate-100 rounded-2xl p-5 hover:border-proji-primary/30 hover:shadow-sm transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-proji-primary/10 flex items-center justify-center">
                <Icon size={18} className="text-proji-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800 group-hover:text-proji-primary transition-colors">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {info.map((item) => (
            <div key={item.label} className="bg-white rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">
                {item.icon}{item.label}
              </div>
              <p className="text-base font-black text-slate-800">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
