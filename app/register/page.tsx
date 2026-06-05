'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthLayout } from '../../src/components/auth/AuthLayout';
import { GoogleSignInButton } from '../../src/components/auth/GoogleSignInButton';
import { useI18n } from '../../src/context/I18nContext';
import { hasOrganization } from '../../src/lib/organization';

export default function RegisterPage() {
  const { status } = useSession();
  const router = useRouter();
  const { t } = useI18n();

  useEffect(() => {
    if (status !== 'authenticated') return;
    router.replace(hasOrganization() ? '/chat' : '/onboarding');
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-slate-50">
        <Loader2 size={24} className="animate-spin text-proji-primary" />
      </div>
    );
  }

  if (status === 'authenticated') return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-white to-blue-50/40 flex items-center justify-center p-4 sm:p-6"
    >
      <AuthLayout title={t('auth.signUp')} subtitle={t('auth.subtitle')}>
        <GoogleSignInButton mode="signup" />
        <p className="text-center text-sm text-slate-500 mt-6">
          {t('auth.hasAccount')}{' '}
          <Link
            href="/login"
            className="font-bold text-proji-primary hover:underline underline-offset-2"
          >
            {t('auth.signIn')}
          </Link>
        </p>
      </AuthLayout>
    </motion.div>
  );
}
