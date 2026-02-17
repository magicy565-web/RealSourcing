import { useState } from 'react';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { trpc } from '../../lib/trpc';
import { 
  Users, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MetricCard } from '../../components/admin/MetricCard';

export function AdminUsers() {
  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    role: undefined as string | undefined,
    status: undefined as string | undefined,
    search: '',
  });

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    action: () => void;
    variant?: 'default' | 'destructive';
  }>({ open: false, title: '', description: '', action: () => {}, variant: 'default' });

  // 查询用户列表
  const { data: users, isLoading, refetch } = trpc.admin.user.list.useQuery(filters);
  
  // 查询用户统计
  const { data: stats } = trpc.admin.user.getStats.useQuery();

  // 更新用户状态
  const updateStatusMutation = trpc.admin.user.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
      setConfirmDialog({ ...confirmDialog, open: false });
    },
  });

  // 批量更新
  const batchUpdateMutation = trpc.admin.user.batchUpdate.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedUsers([]);
      setConfirmDialog({ ...confirmDialog, open: false });
    },
  });

  const handleStatusUpdate = (userId: number, status: 'active' | 'suspended' | 'deleted', userName: string) => {
    const statusText = { active: '激活', suspended: '禁用', deleted: '删除' };
    setConfirmDialog({
      open: true,
      title: `${statusText[status]}用户`,
      description: `确定要${statusText[status]}用户 "${userName}" 吗?`,
      variant: status === 'deleted' ? 'destructive' : 'default',
      action: () => updateStatusMutation.mutate({ id: userId, status }),
    });
  };

  const handleBatchAction = (action: 'activate' | 'suspend' | 'delete') => {
    if (selectedUsers.length === 0) {
      alert('请先选择用户');
      return;
    }
    const actionText = { activate: '激活', suspend: '禁用', delete: '删除' };
    setConfirmDialog({
      open: true,
      title: `批量${actionText[action]}用户`,
      description: `确定要${actionText[action]} ${selectedUsers.length} 个用户吗?`,
      variant: action === 'delete' ? 'destructive' : 'default',
      action: () => batchUpdateMutation.mutate({ ids: selectedUsers, action }),
    });
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === users?.items.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users?.items.map(u => u.id) || []);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">User Management</h2>
        <p className="text-gray-400">Manage all users, buyers, factories, and admins</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Total Users"
          value={stats?.byRole.reduce((sum, r) => sum + r.count, 0) || 0}
          icon={<Users className="h-5 w-5" />}
        />
        <MetricCard
          title="Buyers"
          value={stats?.byRole.find(r => r.role === 'buyer')?.count || 0}
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          title="Factories"
          value={stats?.byRole.find(r => r.role === 'factory')?.count || 0}
          icon={<Users className="h-5 w-5" />}
          color="purple"
        />
        <MetricCard
          title="Active (7d)"
          value={stats?.activeUsersLast7Days || 0}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Filters */}
      <div className="bg-[#1A1A2E] rounded-lg p-4 mb-6 border border-[#2A2A3E]">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Role</label>
            <select
              className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg text-white focus:outline-none focus:border-violet-500"
              value={filters.role || ''}
              onChange={(e) => setFilters({ ...filters, role: e.target.value || undefined, page: 1 })}
            >
              <option value="">All Roles</option>
              <option value="buyer">Buyer</option>
              <option value="factory">Factory</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select
              className="w-full px-4 py-2 bg-[#0F0F1E] border border-[#2A2A3E] rounded-lg text-white focus:outline-none focus:border-violet-500"
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined, page: 1 })}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, pageSize: 20, role: undefined, status: undefined, search: '' })}
              className="w-full px-4 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedUsers.length > 0 && (
        <div className="bg-violet-600/20 border border-violet-600/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              <span className="font-semibold">{selectedUsers.length}</span> users selected
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => handleBatchAction('activate')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors"
              >
                Activate
              </button>
              <button
                onClick={() => handleBatchAction('suspend')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded-lg text-sm transition-colors"
              >
                Suspend
              </button>
              <button
                onClick={() => handleBatchAction('delete')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-[#1A1A2E] rounded-lg border border-[#2A2A3E] overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#0F0F1E] border-b border-[#2A2A3E]">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users?.items.length && users?.items.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-600"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Registered</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A3E]">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : users?.items.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-gray-400">
                  No users found
                </td>
              </tr>
            ) : (
              users?.items.map((user) => (
                <tr key={user.id} className="hover:bg-[#2A2A3E] transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm">#{user.id}</td>
                  <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                      user.role === 'factory' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'buyer' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                      user.status === 'suspended' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 hover:bg-[#3A3A4E] rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {user.status !== 'active' && (
                        <button
                          onClick={() => handleStatusUpdate(user.id, 'active', user.name || user.email || '')}
                          className="p-2 hover:bg-green-600/20 rounded-lg transition-colors"
                          title="Activate"
                        >
                          <CheckCircle className="h-4 w-4 text-green-400" />
                        </button>
                      )}
                      {user.status === 'active' && (
                        <button
                          onClick={() => handleStatusUpdate(user.id, 'suspended', user.name || user.email || '')}
                          className="p-2 hover:bg-orange-600/20 rounded-lg transition-colors"
                          title="Suspend"
                        >
                          <XCircle className="h-4 w-4 text-orange-400" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusUpdate(user.id, 'deleted', user.name || user.email || '')}
                        className="p-2 hover:bg-red-600/20 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {users && users.totalPages > 1 && (
          <div className="bg-[#0F0F1E] px-6 py-4 border-t border-[#2A2A3E]">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {((users.page - 1) * users.pageSize) + 1} to {Math.min(users.page * users.pageSize, users.total)} of {users.total} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  disabled={filters.page === 1}
                  className="px-4 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <button
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  disabled={filters.page === users.totalPages}
                  className="px-4 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* 确认对话框 */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        onConfirm={confirmDialog.action}
      />
    </div>
  );
}
