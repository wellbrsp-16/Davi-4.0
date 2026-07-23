'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Desabilitar Service Worker em desenvolvimento para evitar conflitos com HMR do Turbopack/Next.js
    if (process.env.NODE_ENV !== 'production') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then(() => {
              console.log('Service Worker de desenvolvimento removido com sucesso.');
            });
          }
        });
      }
      return;
    }

    // Registrar o Service Worker apenas em ambiente de produção
    if ('serviceWorker' in navigator) {
      const handleRegister = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrado em produção:', registration.scope);
        } catch (error) {
          console.error('Falha ao registrar Service Worker:', error);
        }
      };

      handleRegister();
    }
  }, []);

  return null;
}
