// Mock data for development when Directus API is not available
export const mockWebinars = [
  {
    id: 1,
    title: "Smart Home Products Showcase",
    description: "Explore the latest smart home innovations",
    type: "public" as const,
    status: "live" as const,
    scheduled_at: new Date().toISOString(),
    agora_channel_name: "smart_home_001",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Electronics Components Q1 Sourcing",
    description: "Discuss Q1 sourcing requirements for electronics",
    type: "private" as const,
    status: "scheduled" as const,
    scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "IoT Devices Supplier Meeting",
    description: "Connect with IoT device suppliers",
    type: "public" as const,
    status: "scheduled" as const,
    scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date().toISOString(),
  },
];

export const mockFactories = [
  {
    id: 1,
    name: "Ningbo AutoParts Co.",
    location: "Ningbo, China",
    category: "Automotive Parts",
    score: 92,
    certifications: "ISO 9001, TS 16949",
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Shaoxing Gear Manufacturing",
    location: "Shaoxing, China",
    category: "Mechanical Components",
    score: 88,
    certifications: "ISO 9001",
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Hangzhou Motors Ltd.",
    location: "Hangzhou, China",
    category: "Electric Motors",
    score: 95,
    certifications: "ISO 9001, CE",
    created_at: new Date().toISOString(),
  },
];
