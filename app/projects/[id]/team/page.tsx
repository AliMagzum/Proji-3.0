'use client';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { PageWrapper } from '../../../../src/components/PageWrapper';
import { useAppStore } from '../../../../src/store/useAppStore';

export default function ProjectTeamPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { projects } = useAppStore();
  const project = projects.find((p) => p.id === id);

  if (!project) return null;

  return (
    <PageWrapper>
      <div className="max-w-4xl mx-auto w-full px-4 md:px-10 pb-16">

        <button
          onClick={() => router.push(`/projects/${id}`)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors mb-6 mt-1"
        >
          <ChevronLeft size={14} /> Назад к проекту
        </button>

        <h2 className="text-xl font-black text-slate-900 mb-8">Команда</h2>

        <div className="flex flex-col gap-3">
          {(project.team ?? []).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-16">Участников пока нет</p>
          ) : (
            (project.team ?? []).map((member, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-proji-primary/10 flex items-center justify-center text-[11px] font-black text-proji-primary">
                  {member.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-800">{member}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
