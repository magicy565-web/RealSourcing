import { useState } from 'react';
import { trpc } from '../../lib/trpc';
import { 
  CheckCircle, 
  XCircle, 
  Building2,
  Package,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { MetricCard } from '../../components/admin/MetricCard';

type ReviewType = 'factory' | 'product' | 'certification';

export function AdminReview() {
  const [activeTab, setActiveTab] = useState<ReviewType>('factory');
  const [page, setPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  // 查询待审核列表
  const { data: pendingItems, isLoading, refetch } = trpc.admin.review.getPendingList.useQuery({
    type: activeTab,
    page,
    pageSize: 20,
  });

  // 查询审核统计
  const { data: stats } = trpc.admin.review.getStats.useQuery();

  // 审核通过
  const approveMutation = trpc.admin.review.approve.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // 审核拒绝
  const rejectMutation = trpc.admin.review.reject.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // 批量审核
  const batchApproveMutation = trpc.admin.review.batchApprove.useMutation({
    onSuccess: () => {
      refetch();
      setSelectedItems([]);
    },
  });

  const handleApprove = (id: number) => {
    if (confirm('Are you sure you want to approve this item?')) {
      approveMutation.mutate({ type: activeTab, id });
    }
  };

  const handleReject = (id: number) => {
    const reason = prompt('Please provide a rejection reason:');
    if (reason) {
      rejectMutation.mutate({ type: activeTab, id, reason });
    }
  };

  const handleBatchApprove = () => {
    if (selectedItems.length === 0) {
      alert('Please select items first');
      return;
    }
    if (confirm(`Are you sure you want to approve ${selectedItems.length} items?`)) {
      batchApproveMutation.mutate({ type: activeTab, ids: selectedItems });
    }
  };

  const toggleItemSelection = (id: number) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === pendingItems?.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(pendingItems?.items.map((item: any) => item.id) || []);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Content Review</h2>
        <p className="text-gray-400">Review and approve factories, products, and certifications</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <MetricCard
          title="Pending Factories"
          value={stats?.pendingFactories || 0}
          icon={<Building2 className="h-5 w-5" />}
          color="purple"
        />
        <MetricCard
          title="Pending Products"
          value={stats?.pendingProducts || 0}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          title="Pending Certifications"
          value={stats?.pendingCertifications || 0}
          icon={<Award className="h-5 w-5" />}
          color="orange"
        />
        <MetricCard
          title="Verified Factories"
          value={stats?.verifiedFactories || 0}
          icon={<CheckCircle className="h-5 w-5" />}
          color="green"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => { setActiveTab('factory'); setPage(1); setSelectedItems([]); }}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'factory'
              ? 'bg-violet-600 text-white'
              : 'bg-[#1A1A2E] text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Factories ({stats?.pendingFactories || 0})
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('product'); setPage(1); setSelectedItems([]); }}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'product'
              ? 'bg-violet-600 text-white'
              : 'bg-[#1A1A2E] text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products ({stats?.pendingProducts || 0})
          </div>
        </button>
        <button
          onClick={() => { setActiveTab('certification'); setPage(1); setSelectedItems([]); }}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'certification'
              ? 'bg-violet-600 text-white'
              : 'bg-[#1A1A2E] text-gray-400 hover:text-white hover:bg-[#2A2A3E]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Certifications ({stats?.pendingCertifications || 0})
          </div>
        </button>
      </div>

      {/* Batch Actions */}
      {selectedItems.length > 0 && (
        <div className="bg-violet-600/20 border border-violet-600/30 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm">
              <span className="font-semibold">{selectedItems.length}</span> items selected
            </p>
            <button
              onClick={handleBatchApprove}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm transition-colors flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Approve All
            </button>
          </div>
        </div>
      )}

      {/* Content List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-[#1A1A2E] rounded-lg p-8 text-center text-gray-400 border border-[#2A2A3E]">
            Loading...
          </div>
        ) : pendingItems?.items.length === 0 ? (
          <div className="bg-[#1A1A2E] rounded-lg p-8 text-center text-gray-400 border border-[#2A2A3E]">
            No pending {activeTab}s to review
          </div>
        ) : (
          <>
            {/* Select All */}
            <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedItems.length === pendingItems?.items.length && pendingItems?.items.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-600"
                />
                <span className="text-sm text-gray-400">Select all</span>
              </label>
            </div>

            {/* Items */}
            {pendingItems?.items.map((item: any) => (
              <div
                key={item.id}
                className="bg-[#1A1A2E] rounded-lg p-6 border border-[#2A2A3E] hover:border-violet-500/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => toggleItemSelection(item.id)}
                    className="mt-1 rounded border-gray-600"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">
                          {item.name || item.title || `${activeTab} #${item.id}`}
                        </h3>
                        <p className="text-sm text-gray-400">
                          ID: #{item.id} • Submitted: {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      {activeTab === 'factory' && (
                        <>
                          <div>
                            <span className="text-gray-400">Company:</span>
                            <span className="ml-2 text-white">{item.companyName || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Location:</span>
                            <span className="ml-2 text-white">{item.city || 'N/A'}, {item.country || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Main Products:</span>
                            <span className="ml-2 text-white">{item.mainProducts || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Employees:</span>
                            <span className="ml-2 text-white">{item.employeeCount || 'N/A'}</span>
                          </div>
                        </>
                      )}
                      {activeTab === 'product' && (
                        <>
                          <div>
                            <span className="text-gray-400">SKU:</span>
                            <span className="ml-2 text-white">{item.sku || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Price:</span>
                            <span className="ml-2 text-white">${item.price || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">MOQ:</span>
                            <span className="ml-2 text-white">{item.moq || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Category:</span>
                            <span className="ml-2 text-white">{item.category || 'N/A'}</span>
                          </div>
                        </>
                      )}
                      {activeTab === 'certification' && (
                        <>
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <span className="ml-2 text-white">{item.type || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Issuer:</span>
                            <span className="ml-2 text-white">{item.issuer || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Issue Date:</span>
                            <span className="ml-2 text-white">
                              {item.issueDate ? new Date(item.issueDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Expiry Date:</span>
                            <span className="ml-2 text-white">
                              {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Description */}
                    {item.description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={approveMutation.isLoading}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={rejectMutation.isLoading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {pendingItems && pendingItems.total > 20 && (
              <div className="bg-[#1A1A2E] rounded-lg p-4 border border-[#2A2A3E]">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">
                    Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, pendingItems.total)} of {pendingItems.total} items
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                      className="px-4 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={page * 20 >= pendingItems.total}
                      className="px-4 py-2 bg-[#2A2A3E] hover:bg-[#3A3A4E] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
