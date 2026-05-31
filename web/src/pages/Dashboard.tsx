import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { BrutalistCard } from '../components/BrutalistCard';
import { BrutalistButton } from '../components/BrutalistButton';
import { BillCard } from '../components/BillCard';
import { api } from '../lib/api';

export function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: bills, isLoading, error } = useQuery({
    queryKey: ['bills'],
    queryFn: api.getAllBills,
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <BrutalistCard className="text-center bg-black text-white">
                <p className="text-sm uppercase opacity-70 m-0">Total Bills</p>
                <p className="font-heading text-4xl m-2">{bills.length}</p>
              </BrutalistCard>
              
              <BrutalistCard className="text-center bg-green">
                <p className="text-sm uppercase opacity-70 m-0">Total Collected</p>
                <p className="font-heading text-4xl m-2">
                  RM{bills.reduce((sum, b) => sum + b.stats.collected_amount, 0).toFixed(2)}
                </p>
              </BrutalistCard>
              
              <BrutalistCard className="text-center bg-red text-white">
                <p className="text-sm uppercase opacity-70 m-0">Still Owed</p>
                <p className="font-heading text-4xl m-2">
                  RM{bills.reduce((sum, b) => sum + b.stats.remaining_amount, 0).toFixed(2)}
                </p>
              </BrutalistCard>
            </div>

            <div className="space-y-4">
              {bills.map((bill) => (
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
          </>
        )}
      </div>
    </div>
  );
}
