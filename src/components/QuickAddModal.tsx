'use client';
import { useRef, useEffect, useState } from 'react';
import { useModalClose } from '../hooks/useModalClose';
import { motion, AnimatePresence } from 'motion/react';
import { X, PenTool, Folder } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function QuickAddModal() {
  const {
    showQuickAddModal, setShowQuickAddModal,
    quickAddType, setQuickAddType,
    quickAddCustomType, setQuickAddCustomType,
    quickAddText, setQuickAddText,
    allTasks, setAllTasks,
    projects, setProjects,
  } = useAppStore();

  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const projNameRef = useRef<HTMLInputElement>(null);

  const isProject = quickAddType === 'проект';

  useEffect(() => {
    if (!showQuickAddModal) return;
    if (isProject) setTimeout(() => projNameRef.current?.focus(), 50);
    else setTimeout(() => textareaRef.current?.focus(), 50);
  }, [showQuickAddModal, isProject]);

  useModalClose(() => setShowQuickAddModal(false), showQuickAddModal);

  const reset = () => {
    setQuickAddText('');
    setQuickAddType('заметка');
    setQuickAddCustomType('');
    setProjName('');
    setProjDesc('');
  };

  const save = () => {
    if (isProject) {
      if (!projName.trim()) return;
      setProjects([...projects, {
        id: Date.now().toString(),
        name: projName.trim(),
        description: projDesc.trim(),
        status: 'Planning',
        framework: 'Agile',
        deadline: '',
        startDate: new Date().toISOString().slice(0, 10),
        progress: 0,
        team: [],
        budget: '0',
        spent: '0',
        taskObjective: '',
        strategicGoal: '',
        originResearch: '',
      } as any]);
    } else {
      if (!quickAddText.trim()) return;
      const type = quickAddType === 'другое' ? (quickAddCustomType || 'другое') : quickAddType;
      if (type === 'задача') {
        setAllTasks([...allTasks, {
          id: Date.now().toString(),
          title: quickAddText.trim(),
          status: 'pending',
          relatedToType: 'Общий',
        }]);
      }
    }
    setShowQuickAddModal(false);
    reset();
  };

  const close = () => {
    setShowQuickAddModal(false);
    reset();
  };

  return (
    <AnimatePresence>
      {showQuickAddModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                {isProject
                  ? <><Folder size={15} className="text-proji-primary" /> Новый проект</>
                  : <><PenTool size={15} className="text-proji-primary" /> Новая запись</>
                }
              </h2>
              <button
                onClick={close}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {isProject ? (
              <div className="p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Название</label>
                  <input
                    ref={projNameRef}
                    value={projName}
                    onChange={(e) => setProjName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) save(); }}
                    placeholder="Название проекта"
                    className="w-full outline-none text-sm text-slate-800 placeholder:text-slate-400 font-medium border-b border-slate-200 pb-2 focus:border-proji-primary transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Описание</label>
                  <textarea
                    value={projDesc}
                    onChange={(e) => setProjDesc(e.target.value)}
                    placeholder="Кратко опишите проект..."
                    className="w-full h-28 outline-none resize-none text-sm text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed"
                  />
                </div>
              </div>
            ) : (
              <div className="p-5">
                <textarea
                  ref={textareaRef}
                  value={quickAddText}
                  onChange={(e) => setQuickAddText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && e.metaKey) save(); }}
                  placeholder="Что у вас на уме? Пишите здесь..."
                  className="w-full h-36 outline-none resize-none text-sm text-slate-800 placeholder:text-slate-400 font-medium leading-relaxed"
                />
              </div>
            )}

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              {!isProject && (
                <div className="flex items-center gap-2">
                  <select
                    value={quickAddType}
                    onChange={(e) => setQuickAddType(e.target.value)}
                    className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                  >
                    <option value="заметка">заметка</option>
                    <option value="задача">задача</option>
                    <option value="документ">документ</option>
                    <option value="другое">другое...</option>
                  </select>
                  {quickAddType === 'другое' && (
                    <input
                      type="text"
                      value={quickAddCustomType}
                      onChange={(e) => setQuickAddCustomType(e.target.value)}
                      placeholder="Тип..."
                      className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700 outline-none w-28 focus:border-proji-primary transition-colors"
                    />
                  )}
                </div>
              )}
              {isProject && <span />}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 hidden sm:block">⌘ + Enter</span>
                <button
                  onClick={save}
                  disabled={isProject ? !projName.trim() : !quickAddText.trim()}
                  className="bg-proji-primary text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-proji-primary/90 disabled:opacity-40 transition-all"
                >
                  Создать
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
