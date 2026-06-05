import React from 'react';

export const getChipColor = (content: string): string => {
  const c = content.toLowerCase();
  if (c.includes('год') || c.includes('квартал') || c.includes('мес') || c.includes('май') || c.includes('q1') || c.includes('период') || c.includes('дата')) {
    return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
  }
  if (c.includes('команд') || c.includes('сотрудник') || c.includes('коллег') || c.includes('логист') || c.includes('инвестор') || c.includes('советн') || c.includes('персонал') || c.includes('люди')) {
    return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30';
  }
  if (c.includes('функц') || c.includes('анализ') || c.includes('аудит') || c.includes('план') || c.includes('схема') || c.includes('swot') || c.includes('процесс')) {
    return 'bg-rose-500/10 text-rose-500 border-rose-500/30';
  }
  return 'bg-proji-amber/10 text-proji-amber border-proji-amber/30';
};

export const renderHighlightedText = (text: string): React.ReactNode => {
  if (!text) return null;
  const parts = text.split(/(\[.*?\])/g);
  return parts.map((part, i) => {
    if (part.startsWith('[') && part.endsWith(']')) {
      const content = part.slice(1, -1);
      const colorClass = getChipColor(content);
      return React.createElement(
        'span',
        { key: i, className: `inline-block px-1.5 py-0 rounded-md border ${colorClass} font-bold mx-0.5 whitespace-nowrap align-middle text-[10px] leading-none` },
        part,
      );
    }
    return React.createElement('span', { key: i }, part);
  });
};

export const verifyDocumentCriteria = (text: string, originalPrompt: string): string[] => {
  const criteria: string[] = [];
  const lowerText = text.toLowerCase();

  const hasQuestion = text.includes('?');
  const hasOptions = text.includes('[') && text.includes(']');
  if (hasQuestion || hasOptions) return [];

  if (text.length > 800) criteria.push('Глубина проработки (>800 симв.)');

  const headingCount = (text.match(/^#{1,3} /gm) || []).length;
  if (headingCount >= 2 || (text.includes('**') && text.split('**').length > 8)) {
    criteria.push('Архитектурная структура (Markdown)');
  }

  const p = originalPrompt.toLowerCase();
  const docTypes = ['бизнес-план', 'стратегия', 'регламент', 'инструкция', 'проект', 'отчет', 'устав'];
  if (docTypes.some(type => p.includes(type))) criteria.push('Целевой бизнес-стандарт');

  if (text.split('\n').some(line => line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))) {
    criteria.push('Аналитическая разметка (данные)');
  }

  if (!lowerText.includes('хотите') && !lowerText.includes('выберите') && text.length > 500) {
    criteria.push('Декларативный тон исполнения');
  }

  return criteria;
};

export const parseOptions = (text: string): string[] | undefined => {
  const optionRegex = /\[([^\]]+)\]/g;
  const matches = Array.from(text.matchAll(optionRegex));
  if (matches.length > 0) {
    return matches.map(m => m[1]).slice(0, 4);
  }
  return undefined;
};
