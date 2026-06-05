import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { View, BusinessDomain, Message, Task, Project, Theme, Scenario } from '../types';

export interface AppContextValue {
  // Navigation
  activeView: View;
  setActiveView: Dispatch<SetStateAction<View>>;
  prevView: View;
  setPrevView: Dispatch<SetStateAction<View>>;
  navigateToView: (view: View) => void;

  // Domain
  currentDomain: BusinessDomain;
  setCurrentDomain: Dispatch<SetStateAction<BusinessDomain>>;
  scenarios: Scenario[];
  navItems: Record<BusinessDomain, Record<string, string[]>>;
  setNavItems: Dispatch<SetStateAction<Record<BusinessDomain, Record<string, string[]>>>>;
  dynamicNavItems: Record<string, string[]>;
  showDomainWelcome: { domain: BusinessDomain; active: boolean };
  setShowDomainWelcome: Dispatch<SetStateAction<{ domain: BusinessDomain; active: boolean }>>;
  customPageContent: Record<string, string>;
  setCustomPageContent: Dispatch<SetStateAction<Record<string, string>>>;

  // Chat / AI
  allMessages: Message[];
  setAllMessages: Dispatch<SetStateAction<Message[]>>;
  messages: Message[];
  inputText: string;
  setInputText: Dispatch<SetStateAction<string>>;
  isProcessing: boolean;
  setIsProcessing: Dispatch<SetStateAction<boolean>>;
  currentThought: string;
  setCurrentThought: Dispatch<SetStateAction<string>>;
  pendingDraft: { title: string; content: string; reasoning: string[] } | null;
  setPendingDraft: Dispatch<SetStateAction<{ title: string; content: string; reasoning: string[] } | null>>;
  showCelebration: boolean;
  setShowCelebration: Dispatch<SetStateAction<boolean>>;
  chatHistory: { id: string; date: Date; domain: BusinessDomain; messages: Message[] }[];
  setChatHistory: Dispatch<SetStateAction<{ id: string; date: Date; domain: BusinessDomain; messages: Message[] }[]>>;
  startNewChat: () => void;
  handleSend: (text?: string) => Promise<void>;
  handleIntegrateData: (text: string) => Promise<void>;
  handleCreateDoc: (content: string) => void;

  // Tasks
  allTasks: Task[];
  setAllTasks: Dispatch<SetStateAction<Task[]>>;
  activeTasks: Task[];
  selectedTask: Task | null;
  setSelectedTask: Dispatch<SetStateAction<Task | null>>;
  isTaskModalOpen: boolean;
  setIsTaskModalOpen: Dispatch<SetStateAction<boolean>>;
  handleCreateTask: (title: string, tags?: string[]) => void;
  handleUpdateTaskTags: (taskId: string, newTags: string[]) => void;

  // Projects
  projects: Project[];
  setProjects: Dispatch<SetStateAction<Project[]>>;
  selectedProject: Project | null;
  setSelectedProject: Dispatch<SetStateAction<Project | null>>;
  isProjectModalOpen: boolean;
  setIsProjectModalOpen: Dispatch<SetStateAction<boolean>>;
  expandedFramework: string | null;
  setExpandedFramework: Dispatch<SetStateAction<string | null>>;
  newProject: Partial<Project>;
  setNewProject: Dispatch<SetStateAction<Partial<Project>>>;
  hoveredProjectId: string | null;
  setHoveredProjectId: Dispatch<SetStateAction<string | null>>;
  hoveredStepId: string | null;
  setHoveredStepId: Dispatch<SetStateAction<string | null>>;
  isLaunching: boolean;
  setIsLaunching: Dispatch<SetStateAction<boolean>>;
  processStarted: boolean;
  setProcessStarted: Dispatch<SetStateAction<boolean>>;

  // Documents / Files
  allDocs: Record<BusinessDomain, any[]>;
  setAllDocs: Dispatch<SetStateAction<Record<BusinessDomain, any[]>>>;
  selectedFile: any;
  setSelectedFile: Dispatch<SetStateAction<any>>;
  isFileAiOpen: boolean;
  setIsFileAiOpen: Dispatch<SetStateAction<boolean>>;
  activePage: number;
  setActivePage: Dispatch<SetStateAction<number>>;
  isEditingDoc: boolean;
  setIsEditingDoc: Dispatch<SetStateAction<boolean>>;
  editedContent: any;
  setEditedContent: Dispatch<SetStateAction<any>>;

  // Team
  selectedMember: any;
  setSelectedMember: Dispatch<SetStateAction<any>>;
  selectedKanbanTask: any;
  setSelectedKanbanTask: Dispatch<SetStateAction<any>>;

  // Equipment
  equipmentLog: any[];
  setEquipmentLog: Dispatch<SetStateAction<any[]>>;
  inspectionLogs: any[];
  setInspectionLogs: Dispatch<SetStateAction<any[]>>;
  reportPeriod: 'daily' | 'weekly' | 'monthly';
  setReportPeriod: Dispatch<SetStateAction<'daily' | 'weekly' | 'monthly'>>;

  // UI / Layout
  theme: Theme;
  setTheme: Dispatch<SetStateAction<Theme>>;
  isAiMinimized: boolean;
  setIsAiMinimized: Dispatch<SetStateAction<boolean>>;
  showSidebar: boolean;
  setShowSidebar: Dispatch<SetStateAction<boolean>>;
  showTopMenu: boolean;
  setShowTopMenu: Dispatch<SetStateAction<boolean>>;
  showBottomBar: boolean;
  setShowBottomBar: Dispatch<SetStateAction<boolean>>;
  isCoreExpanded: boolean;
  setIsCoreExpanded: Dispatch<SetStateAction<boolean>>;
  showShareModal: boolean;
  setShowShareModal: Dispatch<SetStateAction<boolean>>;
  showDomainDropdown: boolean;
  setShowDomainDropdown: Dispatch<SetStateAction<boolean>>;
  isAiPanelOpen: boolean;
  setIsAiPanelOpen: Dispatch<SetStateAction<boolean>>;
  showAccountMenu: boolean;
  setShowAccountMenu: Dispatch<SetStateAction<boolean>>;
  activeSidePanel: string | null;
  setActiveSidePanel: Dispatch<SetStateAction<string | null>>;
  panelPos: { top: number };
  setPanelPos: Dispatch<SetStateAction<{ top: number }>>;
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: Dispatch<SetStateAction<boolean>>;
  showCreatePageModal: boolean;
  setShowCreatePageModal: Dispatch<SetStateAction<boolean>>;
  newPagePrompt: string;
  setNewPagePrompt: Dispatch<SetStateAction<string>>;
  showQuickAddModal: boolean;
  setShowQuickAddModal: Dispatch<SetStateAction<boolean>>;
  quickAddType: string;
  setQuickAddType: Dispatch<SetStateAction<string>>;
  quickAddCustomType: string;
  setQuickAddCustomType: Dispatch<SetStateAction<string>>;
  quickAddText: string;
  setQuickAddText: Dispatch<SetStateAction<string>>;
  openDropdown: 'domains' | 'functions' | null;
  setOpenDropdown: Dispatch<SetStateAction<'domains' | 'functions' | null>>;
}

export const AppContext = createContext<AppContextValue | null>(null);

export const useAppContext = (): AppContextValue => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppContext.Provider');
  return ctx;
};
