/**
 * useWebinars Hook
 * 
 * Custom hook for loading webinars from Directus API with fallback to mock data.
 */

import { useState, useEffect } from 'react';
import { getWebinars, type WebinarFilters } from '@/lib/api/webinars';
import { mockStore, type MockWebinar } from '@/lib/mock-data';
import type { Webinar } from '@/lib/directus';

export function useWebinars(filters?: WebinarFilters) {
  const [webinars, setWebinars] = useState<MockWebinar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [useDirectus, setUseDirectus] = useState(true);

  const loadWebinars = async () => {
    setLoading(true);
    setError(null);

    try {
      if (useDirectus) {
        // Try to load from Directus
        const directusWebinars = await getWebinars(filters);
        
        // Convert Directus webinars to MockWebinar format
        const converted = directusWebinars.map((w: Webinar) => ({
          id: w.id,
          title: w.title,
          description: w.description || '',
          type: w.type || 'small_group',
          scenario: w.scenario || 'general',
          visibility: w.visibility || 'private',
          status: w.status,
          scheduled_at: w.scheduled_at || new Date().toISOString(),
          duration: w.duration || 60,
          category: w.category || 'other',
          language: w.language || 'en',
          agora_channel_name: w.agora_channel_name || '',
          agora_token: w.agora_token,
          cover_image: w.cover_image,
          max_participants: w.max_participants || 10,
          actual_participants: w.actual_participants || 0,
          host_type: w.host_type || 'factory',
          creator_id: w.creator_id,
          created_at: w.created_at,
          updated_at: w.updated_at,
        }));

        setWebinars(converted as MockWebinar[]);
      } else {
        // Use mock data
        setWebinars(mockStore.getWebinars());
      }
    } catch (err) {
      console.error('Failed to load webinars:', err);
      setError(err as Error);
      
      // Fallback to mock data
      setUseDirectus(false);
      setWebinars(mockStore.getWebinars());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWebinars();
  }, [JSON.stringify(filters)]);

  const refresh = () => {
    loadWebinars();
  };

  return {
    webinars,
    loading,
    error,
    refresh,
    useDirectus,
  };
}
