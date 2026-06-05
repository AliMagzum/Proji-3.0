'use client';

import { useSession } from 'next-auth/react';
import { getOrganization, getWorkspaceId } from '../../src/lib/organization';
import { TeamChat } from '../../src/components/workspace/TeamChat';
import { PageWrapper } from '../../src/components/PageWrapper';
import { useI18n } from '../../src/context/I18nContext';

export default function MessagesPage() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const org = getOrganization();

  return (
    <PageWrapper>
      <div className="px-4 md:px-8 pb-12 max-w-3xl mx-auto w-full">
        <div className="mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
            {t('messages.eyebrow')}
          </p>
          <h1 className="text-2xl font-black text-slate-900">{t('messages.title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('messages.subtitle')}</p>
        </div>
        <TeamChat
          workspaceId={getWorkspaceId(org) ?? undefined}
          currentUserEmail={session?.user?.email}
          className="min-h-[calc(100vh-280px)]"
        />
      </div>
    </PageWrapper>
  );
}
