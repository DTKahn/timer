import { useEffect, useState } from 'react';

import { useFavorites } from '@/store/favorites';
import { useHistory } from '@/store/history';
import { useSettings } from '@/store/settings';
import { useTimer } from '@/store/timer';

const stores = [useTimer, useSettings, useFavorites, useHistory];
const allHydrated = () => stores.every((s) => s.persist.hasHydrated());

/** True once every persisted store has loaded from device storage. */
export function useStoresHydrated(): boolean {
  const [hydrated, setHydrated] = useState(allHydrated);

  useEffect(() => {
    if (hydrated) return;
    const check = () => allHydrated() && setHydrated(true);
    const unsubscribes = stores.map((s) => s.persist.onFinishHydration(check));
    check();
    return () => unsubscribes.forEach((u) => u());
  }, [hydrated]);

  return hydrated;
}
