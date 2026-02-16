import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import AdminProductManagement from './AdminProductManagement';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut
} from 'lucide-react';

interface Webinar {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  start_time: string;
  end_time: string;
  status: string;
  host_name?: string;
  max_participants?: number;
  current_participants?: number;
  meeting_type?: string;
  product_count?: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [webinars, setWebinars] = useState<Webinar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'webinars' | 'products' | 'suppliers' | 'stats'>('webinars');

  useEffect(() => {
    fetchWebinars();
  }, []);

  const fetchWebinars = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://admin.cnsubscribe.xyz/items/webinars?fields=*,webinar_products.id&sort=-id');
      const data = await response.json();
      const webinarsWithCount = data.data.map((webinar: any) => ({
        ...webinar,
        product_count: webinar.webinar_products?.length || 0
      }));
      setWebinars(webinarsWithCount);
    } catch (error) {
      console.error('Error fetching webinars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'live': return 'Live';
      case 'upcoming': return 'Upcoming';
      case 'ended': return 'Ended';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F1E] text-white">
      {/* Header */}
      <div className="bg-[#1A1A2E] border-b border-[#2A2A3E] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">RealSourcing Management Console</p>
          </div>
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 px-4 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-[#1A1A2E] border-r border-[#2A2A3E] min-h-[calc(100vh-73px)]">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('webinars')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'webinars'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Webinars</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'products'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <Package className="h-5 w-5" />
              <span className="font-medium">Products</span>
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Suppliers</span>
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'stats'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Statistics</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'webinars' && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Webinar Management</h2>
                  <p className="text-sm text-gray-400 mt-1">Create and manage sourcing meetings</p>
                </div>
                <button
                  onClick={() => setLocation('/admin/webinars/new')}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Webinar</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
                  <p className="text-sm text-gray-400 mb-1">Total Webinars</p>
                  <p className="text-2xl font-bold">{webinars.length}</p>
                </div>
                <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
                  <p className="text-sm text-gray-400 mb-1">Live Now</p>
                  <p className="text-2xl font-bold text-green-400">
                    {webinars.filter(w => w.status === 'live').length}
                  </p>
                </div>
                <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
                  <p className="text-sm text-gray-400 mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {webinars.filter(w => w.status === 'upcoming').length}
                  </p>
                </div>
                <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
                  <p className="text-sm text-gray-400 mb-1">Completed</p>
                  <p className="text-2xl font-bold text-gray-400">
                    {webinars.filter(w => w.status === 'ended').length}
                  </p>
                </div>
              </div>

              {/* Webinars Table */}
              <div className="bg-[#1A1A2E] rounded-lg border border-[#2A2A3E] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0F0F1E] border-b border-[#2A2A3E]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Products
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Participants
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A2A3E]">
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                          Loading webinars...
                        </td>
                      </tr>
                    ) : webinars.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                          No webinars found. Create your first webinar to get started.
                        </td>
                      </tr>
                    ) : (
                      webinars.map((webinar) => (
                        <tr key={webinar.id} className="hover:bg-[#2A2A3E] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            #{webinar.id}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{webinar.title}</p>
                              {webinar.subtitle && (
                                <p className="text-sm text-gray-400">{webinar.subtitle}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(webinar.status)} text-white`}>
                              {getStatusText(webinar.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {webinar.product_count} products
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {webinar.current_participants || 0}/{webinar.max_participants || 20}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(webinar.start_time).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setLocation(`/webinars/${webinar.id}/sourcing`)}
                                className="p-2 hover:bg-[#3A3A4E] rounded-lg transition-colors"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setLocation(`/admin/webinars/${webinar.id}/edit`)}
                                className="p-2 hover:bg-[#3A3A4E] rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setLocation(`/admin/webinars/${webinar.id}/products`)}
                                className="p-2 hover:bg-violet-600 rounded-lg transition-colors"
                                title="Manage Products"
                              >
                                <Package className="h-4 w-4" />
                              </button>
                              <button
                                className="p-2 hover:bg-red-600 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <AdminProductManagement />
          )}

          {activeTab === 'suppliers' && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Supplier Management</h3>
              <p className="text-gray-400 mb-4">Coming soon...</p>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Statistics & Analytics</h3>
              <p className="text-gray-400 mb-4">Coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
