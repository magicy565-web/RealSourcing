import { useState } from 'react';
import { useLocation } from 'wouter';
import AdminProductManagement from './AdminProductManagement';
import { AdminUsers } from './admin/AdminUsers';
import { AdminReview } from './admin/AdminReview';
import { AdminAnalytics } from './admin/AdminAnalytics';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Calendar,
  Users,
  Package,
  BarChart3,
  LogOut,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { trpc } from "../lib/trpc";
import { Skeleton } from "../components/ui/skeleton";

type TabType = 'webinars' | 'products' | 'users' | 'review' | 'analytics';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('analytics');

  // 使用 tRPC 获取真实数据
  const { data: webinars, isLoading: loadingWebinars } = trpc.webinar.list.useQuery();
  const { data: stats, isLoading: loadingStats } = trpc.webinar.getDashboardStats.useQuery();

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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-violet-500" />
              Admin Dashboard
            </h1>
            <p className="text-sm text-gray-400 mt-1">RealSourcing Professional Management Console</p>
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
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <BarChart3 className="h-5 w-5" />
              <span className="font-medium">Analytics</span>
            </button>
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
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'users'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <Users className="h-5 w-5" />
              <span className="font-medium">Users</span>
            </button>
            <button
              onClick={() => setActiveTab('review')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'review'
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Review</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'analytics' && <AdminAnalytics />}

          {activeTab === 'users' && <AdminUsers />}

          {activeTab === 'review' && <AdminReview />}

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
                  <p className="text-2xl font-bold">{loadingStats ? "..." : stats?.totalWebinars || 0}</p>
                </div>
                <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
                  <p className="text-sm text-gray-400 mb-1">Live Now</p>
                  <p className="text-2xl font-bold text-green-400">
                    {loadingWebinars ? "..." : webinars?.filter((w: any) => w.status === 'live').length || 0}
                  </p>
                </div>
                <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
                  <p className="text-sm text-gray-400 mb-1">Upcoming</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {loadingWebinars ? "..." : webinars?.filter((w: any) => w.status === 'upcoming').length || 0}
                  </p>
                </div>
                <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
                  <p className="text-sm text-gray-400 mb-1">Verified Factories</p>
                  <p className="text-2xl font-bold text-orange-400">
                    {loadingStats ? "..." : stats?.verifiedFactories || 0}
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
                        Duration
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
                    {loadingWebinars ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                          <Skeleton className="h-8 w-full mb-2" />
                          <Skeleton className="h-8 w-full mb-2" />
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ) : webinars?.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">
                          No webinars found. Create your first webinar to get started.
                        </td>
                      </tr>
                    ) : (
                      webinars?.map((webinar: any) => (
                        <tr key={webinar.id} className="hover:bg-[#2A2A3E] transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            #{webinar.id}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{webinar.title}</p>
                              <p className="text-xs text-gray-400 truncate max-w-xs">{webinar.description}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(webinar.status)} text-white`}>
                              {getStatusText(webinar.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {webinar.duration} mins
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {webinar.maxParticipants || 20} max
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(webinar.scheduledAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setLocation(`/webinars/${webinar.id}`)}
                                className="p-2 hover:bg-[#3A3A4E] rounded-lg transition-colors"
                                title="View Details"
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
        </div>
      </div>
    </div>
  );
}
