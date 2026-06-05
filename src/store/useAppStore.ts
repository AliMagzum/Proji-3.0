'use client';
import { create } from 'zustand';
import type { BusinessDomain, Message, Task, Project, Theme } from '../types';
import { domainViewData, domainNavItems } from '../data/domainData';

export interface ChatSession {
  id: string;
  date: Date;
  domain: BusinessDomain;
  messages: Message[];
}

interface AppStore {
  // Domain
  currentDomain: BusinessDomain;
  setCurrentDomain: (d: BusinessDomain) => void;

  // UI / Layout
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (v: boolean | ((p: boolean) => boolean)) => void;
  isAiPanelOpen: boolean;
  setIsAiPanelOpen: (v: boolean) => void;
  showTopMenu: boolean;
  setShowTopMenu: (v: boolean) => void;
  showDomainDropdown: boolean;
  setShowDomainDropdown: (v: boolean) => void;
  showAccountMenu: boolean;
  setShowAccountMenu: (v: boolean) => void;
  activeSidePanel: string | null;
  setActiveSidePanel: (v: string | null) => void;
  panelPos: { top: number };
  setPanelPos: (v: { top: number }) => void;
  theme: Theme;
  setTheme: (t: Theme) => void;
  showShareModal: boolean;
  setShowShareModal: (v: boolean) => void;
  showQuickAddModal: boolean;
  setShowQuickAddModal: (v: boolean) => void;
  showTaskCreateModal: boolean;
  setShowTaskCreateModal: (v: boolean) => void;
  quickAddType: string;
  setQuickAddType: (t: string) => void;
  quickAddCustomType: string;
  setQuickAddCustomType: (t: string) => void;
  quickAddText: string;
  setQuickAddText: (t: string) => void;
  openDropdown: 'domains' | 'functions' | null;
  setOpenDropdown: (v: 'domains' | 'functions' | null) => void;
  showDomainWelcome: { domain: BusinessDomain; active: boolean };
  setShowDomainWelcome: (v: { domain: BusinessDomain; active: boolean }) => void;
  customPageContent: Record<string, string>;
  setCustomPageContent: (v: Record<string, string>) => void;
  navItems: Record<BusinessDomain, Record<string, string[]>>;
  setNavItems: (v: Record<BusinessDomain, Record<string, string[]>>) => void;

  // Chat / AI
  allMessages: Message[];
  setAllMessages: (msgs: Message[] | ((p: Message[]) => Message[])) => void;
  inputText: string;
  setInputText: (t: string) => void;
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  currentThought: string;
  setCurrentThought: (t: string) => void;
  chatHistory: ChatSession[];
  setChatHistory: (h: ChatSession[] | ((p: ChatSession[]) => ChatSession[])) => void;
  pendingDraft: { title: string; content: string; reasoning: string[] } | null;
  setPendingDraft: (d: { title: string; content: string; reasoning: string[] } | null) => void;
  showCelebration: boolean;
  setShowCelebration: (v: boolean) => void;

  // Tasks
  allTasks: Task[];
  setAllTasks: (tasks: Task[] | ((p: Task[]) => Task[])) => void;
  selectedTask: Task | null;
  setSelectedTask: (t: Task | null) => void;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: (v: boolean) => void;

  // Projects
  projects: Project[];
  setProjects: (p: Project[] | ((p: Project[]) => Project[])) => void;
  initProjects: () => void;
  selectedProject: Project | null;
  setSelectedProject: (p: Project | null) => void;
  isProjectModalOpen: boolean;
  setIsProjectModalOpen: (v: boolean) => void;
  expandedFramework: string | null;
  setExpandedFramework: (v: string | null) => void;
  newProject: Partial<Project>;
  setNewProject: (p: Partial<Project>) => void;
  hoveredProjectId: string | null;
  setHoveredProjectId: (v: string | null) => void;
  hoveredStepId: string | null;
  setHoveredStepId: (v: string | null) => void;
  isLaunching: boolean;
  setIsLaunching: (v: boolean) => void;
  processStarted: boolean;
  setProcessStarted: (v: boolean) => void;

  // Documents / Files
  allDocs: Record<BusinessDomain, any[]>;
  setAllDocs: (docs: Record<BusinessDomain, any[]> | ((p: Record<BusinessDomain, any[]>) => Record<BusinessDomain, any[]>)) => void;
  selectedFile: any;
  setSelectedFile: (f: any) => void;
  isFileAiOpen: boolean;
  setIsFileAiOpen: (v: boolean) => void;
  activePage: number;
  setActivePage: (v: number) => void;
  isEditingDoc: boolean;
  setIsEditingDoc: (v: boolean) => void;
  editedContent: any;
  setEditedContent: (v: any) => void;

  // Team / Equipment
  selectedMember: any;
  setSelectedMember: (m: any) => void;
  selectedKanbanTask: any;
  setSelectedKanbanTask: (v: any) => void;
  equipmentLog: any[];
  setEquipmentLog: (v: any[]) => void;
  inspectionLogs: any[];
  setInspectionLogs: (v: any[]) => void;
  reportPeriod: 'daily' | 'weekly' | 'monthly';
  setReportPeriod: (v: 'daily' | 'weekly' | 'monthly') => void;
}

const initialDocs = Object.keys(domainViewData).reduce((acc, key) => ({
  ...acc,
  [key]: domainViewData[key as BusinessDomain].documents,
}), {} as Record<BusinessDomain, any[]>);

export const useAppStore = create<AppStore>((set) => ({
  // Domain
  currentDomain: 'Общий',
  setCurrentDomain: (d) => set({ currentDomain: d }),

  // UI / Layout
  isSidebarExpanded: false,
  setIsSidebarExpanded: (v) => set((s) => ({ isSidebarExpanded: typeof v === 'function' ? v(s.isSidebarExpanded) : v })),
  isAiPanelOpen: false,
  setIsAiPanelOpen: (v) => set({ isAiPanelOpen: v }),
  showTopMenu: true,
  setShowTopMenu: (v) => set({ showTopMenu: v }),
  showDomainDropdown: false,
  setShowDomainDropdown: (v) => set({ showDomainDropdown: v }),
  showAccountMenu: false,
  setShowAccountMenu: (v) => set({ showAccountMenu: v }),
  activeSidePanel: null,
  setActiveSidePanel: (v) => set({ activeSidePanel: v }),
  panelPos: { top: 0 },
  setPanelPos: (v) => set({ panelPos: v }),
  theme: 'light',
  setTheme: (t) => set({ theme: t }),
  showShareModal: false,
  setShowShareModal: (v) => set({ showShareModal: v }),
  showQuickAddModal: false,
  setShowQuickAddModal: (v) => set({ showQuickAddModal: v }),
  showTaskCreateModal: false,
  setShowTaskCreateModal: (v) => set({ showTaskCreateModal: v }),
  quickAddType: 'заметка',
  setQuickAddType: (t) => set({ quickAddType: t }),
  quickAddCustomType: '',
  setQuickAddCustomType: (t) => set({ quickAddCustomType: t }),
  quickAddText: '',
  setQuickAddText: (t) => set({ quickAddText: t }),
  openDropdown: null,
  setOpenDropdown: (v) => set({ openDropdown: v }),
  showDomainWelcome: { domain: 'Общий', active: false },
  setShowDomainWelcome: (v) => set({ showDomainWelcome: v }),
  customPageContent: {},
  setCustomPageContent: (v) => set({ customPageContent: v }),
  navItems: domainNavItems,
  setNavItems: (v) => set({ navItems: v }),

  // Chat / AI
  allMessages: [],
  setAllMessages: (msgs) => set((s) => ({ allMessages: typeof msgs === 'function' ? msgs(s.allMessages) : msgs })),
  inputText: '',
  setInputText: (t) => set({ inputText: t }),
  isProcessing: false,
  setIsProcessing: (v) => set({ isProcessing: v }),
  currentThought: '',
  setCurrentThought: (t) => set({ currentThought: t }),
  chatHistory: [],
  setChatHistory: (h) => set((s) => ({ chatHistory: typeof h === 'function' ? h(s.chatHistory) : h })),
  pendingDraft: null,
  setPendingDraft: (d) => set({ pendingDraft: d }),
  showCelebration: false,
  setShowCelebration: (v) => set({ showCelebration: v }),

  // Tasks
  allTasks: [
    { id: '1', title: 'Отчет по маркетингу', status: 'pending', relatedToType: 'Проект', relatedToName: 'Marketing Q2' },
    { id: '2', title: 'Встреча: Strategy Sync', status: 'completed', relatedToType: 'Общий' },
    { id: 'journal-1', title: 'Доработать договор аренды', status: 'pending', relatedToType: 'Юридический', relatedToName: 'Аренда Офиса' },
    { id: 'journal-2', title: 'Подготовить форму отчетности KPI', status: 'pending', relatedToType: 'Документ', relatedToName: 'KPI Template' },
    { id: 'journal-3', title: 'Запустить TikTok креативы', status: 'pending', relatedToType: 'Проект', relatedToName: 'Gen Z Campaign' },
  ],
  setAllTasks: (tasks) => set((s) => ({ allTasks: typeof tasks === 'function' ? tasks(s.allTasks) : tasks })),
  selectedTask: null,
  setSelectedTask: (t) => set({ selectedTask: t }),
  isTaskModalOpen: false,
  setIsTaskModalOpen: (v) => set({ isTaskModalOpen: v }),

  // Projects
  projects: [],
  setProjects: (p) => set((s) => {
    const next = typeof p === 'function' ? p(s.projects) : p;
    if (typeof window !== 'undefined') localStorage.setItem('proji_projects', JSON.stringify(next));
    return { projects: next };
  }),
  initProjects: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('proji_projects');
      if (saved) set({ projects: JSON.parse(saved) });
    } catch {}
  },
  selectedProject: null,
  setSelectedProject: (p) => set({ selectedProject: p }),
  isProjectModalOpen: false,
  setIsProjectModalOpen: (v) => set({ isProjectModalOpen: v }),
  expandedFramework: null,
  setExpandedFramework: (v) => set({ expandedFramework: v }),
  newProject: {},
  setNewProject: (p) => set({ newProject: p }),
  hoveredProjectId: null,
  setHoveredProjectId: (v) => set({ hoveredProjectId: v }),
  hoveredStepId: null,
  setHoveredStepId: (v) => set({ hoveredStepId: v }),
  isLaunching: false,
  setIsLaunching: (v) => set({ isLaunching: v }),
  processStarted: false,
  setProcessStarted: (v) => set({ processStarted: v }),

  // Documents
  allDocs: initialDocs,
  setAllDocs: (docs) => set((s) => ({ allDocs: typeof docs === 'function' ? docs(s.allDocs) : docs })),
  selectedFile: null,
  setSelectedFile: (f) => set({ selectedFile: f }),
  isFileAiOpen: false,
  setIsFileAiOpen: (v) => set({ isFileAiOpen: v }),
  activePage: 0,
  setActivePage: (v) => set({ activePage: v }),
  isEditingDoc: false,
  setIsEditingDoc: (v) => set({ isEditingDoc: v }),
  editedContent: null,
  setEditedContent: (v) => set({ editedContent: v }),

  // Team / Equipment
  selectedMember: null,
  setSelectedMember: (m) => set({ selectedMember: m }),
  selectedKanbanTask: null,
  setSelectedKanbanTask: (v) => set({ selectedKanbanTask: v }),
  equipmentLog: [],
  setEquipmentLog: (v) => set({ equipmentLog: v }),
  inspectionLogs: [],
  setInspectionLogs: (v) => set({ inspectionLogs: v }),
  reportPeriod: 'weekly',
  setReportPeriod: (v) => set({ reportPeriod: v }),
}));
