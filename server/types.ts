export interface QuotaLimits {
  webinarCreatedMonthly: number;
  productsMax: number;
  inquiriesMonthly: number;
  storageGB: number;
  videoRecordingHours: number;
  aiReportsMonthly: number;
  webinarDurationMinutes: number;
  priorityListing: boolean;
  verifiedBadge: boolean;
  multiFactoryManagement: boolean;
  apiAccess: boolean;
  dedicatedSupport: boolean;
}

export interface QuotaUsage {
  webinarCreatedMonthly: number;
  productsMax: number;
  inquiriesMonthly: number;
  storageGB: number;
  videoRecordingHours: number;
  aiReportsMonthly: number;
}
