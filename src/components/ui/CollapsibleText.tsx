import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, ChevronDown, ShieldCheck, FileSignature } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface CollapsibleTextProps {
  title?: string;
  text: string;
  showTransfer?: boolean;
  onTransfer?: (text: string) => void;
}

export const CollapsibleText = ({ title, text, showTransfer = false, onTransfer }: CollapsibleTextProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className={`space-y-6 ${showTransfer ? 'my-12' : ''}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-5 hover:bg-proji-sidebar transition-all text-left rounded-[2rem] ${showTransfer ? 'bg-white border-2 border-proji-primary/20 shadow-xl' : 'hover:bg-proji-sidebar/50'}`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-2xl ${showTransfer ? 'bg-proji-primary text-white shadow-lg' : 'bg-proji-primary/10 text-proji-primary'}`}>
            <FileText size={showTransfer ? 20 : 16} />
          </div>
          <div className="flex flex-col">
            <span className={`font-black uppercase tracking-[0.2em] text-proji-dark ${showTransfer ? 'text-[14px]' : 'text-[11px]'}`}>
              {title || (showTransfer ? 'Официальный документ' : 'Содержание')}
            </span>
            {showTransfer && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-proji-mint font-black uppercase tracking-widest">Статус: Верифицировано</span>
                <div className="w-1 h-1 rounded-full bg-proji-mint animate-pulse" />
              </div>
            )}
          </div>
        </div>
        <div className={`p-2 rounded-full transition-transform duration-500 ${isExpanded ? 'rotate-180 bg-proji-primary/10 text-proji-primary' : 'bg-proji-sidebar text-proji-secondary'}`}>
          <ChevronDown size={20} />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: 10 }}
            animate={{ height: 'auto', opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: 10 }}
            className="overflow-hidden"
          >
            <div className={`relative ${showTransfer ? 'p-12 md:p-20 bg-[#fdfdfd] border border-proji-border shadow-[0_45px_100px_rgba(0,0,0,0.12)] rounded-[40px] mx-1 mt-4' : 'p-6 pt-0'}`}>
              {showTransfer && (
                <>
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-proji-primary via-proji-mint to-proji-primary opacity-20" />
                  <div className="absolute top-12 right-12 opacity-5 pointer-events-none select-none">
                    <div className="text-9xl font-black rotate-45">PROJI</div>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start mb-16 gap-8 border-b-2 border-proji-border pb-10">
                    <div className="space-y-4">
                      <div className="text-3xl font-black text-proji-dark tracking-tighter lowercase">proji</div>
                      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-proji-secondary">Business Analysis Division</div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-widest text-proji-secondary">Document Release: #PRE-{Math.floor(Math.random() * 9000) + 1000}</div>
                      <div className="text-[10px] font-bold text-proji-primary">DATE: {new Date().toLocaleDateString('ru-RU')}</div>
                      <div className="text-[10px] font-medium text-proji-secondary/60">CONFIDENTIAL / INTERNAL USE ONLY</div>
                    </div>
                  </div>
                </>
              )}

              <div className={`prose prose-blue prose-p:leading-loose prose-headings:text-proji-dark prose-headings:font-black prose-headings:tracking-tight max-w-none text-proji-text ${showTransfer ? 'font-serif text-[17px]' : 'text-sm font-sans'}`}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
              </div>

              {showTransfer && (
                <div className="mt-20">
                  <div className="flex flex-wrap items-end justify-between gap-12 pt-12 border-t-2 border-proji-border/30">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-4 border-proji-primary/20 flex items-center justify-center text-proji-primary transform -rotate-12">
                          <ShieldCheck size={32} className="opacity-40" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-[8px] font-black uppercase tracking-tighter text-proji-primary leading-none text-center">AI<br />VERFIED</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-proji-dark mb-1">Authenticated by Proji Engine</span>
                        <span className="text-[9px] text-proji-secondary font-mono">HASH: {Math.random().toString(36).substring(2, 15).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-48 h-px bg-proji-dark/20" />
                      <div className="text-[9px] font-black uppercase tracking-widest text-proji-secondary/40">Responsible Analyst Signature</div>
                    </div>
                    <button
                      onClick={() => onTransfer?.(text)}
                      className="flex items-center gap-3 px-10 py-5 bg-proji-dark text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-proji-primary transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] active:scale-95 group"
                    >
                      <FileSignature size={20} className="group-hover:scale-110 transition-transform" />
                      Передать в документы
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
