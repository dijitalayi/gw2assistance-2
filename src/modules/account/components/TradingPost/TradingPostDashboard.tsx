'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Search,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/core/contexts/AuthContext';
import { 
  fetchTPTransactions, 
  fetchItems, 
  TPTransaction, 
  ItemDef 
} from '../../services/accountApi';
import { PriceDisplay } from '@/shared/components/PriceDisplay';

type TabType = 'buys' | 'sells';
type StatusType = 'current' | 'history';

export function TradingPostDashboard() {
  const { apiKey } = useAuth();
  const [tab, setTab] = useState<TabType>('sells');
  const [status, setStatus] = useState<StatusType>('current');
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  // Fetch Transactions
  const { data: transactions, isLoading: isTPLoading, error: tpError } = useQuery({
    queryKey: ['tp-transactions', tab, status, apiKey],
    queryFn: () => fetchTPTransactions(apiKey!, tab, status),
    enabled: !!apiKey,
  });

  // Fetch Item Metadata
  const itemIds = Array.from(new Set(transactions?.map(t => t.item_id) || []));
  const { data: items, isLoading: isItemsLoading } = useQuery({
    queryKey: ['tp-items', itemIds],
    queryFn: () => fetchItems(itemIds),
    enabled: itemIds.length > 0,
  });

  const getItem = (id: number) => items?.find(i => i.id === id);

  // Pagination Logic
  const totalPages = transactions ? Math.ceil(transactions.length / itemsPerPage) : 0;
  const currentData = transactions?.slice((page - 1) * itemsPerPage, page * itemsPerPage) || [];

  if (tpError) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center gap-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold text-white">Trading Post Error</h3>
          <p className="text-gray-400">Please ensure your API key has the "tradingpost" permission.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#1a1c23] p-6 rounded-3xl border border-white/5 shadow-2xl">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-[#eb5e28]" />
            Trading Post
          </h2>
          <p className="text-sm text-gray-400 font-medium">Manage your marketplace activities</p>
        </div>

        <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => { setStatus('current'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              status === 'current' ? 'bg-[#eb5e28] text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            Active Offers
          </button>
          <button
            onClick={() => { setStatus('history'); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
              status === 'history' ? 'bg-[#eb5e28] text-white shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setTab('sells'); setPage(1); }}
          className={`group flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${
            tab === 'sells' 
              ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' 
              : 'bg-[#1a1c23] border-white/5 text-gray-500 hover:border-orange-500/30 hover:text-orange-400'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${tab === 'sells' ? 'bg-orange-500/20' : 'bg-black/20 group-hover:bg-orange-500/10'}`}>
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <span className="font-bold uppercase tracking-widest text-sm">Sell Transactions</span>
        </button>

        <button
          onClick={() => { setTab('buys'); setPage(1); }}
          className={`group flex items-center gap-3 px-6 py-4 rounded-2xl border transition-all ${
            tab === 'buys' 
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
              : 'bg-[#1a1c23] border-white/5 text-gray-500 hover:border-blue-500/30 hover:text-blue-400'
          }`}
        >
          <div className={`p-2 rounded-lg transition-colors ${tab === 'buys' ? 'bg-blue-500/20' : 'bg-black/20 group-hover:bg-blue-500/10'}`}>
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <span className="font-bold uppercase tracking-widest text-sm">Buy Transactions</span>
        </button>
      </div>

      {/* List */}
      <div className="bg-[#1a1c23] rounded-3xl border border-white/5 overflow-hidden shadow-2xl min-h-[400px]">
        {isTPLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[#eb5e28]" />
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Fetching market data...</p>
          </div>
        ) : currentData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Item</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Quantity</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Price</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {currentData.map((tx) => {
                  const item = getItem(tx.item_id);
                  return (
                    <tr key={tx.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative group-hover:scale-110 transition-transform">
                            {item?.icon ? (
                              <img src={item.icon} alt="" className="w-10 h-10 rounded-lg shadow-lg border border-white/10" />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-[#eb5e28] transition-colors line-clamp-1">
                              {item?.name || `Item #${tx.item_id}`}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase font-black truncate max-w-[150px]">
                              ID: {tx.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-gray-300">
                          {tx.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <PriceDisplay coins={tx.price} className="justify-end" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(tx.created).toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-50">
            <History className="w-12 h-12 text-gray-600" />
            <p className="text-sm text-gray-500 font-bold uppercase tracking-widest text-center">No transactions found.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-6 border-t border-white/5 bg-black/20">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      page === pageNum 
                        ? 'bg-[#eb5e28] text-white' 
                        : 'text-gray-400 hover:bg-white/5'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              {totalPages > 5 && <span className="text-gray-600 mx-1">...</span>}
              {totalPages > 5 && (
                 <button
                 onClick={() => setPage(totalPages)}
                 className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                   page === totalPages ? 'bg-[#eb5e28] text-white' : 'text-gray-400 hover:bg-white/5'
                 }`}
               >
                 {totalPages}
               </button>
              )}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
