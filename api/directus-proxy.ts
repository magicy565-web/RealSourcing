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
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
    
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
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text();
        console.error('Failed to parse JSON response:', text);
        return res.status(500).json({ error: 'Invalid JSON response from Directus', details: text });
      }

      if (!response.ok) {
        console.error('Directus error:', response.status, data);
        return res.status(response.status).json(data);
      }

      return res.status(200).json(data);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.error('Request timeout');
        return res.status(504).json({ error: 'Request timeout' });
      }
      throw fetchError;
    }
  } catch (error: any) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Proxy request failed', 
      message: error.message 
    });
  }
}
