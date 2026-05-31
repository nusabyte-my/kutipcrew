import { useState } from 'react';
import { Icon } from '@iconify/react';
import { BrutalistButton } from './BrutalistButton';
import { cn } from '../lib/utils';
import { api } from '../lib/api';

interface CreateBillFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    total_amount: number;
    organizer_name: string;
    organizer_contact?: string;
    bank_name?: string;
    bank_account?: string;
    bank_holder?: string;
    payment_qr_url?: string;
    due_date?: string;
    participants: Array<{ name: string; phone: string }>;
  }) => void;
  loading?: boolean;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length > 1) {
    return '6' + digits.slice(1);
  }
  if (!digits.startsWith('6')) {
    return '6' + digits;
  }
  return digits;
}

export function CreateBillForm({ onSubmit, loading }: CreateBillFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [organizerName, setOrganizerName] = useState('');
  const [organizerContact, setOrganizerContact] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankHolder, setBankHolder] = useState('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [qrUploading, setQrUploading] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState('');
  const [participants, setParticipants] = useState<Array<{ name: string; phone: string }>>([
    { name: '', phone: '' }
  ]);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', phone: '' }]);
  };

  const removeParticipant = (index: number) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const updateParticipant = (index: number, field: 'name' | 'phone', value: string) => {
    const updated = [...participants];
    if (field === 'phone') {
      value = value.replace(/[^0-9+\s\-()]/g, '');
    }
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleQRChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrFile(file);
      setQrPreview(URL.createObjectURL(file));
      setQrUrl(undefined);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
const validParticipants = participants.filter(p => p.name.trim() !== '' && p.phone.trim() !== '');

    if (!title || !totalAmount || !organizerName || validParticipants.length === 0) {
      alert('Semua field bertanda * wajib diisi. Termasuk nombor telefon peserta! 💀');
      return;
    }

    const missingPhone = participants.find((p) => p.name.trim() && !p.phone.trim());
    if (missingPhone) {
      alert(`"${missingPhone.name}" needs a phone number! WhatsApp threat tak boleh hantar without it! 📱💀`);
      return;
    }

    const formattedParticipants = validParticipants.map((p) => ({
      name: p.name.trim(),
      phone: formatPhone(p.phone.trim()),
    }));

    let uploadedQrUrl = qrUrl;
    if (qrFile && !uploadedQrUrl) {
      setQrUploading(true);
      try {
        const result = await api.uploadQR(qrFile);
        uploadedQrUrl = result.url;
        setQrUrl(uploadedQrUrl);
      } catch (err: any) {
        alert(`QR upload failed: ${err.message}`);
        setQrUploading(false);
        return;
      }
      setQrUploading(false);
    }

    onSubmit({
      title,
      description: description || undefined,
      total_amount: parseFloat(totalAmount),
      organizer_name: organizerName,
      organizer_contact: organizerContact || undefined,
      bank_name: bankName || undefined,
      bank_account: bankAccount || undefined,
      bank_holder: bankHolder || undefined,
      payment_qr_url: uploadedQrUrl,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      participants: formattedParticipants,
    });
  };

  const inputClass = "w-full border-4 border-black bg-white px-4 py-3 font-body text-lg focus:outline-none focus:bg-yellow transition-colors duration-100";
  const labelClass = "block font-heading uppercase text-sm mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            Bill Title <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Friday Makan Session"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>
            Total Amount (MYR) <span className="text-red">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">RM</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="0.00"
              className={cn(inputClass, "pl-12")}
              required
            />
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this bill for? (optional)"
          rows={3}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>
            Your Name <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={organizerName}
            onChange={(e) => setOrganizerName(e.target.value)}
            placeholder="The one who will collect"
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Your Contact</label>
          <input
            type="text"
            value={organizerContact}
            onChange={(e) => setOrganizerContact(e.target.value)}
            placeholder="Phone or WhatsApp number"
            className={inputClass}
          />
        </div>
      </div>

      <div className="border-4 border-black p-6 bg-green/10">
        <h3 className="font-heading text-xl uppercase m-0 mb-4 flex items-center gap-2">
          <Icon icon="majesticons:money" className="h-6 w-6" />
          Bank Details (for payers)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Bank Name</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g., Maybank"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Account Number</label>
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="e.g., 1234567890"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Account Holder</label>
            <input
              type="text"
              value={bankHolder}
              onChange={(e) => setBankHolder(e.target.value)}
              placeholder="e.g., Ahmad bin Ali"
              className={inputClass}
            />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t-4 border-dashed border-black/20">
          <label className={labelClass}>Payment QR Code (DuitNow / TnG / Bank)</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <label className="border-4 border-dashed border-black p-6 bg-white cursor-pointer hover:bg-yellow/30 transition-colors flex flex-col items-center justify-center min-w-[160px] min-h-[160px] text-center">
              {qrPreview ? (
                <img src={qrPreview} alt="QR Preview" className="w-32 h-32 object-contain mb-2" />
              ) : (
                <>
                  <Icon icon="majesticons:qr-code" className="h-10 w-10 mb-2 text-gray-400" />
                  <span className="text-sm font-bold uppercase text-gray-500">Upload QR</span>
                </>
              )}
              <input type="file" accept="image/png,image/jpeg,image/webp" onChange={handleQRChange} className="hidden" />
            </label>
            <div className="flex-1">
              <p className="text-sm mb-2">Upload your DuitNow, Touch 'n Go, or bank QR code. Payers will see this on the bill page.</p>
              <p className="text-xs text-gray-500">PNG, JPEG, or WebP. Max 5MB.</p>
              {qrUploading && (
                <div className="flex items-center gap-2 mt-2 text-sm font-bold">
                  <Icon icon="majesticons:spinner" className="animate-spin h-4 w-4" />
                  Uploading...
                </div>
              )}
              {qrUrl && !qrUploading && (
                <div className="flex items-center gap-2 mt-2 text-sm font-bold text-green-700">
                  <Icon icon="majesticons:check-circle" className="h-4 w-4" />
                  QR uploaded!
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">Included in WhatsApp threats so they know where to send your money 💰</p>
      </div>

      <div>
        <label className={labelClass}>Due Date</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1">Leave empty for no deadline (risky...)</p>
      </div>

      <div className="border-4 border-black p-6 bg-bg-secondary">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl uppercase m-0 flex items-center gap-2">
            <Icon icon="majesticons:users" className="h-6 w-6" />
            Participants
          </h3>
          <button
            type="button"
            onClick={addParticipant}
            className="border-4 border-black bg-white px-4 py-2 font-bold uppercase text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green transition-colors cursor-pointer"
          >
            <Icon icon="majesticons:plus" className="inline h-4 w-4 mr-1" />
            Add Target
          </button>
        </div>

        <div className="space-y-4">
          {participants.map((participant, index) => (
            <div key={index} className="bg-white border-4 border-black p-4 relative">
              {participants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeParticipant(index)}
                  className="absolute -top-3 -right-3 bg-red text-white border-4 border-black w-8 h-8 flex items-center justify-center font-bold hover:bg-black hover:text-red transition-colors cursor-pointer"
                >
                  <Icon icon="majesticons:x" className="h-4 w-4" />
                </button>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={participant.name}
                  onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                  placeholder="Name *"
                  className="border-4 border-black px-3 py-2 focus:outline-none focus:bg-yellow"
                  required
                />
                <div>
                  <input
                    type="tel"
                    value={participant.phone}
                    onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                    placeholder="Phone * — e.g., 0123456789"
                    className="border-4 border-black px-3 py-2 focus:outline-none focus:bg-yellow w-full"
                    required
                  />
                  <p className="text-[10px] text-gray-500 mt-0.5 m-0">Auto-formats to WhatsApp format (6XXXXXXXXXX)</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BrutalistButton 
        type="submit" 
        className="w-full text-xl py-4 animate-pulse-brutalist"
        icon="majesticons:rocket"
        iconPosition="right"
        loading={loading}
      >
        Create Bill & Start The Hunt
      </BrutalistButton>
    </form>
  );
}
