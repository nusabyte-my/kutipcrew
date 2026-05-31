import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { CreateBillForm } from '../components/CreateBillForm';
import { BrutalistCard } from '../components/BrutalistCard';
import { api } from '../lib/api';

export function CreateBill() {
  const navigate = useNavigate();
  
  const createMutation = useMutation({
    mutationFn: api.createBill,
    onSuccess: (data) => {
      navigate(`/bill/${data.share_token}`);
    },
    onError: (error) => {
      alert(`Failed to create bill: ${error.message}`);
    },
  });

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-black font-bold mb-4 cursor-pointer"
          >
            <Icon icon="majesticons:arrow-left" className="h-5 w-5" />
            Back to Home
          </button>
          
          <div className="text-center">
            <h1 className="font-heading text-4xl md:text-5xl uppercase mb-2">
              Create New Bill
            </h1>
            <p className="font-body text-gray-600">
              Set up the hunt. Add your targets. Let the consequences begin.
            </p>
          </div>
        </div>

        <BrutalistCard icon="majesticons:pencil-line" title="Bill Details">
          <CreateBillForm 
            onSubmit={(data) => createMutation.mutate(data)}
            loading={createMutation.isPending}
          />
        </BrutalistCard>

        <div className="mt-6 border-4 border-dashed border-gray-400 p-4 text-center text-sm text-gray-500">
          <Icon icon="majesticons:info-circle" className="inline h-4 w-4 mr-1" />
          All bills are public via share link. No login required. Share responsibly.
        </div>
      </div>
    </div>
  );
}
