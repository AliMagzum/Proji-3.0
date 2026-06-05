'use client';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';

interface PageWrapperProps {
  children: React.ReactNode;
}

export function PageWrapper({ children }: PageWrapperProps) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.15 }}
      className="flex-1 flex flex-col h-full pt-6"
    >
      {children}
    </motion.div>
  );
}
