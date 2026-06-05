'use client';

import { PageWrapper } from './PageWrapper';
import { useI18n } from '../context/I18nContext';

/** Translated "page under development" placeholder */
export function PageStub({ titleKey }: { titleKey: string }) {
  const { t } = useI18n();
  const title = t(titleKey);
  const message = t('comingSoon.pageTemplate').replace('{title}', title);

  return (
    <PageWrapper>
      <div className="p-12 max-w-5xl mx-auto w-full">
        <p className="text-proji-secondary text-sm">{message}</p>
      </div>
    </PageWrapper>
  );
}
