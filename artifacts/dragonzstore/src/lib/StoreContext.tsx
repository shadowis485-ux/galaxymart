import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsApi } from './api';
import localStore from './localStore';

localStore.init();

interface StoreSettings {
  store_name: string;
  logo_url: string;
  store_tagline: string;
}

const defaults: StoreSettings = {
  store_name: 'Galaxymart',
  logo_url: '',
  store_tagline: 'Premium digital products delivered instantly.',
};

const StoreContext = createContext<{
  settings: StoreSettings;
  refresh: () => Promise<void>;
}>({ settings: defaults, refresh: async () => {} });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(defaults);

  const refresh = async () => {
    try {
      const data: any = await settingsApi.get();
      setSettings({
        store_name:    data.store_name    || defaults.store_name,
        logo_url:      data.logo_url      || '',
        store_tagline: data.store_tagline || defaults.store_tagline,
      });
    } catch {}
  };

  useEffect(() => { refresh(); }, []);

  return (
    <StoreContext.Provider value={{ settings, refresh }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
