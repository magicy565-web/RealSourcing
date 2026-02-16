import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getDb } from '../server/db.js';
import { sql } from 'drizzle-orm';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 安全检查：只允许POST请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 简单的密钥验证（可选）
  const authKey = req.headers['x-admin-key'];
  if (authKey !== 'update-certifications-2024') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }

    // 执行更新
    const updates = [
      // Shanghai Medical Tech (factoryId=12)
      { id: 17, factoryId: 12, type: 'ISO 9001', name: 'ISO 9001:2015 Quality Management System', certificateNumber: 'ISO-9001-2024-SH-001', issuedBy: 'ISO Certification Authority', issuedAt: '2024-01-15', expiresAt: '2027-01-14' },
      { id: 18, factoryId: 12, type: 'CE', name: 'CE Medical Device Certification', certificateNumber: 'CE-MD-2024-SH-002', issuedBy: 'European Conformity', issuedAt: '2024-02-20', expiresAt: '2029-02-19' },
      { id: 19, factoryId: 12, type: 'FDA', name: 'FDA Medical Device Registration', certificateNumber: 'FDA-510K-2024-003', issuedBy: 'US Food and Drug Administration', issuedAt: '2024-03-10', expiresAt: '2029-03-09' },
      
      // Shenzhen Electronics (factoryId=7)
      { id: 1, factoryId: 7, type: 'ISO 9001', name: 'ISO 9001:2015 Quality Management System', certificateNumber: 'ISO-9001-2023-SZ-004', issuedBy: 'ISO Certification Authority', issuedAt: '2023-06-01', expiresAt: '2026-05-31' },
      { id: 2, factoryId: 7, type: 'CE', name: 'CE Electronics Certification', certificateNumber: 'CE-ELEC-2023-SZ-005', issuedBy: 'European Conformity', issuedAt: '2023-07-15', expiresAt: '2028-07-14' },
      { id: 3, factoryId: 7, type: 'RoHS', name: 'RoHS Compliance Certification', certificateNumber: 'ROHS-2023-SZ-006', issuedBy: 'RoHS Certification Body', issuedAt: '2023-08-20', expiresAt: '2026-08-19' },
      
      // Ningbo Textile (factoryId=8)
      { id: 4, factoryId: 8, type: 'ISO 9001', name: 'ISO 9001:2015 Quality Management System', certificateNumber: 'ISO-9001-2023-NB-007', issuedBy: 'ISO Certification Authority', issuedAt: '2023-04-10', expiresAt: '2026-04-09' },
      { id: 5, factoryId: 8, type: 'OEKO-TEX', name: 'OEKO-TEX Standard 100', certificateNumber: 'OEKO-2023-NB-008', issuedBy: 'OEKO-TEX Association', issuedAt: '2023-05-15', expiresAt: '2024-05-14' },
      { id: 6, factoryId: 8, type: 'BSCI', name: 'BSCI Social Compliance', certificateNumber: 'BSCI-2023-NB-009', issuedBy: 'Business Social Compliance Initiative', issuedAt: '2023-06-20', expiresAt: '2025-06-19' },
      
      // Guangzhou Smart Home (factoryId=9)
      { id: 7, factoryId: 9, type: 'ISO 9001', name: 'ISO 9001:2015 Quality Management System', certificateNumber: 'ISO-9001-2024-GZ-010', issuedBy: 'ISO Certification Authority', issuedAt: '2024-01-05', expiresAt: '2027-01-04' },
      { id: 8, factoryId: 9, type: 'CE', name: 'CE Smart Home Device Certification', certificateNumber: 'CE-SH-2024-GZ-011', issuedBy: 'European Conformity', issuedAt: '2024-02-10', expiresAt: '2029-02-09' },
      { id: 9, factoryId: 9, type: 'FCC', name: 'FCC Wireless Device Certification', certificateNumber: 'FCC-ID-2024-GZ-012', issuedBy: 'Federal Communications Commission', issuedAt: '2024-03-15', expiresAt: '2029-03-14' },
      { id: 10, factoryId: 9, type: 'UL', name: 'UL Safety Certification', certificateNumber: 'UL-2024-GZ-013', issuedBy: 'Underwriters Laboratories', issuedAt: '2024-04-01', expiresAt: '2029-03-31' },
      
      // Dongguan Manufacturing (factoryId=10)
      { id: 11, factoryId: 10, type: 'ISO 9001', name: 'ISO 9001:2015 Quality Management System', certificateNumber: 'ISO-9001-2023-DG-014', issuedBy: 'ISO Certification Authority', issuedAt: '2023-09-01', expiresAt: '2026-08-31' },
      { id: 12, factoryId: 10, type: 'ISO 14001', name: 'ISO 14001:2015 Environmental Management', certificateNumber: 'ISO-14001-2023-DG-015', issuedBy: 'ISO Certification Authority', issuedAt: '2023-10-01', expiresAt: '2026-09-30' },
      { id: 13, factoryId: 10, type: 'BSCI', name: 'BSCI Social Compliance', certificateNumber: 'BSCI-2023-DG-016', issuedBy: 'Business Social Compliance Initiative', issuedAt: '2023-11-01', expiresAt: '2025-10-31' },
      
      // Foshan Furniture (factoryId=11)
      { id: 14, factoryId: 11, type: 'ISO 9001', name: 'ISO 9001:2015 Quality Management System', certificateNumber: 'ISO-9001-2023-FS-017', issuedBy: 'ISO Certification Authority', issuedAt: '2023-07-01', expiresAt: '2026-06-30' },
      { id: 15, factoryId: 11, type: 'FSC', name: 'FSC Forest Stewardship Council', certificateNumber: 'FSC-2023-FS-018', issuedBy: 'Forest Stewardship Council', issuedAt: '2023-08-01', expiresAt: '2028-07-31' },
      { id: 16, factoryId: 11, type: 'CARB', name: 'CARB Phase 2 Compliance', certificateNumber: 'CARB-P2-2023-FS-019', issuedBy: 'California Air Resources Board', issuedAt: '2023-09-01', expiresAt: '2026-08-31' },
    ];

    let updated = 0;
    for (const cert of updates) {
      await db.execute(sql`
        UPDATE factory_certifications 
        SET 
          type = ${cert.type},
          name = ${cert.name},
          certificateNumber = ${cert.certificateNumber},
          issuedBy = ${cert.issuedBy},
          issuedAt = ${cert.issuedAt},
          expiresAt = ${cert.expiresAt},
          updatedAt = NOW()
        WHERE id = ${cert.id} AND factoryId = ${cert.factoryId}
      `);
      updated++;
    }

    return res.status(200).json({ 
      success: true, 
      message: `Updated ${updated} certifications`,
      updated 
    });

  } catch (error: any) {
    console.error('Failed to update certifications:', error);
    return res.status(500).json({ 
      error: 'Failed to update certifications', 
      details: error.message 
    });
  }
}
