import {Platform} from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
  PURCHASES_ERROR_CODE
} from 'react-native-purchases';
export type RevenueCatPlan = 'vanora' | 'mechanic';

const REVENUECAT_ANDROID_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '';
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '';

const ENTITLEMENT_ID = 'vanora_pro';
const planToProductId: Record<RevenueCatPlan, string> = {
  vanora: 'vanora_pro_monthly:monthly',
  mechanic: 'vanora_pro_quarterly:quarterly'
};

let isConfigured = false;
let currentAppUserId: string | null = null;
let inFlightAuth: Promise<void> | null = null;

const resolvePackage = (
  offerings: PurchasesOfferings,
  plan: RevenueCatPlan
): PurchasesPackage | null => {
  const offering = offerings.all[plan] ?? offerings.current;
  if (!offering) return null;

  const targetId = planToProductId[plan];
  return (
    offering.availablePackages.find(
      pkg => pkg.product.identifier === targetId
    ) ?? null
  );
};

export const revenueCatService = {
  async initialize(userId?: string) {
    if (Platform.OS === 'web') return;

    const apiKey =
      Platform.OS === 'android' ? REVENUECAT_ANDROID_KEY : REVENUECAT_IOS_KEY;
    if (!apiKey) {
      console.warn('[RevenueCat] Missing API key for platform:', Platform.OS);
      return;
    }

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
    }

    if (!isConfigured) {
      Purchases.configure({apiKey});
      isConfigured = true;
    }

    const targetUserId = userId ?? null;
    if (currentAppUserId === targetUserId) return;

    if (inFlightAuth) {
      await inFlightAuth;
    }

    inFlightAuth = (async () => {
      try {
        if (targetUserId) {
          await Purchases.logIn(targetUserId);
          currentAppUserId = targetUserId;
        } else if (currentAppUserId) {
          await Purchases.logOut();
          currentAppUserId = null;
        }
      } catch (error) {
        console.warn('[RevenueCat] Auth error:', error);
      } finally {
        inFlightAuth = null;
      }
    })();

    await inFlightAuth;
  },

  async getOfferings() {
    if (!isConfigured) {
      return null;
    }
    return Purchases.getOfferings();
  },

  async getPlanPackage(plan: RevenueCatPlan) {
    const offerings = await this.getOfferings();
    if (!offerings) return null;
    return resolvePackage(offerings, plan);
  },

  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!isConfigured) {
      return null;
    }
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.warn('[RevenueCat] Customer info error:', error);
      return null;
    }
  },

  async hasActiveEntitlement() {
    const info = await this.getCustomerInfo();
    if (!info) return false;
    return !!info.entitlements.active[ENTITLEMENT_ID];
  },

  async purchasePlan(plan: RevenueCatPlan) {
    if (!isConfigured) {
      return {success: false, reason: 'not_configured' as const};
    }
    const offerings = await this.getOfferings();
    if (!offerings) {
      return {success: false, reason: 'not_configured' as const};
    }
    const pkg = resolvePackage(offerings, plan);
    if (!pkg) {
      return {success: false, reason: 'package_not_found' as const};
    }

    try {
      const {customerInfo} = await Purchases.purchasePackage(pkg);
      return {success: true, customerInfo};
    } catch (error: any) {
      if (error.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
        return {success: false, reason: 'cancelled' as const};
      }
      return {success: false, reason: 'error', error};
    }
  },

  async restorePurchases() {
    if (!isConfigured) {
      return null;
    }
    return Purchases.restorePurchases();
  },

  async showManageSubscriptions() {
    if (!isConfigured) {
      return;
    }
    return Purchases.showManageSubscriptions();
  }
};
