import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 启用 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path } = req.query;
    
    if (!path || typeof path !== 'string') {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // 构建完整的 Directus URL
    // 使用 HTTP 而不是 HTTPS 来避免 HTTP/2 协议问题
    const directusUrl = `http://47.99.205.136:8055${path.startsWith('/') ? path : '/' + path}`;
    const url = new URL(directusUrl);
    
    // 添加查询参数 - 直接从 req.query 中获取（更可靠）
    Object.entries(req.query).forEach(([key, value]) => {
      if (key !== 'path' && value) {
        // 处理数组和字符串
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, v));
        } else {
          url.searchParams.append(key, value as string);
        }
      }
    });

    console.log('Proxying request to:', url.toString());
    
    // 转发请求到 Directus
    // 添加超时和重试机制来处理 HTTP/2 协议问题
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时
    
    try {
      const response = await fetch(url.toString(), {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        },
        ...(req.body && { body: JSON.stringify(req.body) }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      let data;
      const contentType = response.headers.get('content-type');
      console.log('Response status:', response.status, 'Content-Type:', contentType);
      
      try {
        const text = await response.text();
        console.log('Response text length:', text.length);
        data = JSON.parse(text);
      } catch (e: any) {
        console.error('Failed to parse JSON response:', e.message);
        return res.status(500).json({ error: 'Invalid JSON response from Directus', details: e.message });
      }

      if (!response.ok) {
        console.error('Directus error:', response.status, data);
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error('Fetch error:', fetchError.name, fetchError.message);
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({ error: 'Request timeout after 30s' });
      }
      return res.status(500).json({ error: 'Network error', message: fetchError.message });
    }
  } catch (error: any) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy request failed', 
      message: error.message 
    });
  }
}
