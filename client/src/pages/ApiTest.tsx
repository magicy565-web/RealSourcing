import { trpc } from '../lib/trpc';

export default function ApiTest() {
  const { data: webinars, isLoading: webinarsLoading, error: webinarsError } = trpc.webinar.list.useQuery();
  const { data: factories, isLoading: factoriesLoading, error: factoriesError } = trpc.factory.list.useQuery();
  const { data: products, isLoading: productsLoading, error: productsError } = trpc.product.list.useQuery();

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 API 测试页面</h1>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>📋 Webinar 列表</h2>
        {webinarsLoading && <p>加载中...</p>}
        {webinarsError && <p style={{ color: 'red' }}>错误: {webinarsError.message}</p>}
        {webinars && (
          <div>
            <p>✅ 成功获取 {webinars.length} 个 Webinar</p>
            {webinars.map((w) => (
              <div key={w.id} style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
                <strong>{w.title}</strong>
                <br />
                主持人: {w.host.name}
                <br />
                参会者: {w._count.participants} | 产品: {w._count.products}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>🏭 Factory 列表</h2>
        {factoriesLoading && <p>加载中...</p>}
        {factoriesError && <p style={{ color: 'red' }}>错误: {factoriesError.message}</p>}
        {factories && (
          <div>
            <p>✅ 成功获取 {factories.length} 个工厂</p>
            {factories.map((f) => (
              <div key={f.id} style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
                <strong>{f.name}</strong>
                <br />
                地点: {f.city}, {f.country}
                <br />
                评分: {f.overallScore} | 产品数: {f._count.products}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>📦 Product 列表</h2>
        {productsLoading && <p>加载中...</p>}
        {productsError && <p style={{ color: 'red' }}>错误: {productsError.message}</p>}
        {products && (
          <div>
            <p>✅ 成功获取 {products.length} 个产品</p>
            {products.map((p) => (
              <div key={p.id} style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
                <strong>{p.name}</strong>
                <br />
                类别: {p.category}
                <br />
                工厂: {p.factory.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
