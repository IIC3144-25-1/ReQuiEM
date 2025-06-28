'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const ios = isIOS();

  useEffect(() => {
    let ios = isIOS();
    if (ios) return;
    const handler = (e: Event) => {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };
    console.log('Adding beforeinstallprompt event listener');
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, [ios]);

  const handleInstall = async () => {
    let ios = isIOS();
    console.log('Install button clicked');
    console.log('Deferred prompt:', deferredPrompt);
    console.log('Can install:', canInstall);
    console.log('iOS:', ios);
    if (ios) {
      setShowIOSModal(true);
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      console.log('Install result:', choice.outcome);
      setDeferredPrompt(null);
      setCanInstall(false);
    }
  };

  return (
    <>
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button
          onClick={handleInstall}
          className="shadow-xl"
          variant="default"
        >
          📲 Instalar App
        </Button>
      </motion.div>

      <AnimatePresence>
        {showIOSModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-background rounded-lg shadow-lg p-6 max-w-sm mx-4 relative"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button
                onClick={() => setShowIOSModal(false)}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-muted"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Info className="text-blue-500 shrink-0" size={24} />
                <h3 className="text-lg font-semibold">
                  Instala la app en tu iPhone
                </h3>
              </div>

              <ol className="list-decimal list-inside text-sm text-muted-foreground mb-6 space-y-1">
                <li>Toca el botón <b>Compartir</b> (ícono ⬆️)</li>
                <li>Selecciona <b>“Agregar a pantalla de inicio”</b></li>
              </ol>

              <Button
                variant="outline"
                onClick={() => setShowIOSModal(false)}
                className="w-full"
              >
                Entendido
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
