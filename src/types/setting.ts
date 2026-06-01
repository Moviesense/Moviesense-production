export interface Widget {
  _id: string;
  title: string;
  arabicTitle: string;
  order: number;
  type: number;
  isActive: boolean;
  clickAble: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Setting {
  _id: string;
  googlePlayEmail: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  razorPayId: string;
  razorSecretKey: string;
  privacyPolicyLink: string;
  privacyPolicyText: string;
  googlePlaySwitch: boolean;
  stripeSwitch: boolean;
  razorPaySwitch: boolean;
  isAppActive: boolean;
  paymentGateway: any[];
  currency: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  googlePlayKey: string;
  isIptvAPI: boolean;
  privateKey: any;
  flutterWaveId: string;
  flutterWaveSwitch: boolean;
  defaultLiveTVLink: string;
  defaultLiveTvId: string;
  tncLink: string;
  uploadContentLink: string;
  anonymousEpisodeWatchLimit: number;
  viewConstant: number;
  viewMultiplier: number;
  engagementConstant: number;
  engagementMultiplier: number;
  isFreeTrialEnabled: boolean;
  appleStoreBundleId: string;
  appleStoreIssuerId: string;
  appleStoreKeyId: string;
  appleStorePrivateKey: string;
  appleStoreSwitch: boolean;
  favoriteConstant: number;
  favoriteMultiplier: number;
  likeConstant: number;
  likeMultiplier: number;
  faqUrl: string;
  testOtpCode: string;
  testPhoneNumbers: string[];
  isPaymentProviderFreeTrialEnabled: boolean;
  paymentProviderFreeTrialDays: number;
  paymentProviderFreeTrialText: string;
  androidVersion: string;
  iosVersion: string;
  ga4ApiSecret: string;
  ga4MeasurementId: string;
  ga4FirebaseAppId: string;
  updateType: string;
  maxProfiles: number;
}

export interface SettingResponse {
  status: boolean;
  message: string;
  setting: Setting;
  widgets: Widget[];
}

export interface WidgetDataResponse {
  status: boolean;
  message: string;
  series: any[];
  page?: number;
  perPage?: number;
}
