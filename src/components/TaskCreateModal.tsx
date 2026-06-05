'use client';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useModalClose } from '../hooks/useModalClose';
import { useAppStore } from '../store/useAppStore';
import { TaskCreateForm } from './TaskCreateForm';
import type { TaskFormData } from './TaskCreateForm';

export function TaskCreateModal() {
  const { showTaskCreateModal, setShowTaskCreateModal, allTasks, setAllTasks } = useAppStore();

  useModalClose(() => setShowTaskCreateModal(false), showTaskCreateModal);

  const handleSave = (data: TaskFormData) => {
    setAllTasks([...allTasks, {
      id: Date.now().toString(),
      title: data.title,
      status: 'pending',
      relatedToType: 'Общий',
    }]);
    setShowTaskCreateModal(false);
  };

  return (
    <AnimatePresence>
      {showTaskCreateModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTaskCreateModal(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 p-6"
          >
            <button
              onClick={() => setShowTaskCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={15} />
            </button>
            <TaskCreateForm
              onSave={handleSave}
              onCancel={() => setShowTaskCreateModal(false)}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
