import React, { useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ChevronRight,
  Sparkles,
  Inbox,
  Check,
  Ban,
  ArrowRight,
  Eye
} from 'lucide-react';
import { PartnerDonationItem, RejectPayload } from '../../types/partner';

interface PartnerDonationRequestsProps {
  donations: PartnerDonationItem[];
  isLoading: boolean;
  onSelectDonation: (donation: PartnerDonationItem) => void;
  onAccept: (donationId: string) => Promise<void>;
  onReject: (donationId: string, payload: RejectPayload) => Promise<void>;
}

export const PartnerDonationRequests: React.FC<PartnerDonationRequestsProps> = ({
  donations,
  isLoading,
  onSelectDonation,
  onAccept,
  onReject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter donations based on criteria
  const filteredDonations = donations.filter((d) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.donor_name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'Submitted' && d.status === 'Submitted') ||
      (statusFilter === 'Accepted' && d.status === 'Accepted') ||
      (statusFilter === 'Rejected' && d.status === 'Rejected');

    const matchesCategory =
      categoryFilter === 'all' ||
      (d.food_type && d.food_type.toLowerCase() === categoryFilter.toLowerCase()) ||
      d.category.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalAssigned = donations.length;
  const pendingCount = donations.filter((d) => d.status === 'Submitted').length;
  const acceptedCount = donations.filter((d) => d.status === 'Accepted').length;

  return (
    <div className="flex-1 flex flex-col p-5 md:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E7E4]">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#171717] font-['Manrope'] tracking-tight">
            Donation Requests
          </h1>
          <p className="text-xs text-[#777777] mt-0.5">
            Review incoming food donations assigned to your organization and coordinate collection.
          </p>
        </div>

        {/* Summary Counter Pills */}
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-[#FAFBF9] border border-[#E5E7E4] text-xs font-bold text-[#171717]">
            Total: <span className="text-[#888888] font-normal">{totalAssigned}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-[#F5E84D]/30 border border-[#F5E84D] text-xs font-bold text-[#171717]">
            Pending: <span>{pendingCount}</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-blue-700">
            Accepted: <span>{acceptedCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#FAFBF9] p-3 rounded-2xl border border-[#E5E7E4]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, ID, or donor name..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[#E5E7E4] text-[#171717] placeholder-[#888888] focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Status Filter Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-[#E5E7E4]">
            {['all', 'Submitted', 'Accepted', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === status
                    ? 'bg-[#171717] text-white'
                    : 'text-[#777777] hover:text-[#171717]'
                }`}
              >
                {status === 'all' ? 'All' : status === 'Submitted' ? 'Pending' : status}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-[#E5E7E4] text-[#171717] focus:outline-hidden focus:ring-2 focus:ring-[#F5E84D]"
          >
            <option value="all">All Categories</option>
            <option value="Bakery & Bread">Bakery & Bread</option>
            <option value="Prepared Meals">Prepared Meals</option>
            <option value="Fresh Produce">Fresh Produce</option>
            <option value="Packaged Pantry">Packaged Pantry</option>
            <option value="Food">Food (General)</option>
          </select>
        </div>
      </div>

      {/* Main Table for Desktop */}
      {isLoading ? (
        <div className="p-12 text-center text-xs font-bold text-[#777777]">
          Loading assigned donation requests...
        </div>
      ) : filteredDonations.length === 0 ? (
        <div className="p-12 text-center bg-[#FAFBF9] rounded-3xl border border-dashed border-[#E5E7E4] space-y-2">
          <Inbox className="w-10 h-10 text-[#888888] mx-auto" />
          <h3 className="text-sm font-bold text-[#171717]">No donation requests match criteria</h3>
          <p className="text-xs text-[#777777]">Try adjusting your search query or status filter.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-3xl border border-[#E5E7E4] shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E7E4] bg-[#FAFBF9] text-[11px] font-extrabold uppercase tracking-wider text-[#777777]">
                  <th className="py-3.5 px-5">Item</th>
                  <th className="py-3.5 px-4">Donation ID</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Quantity</th>
                  <th className="py-3.5 px-4">Donor</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4">AI Safety</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F2F0] text-xs">
                {filteredDonations.map((d) => {
                  const isSafe = d.ai_safety_status === 'Eligible';
                  return (
                    <tr
                      key={d.id}
                      className="hover:bg-[#FAFBF9] transition-colors group cursor-pointer"
                      onClick={() => onSelectDonation(d)}
                    >
                      {/* Item thumbnail + title */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          {d.image_url ? (
                            <img
                              src={d.image_url.startsWith('http') || d.image_url.startsWith('/') ? d.image_url : `/${d.image_url}`}
                              alt={d.title}
                              className="w-10 h-10 object-cover rounded-xl border border-[#E5E7E4] shrink-0"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/backend/data/test_images/f10.jpg';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-[#F1F2F0] rounded-xl flex items-center justify-center text-[#888888] shrink-0">
                              <Inbox className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 max-w-[200px]">
                            <span className="font-bold text-[#171717] block truncate group-hover:text-black">
                              {d.title}
                            </span>
                            <span className="text-[10px] text-[#888888] block truncate">
                              {d.condition} condition
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Donation ID */}
                      <td className="py-3.5 px-4 font-mono text-[11px] font-bold text-[#171717]">
                        {d.id}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#777777] font-medium">
                        {d.food_type || d.category}
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 font-bold text-[#171717]">
                        {d.quantity} {d.unit}
                      </td>

                      {/* Donor */}
                      <td className="py-3.5 px-4 text-[#171717] font-medium">
                        {d.donor_name}
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 text-[#888888] text-[11px]">
                        {new Date(d.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </td>

                      {/* AI Safety Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isSafe
                              ? 'bg-[#23845B]/10 text-[#23845B] border border-[#23845B]/20'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSafe ? 'bg-[#23845B]' : 'bg-amber-600'
                            }`}
                          />
                          {d.ai_safety_status || (isSafe ? 'Eligible' : 'Organic Stream')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === 'Submitted'
                              ? 'bg-[#F5E84D] text-[#171717]'
                              : d.status === 'Accepted'
                              ? 'bg-blue-100 text-blue-800'
                              : d.status === 'Collection Scheduled'
                              ? 'bg-purple-100 text-purple-800'
                              : d.status === 'Rejected'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-[#23845B]/10 text-[#23845B]'
                          }`}
                        >
                          {d.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectDonation(d)}
                            className="px-3 py-1.5 rounded-full bg-[#FAFBF9] hover:bg-[#F1F2F0] border border-[#E5E7E4] text-xs font-bold text-[#171717] transition-colors"
                          >
                            Details
                          </button>

                          {d.status === 'Submitted' && (
                            <>
                              <button
                                onClick={() => onAccept(d.id)}
                                title="Accept Donation"
                                className="p-1.5 rounded-full bg-[#F5E84D] hover:bg-[#EBDD3C] text-[#171717] transition-colors"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onReject(d.id, { reason: 'Storage Capacity Full' })}
                                title="Decline Donation"
                                className="p-1.5 rounded-full bg-white hover:bg-red-50 text-red-600 border border-[#E5E7E4] hover:border-red-200 transition-colors"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile / Tablet Cards View */}
          <div className="lg:hidden space-y-3">
            {filteredDonations.map((d) => (
              <div
                key={d.id}
                onClick={() => onSelectDonation(d)}
                className="bg-white p-4 rounded-2xl border border-[#E5E7E4] shadow-xs space-y-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {d.image_url ? (
                      <img
                        src={d.image_url.startsWith('http') || d.image_url.startsWith('/') ? d.image_url : `/${d.image_url}`}
                        alt={d.title}
                        className="w-12 h-12 object-cover rounded-xl border border-[#E5E7E4] shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/backend/data/test_images/f10.jpg';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#F1F2F0] rounded-xl flex items-center justify-center text-[#888888] shrink-0">
                        <Inbox className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <span className="font-mono text-[10px] font-bold text-[#888888] block">
                        {d.id}
                      </span>
                      <h4 className="text-xs font-bold text-[#171717]">{d.title}</h4>
                      <span className="text-[11px] text-[#777777]">
                        {d.quantity} {d.unit} • {d.donor_name}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      d.status === 'Submitted'
                        ? 'bg-[#F5E84D] text-[#171717]'
                        : d.status === 'Accepted'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-[#23845B]/10 text-[#23845B]'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#F1F2F0] text-xs">
                  <span className="text-[11px] text-[#888888]">
                    Submitted: {new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectDonation(d)}
                      className="px-3 py-1 rounded-full bg-[#F1F2F0] font-bold text-xs text-[#171717]"
                    >
                      Inspect Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
