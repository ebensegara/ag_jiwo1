'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function PWABackHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const isHandlingBack = useRef(false);

  useEffect(() => {
    const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                  (window.navigator as any).standalone === true;

    if (!isPWA) return;

    const handlePopState = () => {
      if (isHandlingBack.current) return;
      
      isHandlingBack.current = true;

      const mainDashboardRoutes = [
        '/dashboard/user',
        '/dashboard/professional', 
        '/dashboard/admin',
        '/dashboard/corporate'
      ];

      if (mainDashboardRoutes.includes(pathname)) {
        window.history.pushState(null, '', pathname);
        isHandlingBack.current = false;
        return;
      }

      if (pathname !== '/dashboard' && !mainDashboardRoutes.includes(pathname)) {
        router.push('/dashboard');
      }

      setTimeout(() => {
        isHandlingBack.current = false;
      }, 100);
    };

    window.history.pushState(null, '', pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pathname, router]);

  return null;
}