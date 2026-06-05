'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, FileSpreadsheet, File, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useAppStore } from '../../src/store/useAppStore';
import { useI18n } from '../../src/context/I18nContext';
import { tDomain } from '../../src/i18n/helpers';

const FILE_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  word: FileText,
  excel: FileSpreadsheet,
  pdf: File,
};
const FILE_COLORS: Record<string, string> = {
  word: 'text-blue-500 bg-blue-50',
  excel: 'text-green-500 bg-green-50',
  pdf: 'text-red-500 bg-red-50',
};

export default function DocumentsPage() {
  const { t } = useI18n();
  const { currentDomain, allDocs } = useAppStore();
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [activePage, setActivePage] = useState(0);

  const docs = allDocs[currentDomain] ?? [];
  const filtered = docs.filter((d: any) => d.name.toLowerCase().includes(search.toLowerCase()));
  const domainLabel = tDomain(t, currentDomain);

  const openFile = (file: any) => { setSelectedFile(file); setActivePage(0); };
  const closeFile = () => setSelectedFile(null);

  return (
    <PageWrapper>
      <div className="px-4 md:px-12 pb-12 max-w-6xl mx-auto w-full flex gap-6">
        <div className={`flex flex-col gap-4 transition-all ${selectedFile ? 'w-72 shrink-0' : 'flex-1'}`}>
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-proji-secondary" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('documentsPage.searchPlaceholder')}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-proji-border bg-white text-sm text-proji-dark placeholder:text-proji-secondary focus:outline-none focus:border-proji-primary transition-colors"
            />
          </div>

          <p className="text-xs font-black uppercase tracking-widest text-proji-secondary">
            {t('documentsPage.domainCount')
              .replace('{domain}', domainLabel)
              .replace('{count}', String(filtered.length))}
          </p>

          <div className="flex flex-col gap-2">
            {filtered.map((doc: any, i: number) => {
              const Icon = FILE_ICONS[doc.type] ?? File;
              const colorClass = FILE_COLORS[doc.type] ?? 'text-slate-500 bg-slate-100';
              const isSelected = selectedFile?.name === doc.name;
              return (
                <motion.button
                  key={i}
                  onClick={() => isSelected ? closeFile() : openFile(doc)}
                  className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${isSelected ? 'border-proji-primary bg-proji-primary/5' : 'border-proji-border bg-white hover:border-proji-primary/30'}`}
                >
                  <div className={`p-2 rounded-xl ${colorClass} shrink-0`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-proji-dark truncate">{doc.name}</p>
                    <p className="text-xs text-proji-secondary">{doc.date} · {doc.size}</p>
                  </div>
                </motion.button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-center text-proji-secondary text-sm py-12">{t('documentsPage.notFound')}</p>
            )}
          </div>
        </div>

        <AnimatePresence>
          {selectedFile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 bg-white rounded-3xl border border-proji-border overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-proji-border">
                <div>
                  <p className="text-sm font-black text-proji-dark">{selectedFile.name}</p>
                  <p className="text-xs text-proji-secondary">{selectedFile.author} · {selectedFile.date}</p>
                </div>
                <button onClick={closeFile} className="p-2 rounded-xl text-proji-secondary hover:text-proji-dark hover:bg-slate-100 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 p-8 overflow-y-auto">
                {selectedFile.pages && selectedFile.pages.length > 0 ? (
                  <div className="max-w-2xl mx-auto">
                    <p className="text-xs font-bold uppercase tracking-widest text-proji-secondary mb-4">
                      {t('documentsPage.pageOf')
                        .replace('{current}', String(activePage + 1))
                        .replace('{total}', String(selectedFile.pages.length))}
                    </p>
                    <div className="whitespace-pre-wrap text-sm text-proji-dark leading-relaxed bg-slate-50 rounded-2xl p-6 min-h-[300px]">
                      {selectedFile.pages[activePage]}
                    </div>
                  </div>
                ) : (
                  <p className="text-proji-secondary text-sm text-center py-16">{t('documentsPage.contentUnavailable')}</p>
                )}
              </div>

              {selectedFile.pages && selectedFile.pages.length > 1 && (
                <div className="flex items-center justify-between px-6 py-3 border-t border-proji-border">
                  <button
                    onClick={() => setActivePage((p) => Math.max(0, p - 1))}
                    disabled={activePage === 0}
                    className="flex items-center gap-1.5 text-xs font-bold text-proji-secondary disabled:opacity-30 hover:text-proji-primary transition-colors"
                  >
                    <ChevronLeft size={14} /> {t('documentsPage.back')}
                  </button>
                  <div className="flex gap-1.5">
                    {selectedFile.pages.map((_: any, i: number) => (
                      <button
                        key={i}
                        onClick={() => setActivePage(i)}
                        className={`w-2 h-2 rounded-full transition-all ${i === activePage ? 'bg-proji-primary w-4' : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setActivePage((p) => Math.min(selectedFile.pages.length - 1, p + 1))}
                    disabled={activePage === selectedFile.pages.length - 1}
                    className="flex items-center gap-1.5 text-xs font-bold text-proji-secondary disabled:opacity-30 hover:text-proji-primary transition-colors"
                  >
                    {t('documentsPage.next')} <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageWrapper>
  );
}
