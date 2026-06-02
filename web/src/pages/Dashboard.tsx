import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { BrutalistCard } from '../components/BrutalistCard';
import { BrutalistButton } from '../components/BrutalistButton';
import { BillCard } from '../components/BillCard';
import { Footer } from '../components/Footer';
import { api } from '../lib/api';
import { formatCurrency, cn } from '../lib/utils';

type Filter = 'all' | 'overdue' | 'active' | 'paid';

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('all');

  const { data: bills, isLoading, error } = useQuery({
    queryKey: ['bills'],
    queryFn: () => api.getAllBills(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] });
    },
  });

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredBills = bills?.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'paid') return b.stats.unpaid_count === 0 && b.stats.total_participants > 0;
    if (filter === 'overdue') return b.stats.is_overdue === true && b.stats.unpaid_count > 0;
    if (filter === 'active') return b.stats.unpaid_count > 0 && !b.stats.is_overdue;
    return true;
  }) || [];

  const totalCollected = bills?.reduce((sum, b) => sum + b.stats.collected_amount, 0) || 0;
  const totalRemaining = bills?.reduce((sum, b) => sum + b.stats.remaining_amount, 0) || 0;
  const overdueCount = bills?.filter((b) => b.stats.is_overdue && b.stats.unpaid_count > 0).length || 0;
  const primaryCurrency = bills?.[0]?.currency || 'MYR';

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl uppercase m-0">Dashboard</h1>
            <p className="text-gray-600 mt-1">Your collection headquarters</p>
          </div>

          <BrutalistButton
            onClick={() => navigate('/create')}
            icon="majesticons:plus"
          >
            New Bill
          </BrutalistButton>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <Icon icon="majesticons:spinner" className="h-16 w-16 animate-spin mx-auto mb-4" />
            <p className="font-heading text-xl uppercase">Loading your targets...</p>
          </div>
        )}

        {error && (
          <BrutalistCard className="text-center border-red">
            <Icon icon="majesticons:exclamation-circle" className="h-12 w-12 mx-auto mb-4 text-red" />
            <h3 className="font-heading text-2xl uppercase mb-2">Error Loading Bills</h3>
            <p className="mb-4">Something went wrong. The consequences are upon us.</p>
            <BrutalistButton variant="outline" onClick={() => window.location.reload()}>
              Retry
            </BrutalistButton>
          </BrutalistCard>
        )}

        {!isLoading && !error && bills && bills.length === 0 && (
          <div className="text-center py-16">
            <Icon icon="majesticons:clipboard-x" className="h-24 w-24 mx-auto mb-6 text-gray-400" />
            <h2 className="font-heading text-3xl uppercase mb-4">No Bills Yet</h2>
            <p className="text-xl mb-8 text-gray-600">Start splitting (or sipping alone).</p>
            <BrutalistButton
              onClick={() => navigate('/create')}
              className="text-xl px-8 py-4 animate-pulse-brutalist"
              icon="majesticons:rocket"
            >
              Create Your First Bill
            </BrutalistButton>
          </div>
        )}

        {!isLoading && !error && bills && bills.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <BrutalistCard className="text-center bg-black text-white">
                <p className="text-xs uppercase opacity-70 m-0">Bills</p>
                <p className="font-heading text-3xl m-1">{bills.length}</p>
              </BrutalistCard>

              <BrutalistCard className="text-center bg-green">
                <p className="text-xs uppercase opacity-70 m-0">Collected</p>
                <p className="font-heading text-2xl m-1">{formatCurrency(totalCollected, primaryCurrency)}</p>
              </BrutalistCard>

              <BrutalistCard className="text-center bg-red text-white">
                <p className="text-xs uppercase opacity-70 m-0">Owed</p>
                <p className="font-heading text-2xl m-1">{formatCurrency(totalRemaining, primaryCurrency)}</p>
              </BrutalistCard>

              <BrutalistCard className={cn('text-center', overdueCount > 0 ? 'bg-yellow animate-pulse' : 'bg-gray-200')}>
                <p className="text-xs uppercase opacity-70 m-0">Overdue</p>
                <p className="font-heading text-3xl m-1">{overdueCount}</p>
              </BrutalistCard>
            </div>

            <div className="flex gap-2 mb-4 border-4 border-black bg-white p-1">
              {(['all', 'overdue', 'active', 'paid'] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    'flex-1 px-3 py-2 text-xs font-bold uppercase transition-all',
                    filter === f ? 'bg-black text-white' : 'hover:bg-yellow/30'
                  )}
                >
                  {f}
                  {f === 'overdue' && overdueCount > 0 && (
                    <span className="ml-1 bg-red text-white px-1.5 text-[10px]">{overdueCount}</span>
                  )}
                </button>
              ))}
            </div>

            {filteredBills.length === 0 ? (
              <div className="text-center py-12 border-4 border-dashed border-gray-300">
                <Icon icon="majesticons:ghost" className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500">No bills match this filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBills.map((bill) => (
                  <div key={bill.id} className="relative group">
                    <BillCard
                      bill={bill}
                      onClick={() => navigate(`/bill/${bill.share_token}`)}
                    />

                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(bill.id, bill.title); }}
                      className="absolute -top-3 -right-3 bg-red text-white border-4 border-black w-10 h-10 flex items-center justify-center font-bold hover:bg-black hover:text-red transition-colors cursor-pointer opacity-0 group-hover:opacity-100 z-10"
                      title="Delete bill"
                    >
                      <Icon icon="majesticons:trash" className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        <Footer />
      </div>
    </div>
  );
}
