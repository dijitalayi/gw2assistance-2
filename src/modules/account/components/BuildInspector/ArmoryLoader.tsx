'use client';

import { useEffect, useState } from 'react';

interface ArmoryLoaderProps {
  isReady: boolean;
}

export function ArmoryEmbedsUpdater({ isReady }: ArmoryLoaderProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    // Global ayarlar (dil, önbellek)
    (window as any).GW2A_EMBED_OPTIONS = {
      lang: 'en',
      persistToLocalStorage: true,
    };

    // Eğer önceki script varsa kaldır ki yeniden inject ettiğimizde DOM taraması yapsın (SPA sorunu için)
    const existing = document.getElementById('armory-embeds-script');
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = 'armory-embeds-script';
    script.src = 'https://unpkg.com/armory-embeds@^0.x.x/armory-embeds.js';
    script.async = true;
    
    // Yüklendiğinde React state vs. için dinleyici eklenebilir
    script.onload = () => setLoaded(true);

    // Varsa React DOM update'inin tamamlanmasını beklemek için timeout ile ekliyoruz
    const timer = setTimeout(() => {
      document.body.appendChild(script);
    }, 100);

    return () => clearTimeout(timer);
  }, [isReady]);

  return null;
}

