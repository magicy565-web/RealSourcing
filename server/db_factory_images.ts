/**
 * 工厂图片相关数据库操作
 */

import { getDb } from './db.js';
import { sql, eq } from 'drizzle-orm';

export interface FactoryImage {
  id: number;
  factoryId: number;
  url: string;
  type: 'factory' | 'product' | 'certification';
  category?: string;
  displayOrder: number;
  isPrimary: number;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function getFactoryImages(factoryId: number): Promise<FactoryImage[]> {
  const db = await getDb();
  if (!db) return [];
  
  try {
    const result = await db.execute(sql`
      SELECT * FROM factory_images 
      WHERE factoryId = ${factoryId} 
      ORDER BY displayOrder ASC, id ASC
    `);
    return result[0] as any[];
  } catch (error) {
    console.error('[getFactoryImages] Error:', error);
    return [];
  }
}

export async function createFactoryImage(data: {
  factoryId: number;
  url: string;
  type?: 'factory' | 'product' | 'certification';
  category?: string;
  displayOrder?: number;
  isPrimary?: number;
  caption?: string;
}): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.execute(sql`
    INSERT INTO factory_images (factoryId, url, type, category, displayOrder, isPrimary, caption)
    VALUES (
      ${data.factoryId}, 
      ${data.url}, 
      ${data.type || 'factory'}, 
      ${data.category || null}, 
      ${data.displayOrder || 0}, 
      ${data.isPrimary || 0}, 
      ${data.caption || null}
    )
  `);
  
  return (result[0] as any).insertId;
}

export async function deleteFactoryImage(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.execute(sql`
    DELETE FROM factory_images WHERE id = ${id}
  `);
}

export async function updateFactoryImageOrder(id: number, displayOrder: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  await db.execute(sql`
    UPDATE factory_images SET displayOrder = ${displayOrder} WHERE id = ${id}
  `);
}
