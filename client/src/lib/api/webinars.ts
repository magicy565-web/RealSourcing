/**
 * Webinar API Service
 * 
 * This file provides API functions for webinar operations using Directus SDK.
 */

import { directus, safeRequest, type Webinar } from '../directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';

export interface CreateWebinarInput {
  title: string;
  description: string;
  type: 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large';
  scenario: 'general' | 'tiktok_dropshipper' | 'influencer_selection' | 'negotiation' | 'small_batch' | 'product_launch' | 'factory_tour' | 'industry_summit';
  visibility: 'public' | 'semi_public' | 'private';
  scheduled_at: string;
  duration: number;
  category: string;
  language: string;
  cover_image?: string;
  max_participants: number;
  host_type: 'factory' | 'buyer';
}

export interface UpdateWebinarInput extends Partial<CreateWebinarInput> {
  id: number;
}

export interface WebinarFilters {
  type?: string;
  scenario?: string;
  status?: string;
  visibility?: string;
  host_type?: string;
}

/**
 * Get all webinars with optional filters
 */
export async function getWebinars(filters?: WebinarFilters): Promise<Webinar[]> {
  return safeRequest('webinars', async () => {
    const query: any = {
      sort: ['-scheduled_at'],
      limit: -1,
    };

    // Build filter object
    if (filters && Object.keys(filters).length > 0) {
      query.filter = {};
      if (filters.type) query.filter.type = { _eq: filters.type };
      if (filters.scenario) query.filter.scenario = { _eq: filters.scenario };
      if (filters.status) query.filter.status = { _eq: filters.status };
      if (filters.visibility) query.filter.visibility = { _eq: filters.visibility };
      if (filters.host_type) query.filter.host_type = { _eq: filters.host_type };
    }

    const response = await directus.request(readItems('webinars', query));
    return response as Webinar[];
  });
}

/**
 * Get a single webinar by ID
 */
export async function getWebinar(id: number): Promise<Webinar | null> {
  return safeRequest('webinars', async () => {
    const response = await directus.request(readItems('webinars', {
      filter: { id: { _eq: id } },
      limit: 1,
    }));
    return response[0] as Webinar || null;
  });
}

/**
 * Create a new webinar
 */
export async function createWebinar(input: CreateWebinarInput): Promise<Webinar> {
  return safeRequest('webinars', async () => {
    const webinarData = {
      ...input,
      status: 'scheduled' as const,
      actual_participants: 0,
      agora_channel_name: `webinar_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const response = await directus.request(createItem('webinars', webinarData));
    return response as Webinar;
  });
}

/**
 * Update an existing webinar
 */
export async function updateWebinar(input: UpdateWebinarInput): Promise<Webinar> {
  const { id, ...data } = input;
  
  return safeRequest('webinars', async () => {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString(),
    };

    const response = await directus.request(updateItem('webinars', id, updateData));
    return response as Webinar;
  });
}

/**
 * Delete a webinar
 */
export async function deleteWebinar(id: number): Promise<void> {
  return safeRequest('webinars', async () => {
    await directus.request(deleteItem('webinars', id));
  });
}

/**
 * Get webinars by status
 */
export async function getWebinarsByStatus(status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled'): Promise<Webinar[]> {
  return getWebinars({ status });
}

/**
 * Get webinars by type
 */
export async function getWebinarsByType(type: 'one_on_one' | 'small_group' | 'medium' | 'large' | 'extra_large'): Promise<Webinar[]> {
  return getWebinars({ type });
}

/**
 * Get webinars by scenario
 */
export async function getWebinarsByScenario(scenario: string): Promise<Webinar[]> {
  return getWebinars({ scenario });
}

/**
 * Get TikTok/Dropshipper webinars
 */
export async function getTikTokWebinars(): Promise<Webinar[]> {
  return getWebinars({ scenario: 'tiktok_dropshipper' });
}

/**
 * Get Influencer webinars
 */
export async function getInfluencerWebinars(): Promise<Webinar[]> {
  return getWebinars({ scenario: 'influencer_selection' });
}

/**
 * Get live webinars
 */
export async function getLiveWebinars(): Promise<Webinar[]> {
  return getWebinars({ status: 'live' });
}

/**
 * Get upcoming webinars (scheduled)
 */
export async function getUpcomingWebinars(): Promise<Webinar[]> {
  return getWebinars({ status: 'scheduled' });
}

/**
 * Get completed webinars
 */
export async function getCompletedWebinars(): Promise<Webinar[]> {
  return getWebinars({ status: 'completed' });
}

/**
 * Search webinars by title or description
 */
export async function searchWebinars(query: string): Promise<Webinar[]> {
  return safeRequest('webinars', async () => {
    const response = await directus.request(readItems('webinars', {
      filter: {
        _or: [
          { title: { _contains: query } },
          { description: { _contains: query } },
        ],
      },
      sort: ['-scheduled_at'],
      limit: -1,
    }));
    return response as Webinar[];
  });
}
