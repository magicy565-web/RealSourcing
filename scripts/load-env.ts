/**
 * Load environment variables from .env file
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

export function loadEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    
    const lines = envContent.split('\n');
    let loaded = 0;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      
      // Parse KEY=VALUE
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        
        // Only set if not already set
        if (!process.env[key]) {
          process.env[key] = value;
          loaded++;
        }
      }
    }
    
    console.log(`[ENV] Loaded ${loaded} environment variables from .env`);
  } catch (error: any) {
    console.error('[ENV] Failed to load .env file:', error.message);
  }
}
