/**
 * Mock Data Stub - Temporary compatibility layer
 * This file provides minimal exports to maintain compatibility
 * while transitioning to real API data from Directus
 */

// Type definitions (kept for compatibility)
export interface MockWebinar {
  id: number;
  title: string;
  description: string;
  status: string;
  scheduledAt: string;
  duration: number;
  category?: string;
  coverImage?: string;
  tags?: string[];
  participants?: any[];
  [key: string]: any;
}

export interface MockRegistration {
  id: number;
  userId: number;
  webinarId: number;
  status: string;
  registeredAt: string;
  user?: any;
  [key: string]: any;
}

export interface MockFactory {
  id: number;
  name: string;
  location: string;
  category: string;
  score: number;
  status: string;
  [key: string]: any;
}

// Empty mock store (will be replaced by API calls)
export const mockStore = {
  webinars: [] as MockWebinar[],
  registrations: [] as MockRegistration[],
  factories: [] as MockFactory[],
  users: [] as any[],
  
  // Helper methods (minimal implementations for compatibility)
  getWebinars: () => [] as MockWebinar[],
  getWebinarById: (id: number) => null,
  getRegistrations: () => [] as MockRegistration[],
  getRegistrationById: (id: number) => null,
  getFactories: () => [] as MockFactory[],
  getFactoryById: (id: number) => null,
  getUsers: () => [] as any[],
  getUserById: (id: number) => null,
  getDashboardStats: () => ({
    totalWebinars: 0,
    scheduled: 0,
    liveNow: 0,
    completed: 0,
    totalFactories: 0,
    activeBuyers: 0,
    avgCycle: "0 Days"
  }),
  updateRegistrationStatus: (id: number, status: string) => {},
};

// Avatar helper function
export function getAvatarByRole(role?: string): string {
  const avatars: Record<string, string> = {
    host: "https://api.dicebear.com/7.x/avataaars/svg?seed=host",
    buyer: "https://api.dicebear.com/7.x/avataaars/svg?seed=buyer",
    supplier: "https://api.dicebear.com/7.x/avataaars/svg?seed=supplier",
    participant: "https://api.dicebear.com/7.x/avataaars/svg?seed=participant",
  };
  return avatars[role || "participant"] || avatars.participant;
}

// Export empty arrays for backward compatibility
export const mockWebinars: MockWebinar[] = [];
export const mockFactories: MockFactory[] = [];
export const mockRegistrations: MockRegistration[] = [];
