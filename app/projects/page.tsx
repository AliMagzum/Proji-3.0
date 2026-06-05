'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Folder, X, ChevronRight, BarChart3, Calendar } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useAppStore } from '../../src/store/useAppStore';
import type { Project } from '../../src/types';
import { useI18n } from '../../src/context/I18nContext';

const STATUS_COLORS: Record<string, string> = {
  'In Progress': 'bg-blue-100 text-blue-600',
  'Planning': 'bg-yellow-100 text-yellow-600',
  'Completed': 'bg-green-100 text-green-600',
  'On Hold': 'bg-slate-100 text-slate-500',
};

const SAMPLE_PROJECTS: Project[] = [
  {
    id: '1', name: 'Marketing Q2', description: 'Запуск маркетинговых кампаний на второй квартал', status: 'In Progress',
    framework: 'Agile', deadline: '30.06.2024', startDate: '01.04.2024', progress: 65, team: ['АК', 'МЛ'],
    budget: '₽500,000', spent: '₽325,000', taskObjective: 'Увеличить охват на 40%', strategicGoal: 'Рост',
    originResearch: 'Анализ рынка Q1', riskLevel: 'Medium', priority: 'P1', stakeholder: 'CMO',
    roi: '180%', milestones: ['Запуск кампании', 'A/B тест', 'Анализ'], complianceStatus: 'Verified',
    resourceUtilization: 70, qualityMetric: '4.2/5', scalabilityIndex: 7,
    tasks: [{ title: 'Дизайн баннеров', status: 'done' }, { title: 'Настройка таргетинга', status: 'doing' }],
    reports: [{ name: 'Отчет Q1', date: '31.03.2024' }], createdBy: 'Мария Л.', lastEditedBy: 'Анна К.',
    frameworks: {},
  },
  {
    id: '2', name: 'Platform v2.0', description: 'Релиз новой версии платформы с AI-функционалом', status: 'Planning',
    framework: 'Scrum', deadline: '31.12.2024', startDate: '01.07.2024', progress: 10, team: ['ДВ'],
    budget: '₽1,200,000', spent: '₽45,000', taskObjective: 'AI-интеграция', strategicGoal: 'Инновации',
    originResearch: 'User research', riskLevel: 'High', priority: 'P0', stakeholder: 'CTO',
    roi: '250%', milestones: ['MVP', 'Beta', 'Launch'], complianceStatus: 'Pending',
    resourceUtilization: 15, qualityMetric: '—', scalabilityIndex: 9,
    tasks: [{ title: 'Архитектура', status: 'doing' }, { title: 'AI-модуль', status: 'todo' }],
    reports: [], createdBy: 'Дмитрий В.', lastEditedBy: 'Дмитрий В.',
    frameworks: {},
  },
];

export default function ProjectsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { projects, setProjects, setSelectedProject } = useAppStore();
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const allProjects = projects.length > 0 ? projects : SAMPLE_PROJECTS;

  const createProject = () => {
    if (!newName.trim()) return;
    const p: Project = {
      id: Date.now().toString(), name: newName.trim(), description: newDesc.trim(),
      status: 'Planning', framework: 'Agile', deadline: '', startDate: new Date().toLocaleDateString('ru'),
      progress: 0, team: [], budget: '', spent: '', taskObjective: '', strategicGoal: '',
      originResearch: '', riskLevel: 'Low', priority: 'P2', stakeholder: '', roi: '',
      milestones: [], tasks: [], reports: [], createdBy: 'Я', lastEditedBy: 'Я',
      complianceStatus: 'None', resourceUtilization: 0, qualityMetric: '—', scalabilityIndex: 5,
      frameworks: {},
    };
    setProjects((prev) => [...(prev.length > 0 ? prev : SAMPLE_PROJECTS), p]);
    setShowNew(false);
    setNewName('');
    setNewDesc('');
  };

  return (
    <PageWrapper>
      <div className="px-4 md:px-12 pb-12 max-w-5xl mx-auto w-full">
        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-xs font-black uppercase tracking-widest text-proji-secondary">
            {t('projects.list.count').replace('{count}', String(allProjects.length))}
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-proji-primary text-white rounded-2xl text-sm font-bold hover:bg-proji-primary/90 transition-all"
          >
            <Plus size={16} /> {t('projects.list.newProject')}
          </button>
        </div>

        {/* New project form */}
        <AnimatePresence>
          {showNew && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-3xl border border-proji-primary/30 p-6 mb-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-black text-proji-dark">{t('projects.list.formTitle')}</p>
                <button onClick={() => setShowNew(false)} className="p-1.5 rounded-lg text-proji-secondary hover:bg-slate-100 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <input
                autoFocus
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t('projects.list.namePlaceholder')}
                className="w-full px-4 py-3 rounded-2xl border border-proji-border text-sm text-proji-dark placeholder:text-proji-secondary focus:outline-none focus:border-proji-primary transition-colors"
              />
              <input
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder={t('projects.list.descPlaceholder')}
                className="w-full px-4 py-3 rounded-2xl border border-proji-border text-sm text-proji-dark placeholder:text-proji-secondary focus:outline-none focus:border-proji-primary transition-colors"
              />
              <button
                onClick={createProject}
                disabled={!newName.trim()}
                className="px-5 py-2.5 bg-proji-primary text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-proji-primary/90 transition-all"
              >
                {t('projects.list.create')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Project cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {allProjects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-3xl border border-proji-border p-6 hover:shadow-md transition-all cursor-pointer group"
              onClick={() => router.push(`/projects/${project.id}`)}
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2.5 rounded-2xl bg-proji-primary/10 shrink-0">
                  <Folder size={18} className="text-proji-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-proji-dark truncate">{project.name}</p>
                  <p className="text-xs text-proji-secondary truncate">{project.description}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-lg shrink-0 ${STATUS_COLORS[project.status] ?? 'bg-slate-100 text-slate-500'}`}>
                  {project.status}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs text-proji-secondary mb-1.5">
                  <span>{t('projects.list.progress')}</span>
                  <span className="font-bold">{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-proji-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-proji-secondary">
                  <span className="flex items-center gap-1"><Calendar size={11} /> {project.deadline || t('projects.list.noDeadline')}</span>
                  <span className="flex items-center gap-1"><BarChart3 size={11} /> {project.framework}</span>
                </div>
                <ChevronRight size={14} className="text-proji-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
