'use client';

import { useSession } from 'next-auth/react';
import { getOrganization, getWorkspaceId } from '../../src/lib/organization';
import { MessagesLayout } from '../../src/components/messages/MessagesLayout';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useI18n } from '../../src/context/I18nContext';

export default function MessagesPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const org = getOrganization();

  return (
    <PageWrapper>
      <div className="px-4 md:px-8 pb-4 md:pb-6 flex flex-col h-full">
        <div className="mb-4 md:mb-5 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {t('messages.eyebrow')}
          </p>
          <h1 className="text-xl md:text-2xl font-black text-slate-900">{t('messages.title')}</h1>
        </div>
        <MessagesLayout
          workspaceId={getWorkspaceId(org) ?? undefined}
          currentUserEmail={session?.user?.email}
        />
      </div>
    </PageWrapper>
  );
}
