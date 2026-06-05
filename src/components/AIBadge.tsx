'use client';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export function AIBadge() {
  const { isAiPanelOpen, setIsAiPanelOpen, isProcessing } = useAppStore();

  return (
    <motion.button
      onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[200] flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg transition-colors ${
        isAiPanelOpen
          ? 'bg-proji-primary text-white'
          : 'bg-white border border-slate-200 text-slate-600 hover:border-proji-primary hover:text-proji-primary'
      }`}
    >
      <motion.div
        animate={isProcessing ? { opacity: [1, 0.4, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.2 }}
      >
        <Sparkles size={15} />
      </motion.div>
      <span className="text-xs font-bold">AI</span>
      {isProcessing && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
      )}
    </motion.button>
  );
}
