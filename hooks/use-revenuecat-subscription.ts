import {useCallback, useEffect, useState} from 'react';

import {revenueCatService} from '@/services/revenuecat.service';

export const useRevenueCatSubscription = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const active = await revenueCatService.hasActiveEntitlement();
    setIsSubscribed(active);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {isSubscribed, isLoading, refresh};
};
