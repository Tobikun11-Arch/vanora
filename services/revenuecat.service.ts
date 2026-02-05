import {Platform} from 'react-native';
import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage
} from 'react-native-purchases';
export type RevenueCatPlan = 'vanora' | 'mechanic';

const REVENUECAT_ANDROID_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? '';
const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? '';

const planToPackageId: Record<RevenueCatPlan, string> = {
  vanora: '$rc_monthly', // package identifier for Vanora
  mechanic: '$rc_three_month' // quarterly package identifier for Mechanic
};

let isConfigured = false;

const resolvePackage = (
  offerings: PurchasesOfferings,
  plan: RevenueCatPlan
): PurchasesPackage | null => {
  const offering = offerings.all[plan] ?? offerings.current;
  if (!offering) return null;

  const targetId = planToPackageId[plan];
  return (
    offering.availablePackages.find(pkg => pkg.identifier === targetId) ?? null
  );
};

export const revenueCatService = {
  initialize(userId?: string) {
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

    Purchases.configure({apiKey});

    if (userId) {
      Purchases.logIn(userId);
    }

    isConfigured = true;
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
    return !!info.entitlements.active['Vanora Pro'];
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

    const {customerInfo} = await Purchases.purchasePackage(pkg);
    return {success: true, customerInfo};
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
