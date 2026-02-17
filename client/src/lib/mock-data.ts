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
  
  // Helper methods (empty implementations)
  getWebinarById: (id: number) => null,
  getFactoryById: (id: number) => null,
  getUserById: (id: number) => null,
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
