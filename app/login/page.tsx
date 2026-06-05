'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '../../src/components/auth/AuthLayout';
import { GoogleSignInButton } from '../../src/components/auth/GoogleSignInButton';
import { useI18n } from '../../src/context/I18nContext';
import { hasOrganization } from '../../src/lib/organization';

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (status !== 'authenticated') return;
    router.replace(hasOrganization() ? '/chat' : '/onboarding');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <motion.div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-proji-primary" />
      </motion.div>
    );
  }

  if (status === 'authenticated') return null;

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4 sm:p-6">
      <AuthLayout title={t('auth.welcome')} subtitle={t('auth.subtitle')}>
        <GoogleSignInButton mode="signin" />
        <p className="text-center text-sm text-slate-500 mt-6">
          {t('auth.noAccount')}{' '}
          <Link
            href="/register"
            className="font-bold text-proji-primary hover:underline underline-offset-2"
          >
            {t('auth.signUp')}
          </Link>
        </p>
      </AuthLayout>
    </div>
  );
}
