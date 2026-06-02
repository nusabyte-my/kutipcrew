import { useState } from 'react';
import { Icon } from '@iconify/react';
import { BrutalistButton } from './BrutalistButton';
import { cn, formatPhone, formatCurrency } from '../lib/utils';
import { api } from '../lib/api';
import { CATEGORY_META, type BillCategory, type SplitMode } from '../types';

interface CreateBillFormProps {
  onSubmit: (data: {
    title: string;
    description?: string;
    total_amount: number;
    currency?: string;
    organizer_name: string;
    organizer_contact?: string;
    bank_name?: string;
    bank_account?: string;
    bank_holder?: string;
    payment_qr_url?: string;
    due_date?: string;
    category?: BillCategory;
    tags?: string[];
    split_mode?: SplitMode;
    participants: Array<{ name: string; phone: string; share_amount?: number; share_weight?: number }>;
  }) => void;
  loading?: boolean;
}

const CURRENCIES: Array<{ code: string; label: string }> = [
  { code: 'MYR', label: 'MYR (RM)' },
  { code: 'SGD', label: 'SGD (S$)' },
  { code: 'IDR', label: 'IDR (Rp)' },
  { code: 'THB', label: 'THB (฿)' },
  { code: 'PHP', label: 'PHP (₱)' },
  { code: 'USD', label: 'USD ($)' },
];

const CURRENCY_SYMBOL: Record<string, string> = {
  MYR: 'RM', SGD: 'S$', IDR: 'Rp', THB: '฿', PHP: '₱', USD: '$', EUR: '€', GBP: '£',
};

export function CreateBillForm({ onSubmit, loading }: CreateBillFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState('MYR');
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
  const [category, setCategory] = useState<BillCategory>('other');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [participants, setParticipants] = useState<Array<{ name: string; phone: string; share_amount?: number; share_weight?: number }>>([
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

  const updateParticipant = (index: number, field: 'name' | 'phone' | 'share_amount' | 'share_weight', value: string) => {
    const updated = [...participants];
    if (field === 'phone') {
      value = value.replace(/[^0-9+\s\-()]/g, '');
    } else if (field === 'share_amount' || field === 'share_weight') {
      (updated[index] as any)[field] = value === '' ? undefined : parseFloat(value);
      setParticipants(updated);
      return;
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

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().slice(0, 32);
    if (t && !tags.includes(t) && tags.length < 20) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validParticipants = participants.filter((p) => p.name.trim() !== '');

    if (!title || !totalAmount || !organizerName || validParticipants.length === 0) {
      alert('Semua field bertanda * wajib diisi. 💀');
      return;
    }

    const missingPhone = validParticipants.find((p) => !p.phone.trim());
    if (missingPhone) {
      alert(`"${missingPhone.name}" needs a phone number! WhatsApp threat tak boleh hantar without it! 📱💀`);
      return;
    }

    const formattedParticipants = validParticipants.map((p) => ({
      name: p.name.trim(),
      phone: formatPhone(p.phone.trim()),
      share_amount: p.share_amount,
      share_weight: p.share_weight,
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
      currency,
      organizer_name: organizerName,
      organizer_contact: organizerContact || undefined,
      bank_name: bankName || undefined,
      bank_account: bankAccount || undefined,
      bank_holder: bankHolder || undefined,
      payment_qr_url: uploadedQrUrl,
      due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
      category,
      tags: tags.length > 0 ? tags : undefined,
      split_mode: splitMode,
      participants: formattedParticipants,
    });
  };

  const inputClass = 'w-full border-4 border-black bg-white px-4 py-3 font-body text-lg focus:outline-none focus:bg-yellow transition-colors duration-100';
  const labelClass = 'block font-heading uppercase text-sm mb-2';
  const sym = CURRENCY_SYMBOL[currency] || currency;
  const total = parseFloat(totalAmount) || 0;
  const weightsSum = participants.reduce((s, p) => s + (p.share_weight ?? 1), 0) || 1;
  const equalShare = participants.filter((p) => p.name.trim()).length > 0
    ? total / participants.filter((p) => p.name.trim()).length
    : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <label className={labelClass}>
            Bill Title <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Friday Makan Session"
            className={inputClass}
            maxLength={255}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className={inputClass}
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          Total Amount <span className="text-red">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500">{sym}</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={totalAmount}
            onChange={(e) => setTotalAmount(e.target.value)}
            placeholder="0.00"
            className={cn(inputClass, 'pl-12')}
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What's this bill for? (optional)"
          rows={3}
          maxLength={2000}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.keys(CATEGORY_META) as BillCategory[]).map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  'border-4 border-black p-3 flex flex-col items-center gap-1 transition-all',
                  category === cat ? `${meta.color} shadow-none translate-x-1 translate-y-1` : 'bg-white hover:bg-yellow/30'
                )}
              >
                <Icon icon={meta.icon} className="h-6 w-6" />
                <span className="text-xs font-bold uppercase">{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass}>Tags (optional)</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
            placeholder="e.g., mamak, weekend"
            className={inputClass}
          />
          <BrutalistButton type="button" variant="outline" onClick={addTag} className="!px-4">
            Add
          </BrutalistButton>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 border-2 border-black bg-black text-white px-2 py-1 text-xs font-bold">
                #{t}
                <button type="button" onClick={() => removeTag(t)} className="hover:text-red">
                  <Icon icon="majesticons:x" className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
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
            maxLength={255}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Your Contact</label>
          <input
            type="tel"
            value={organizerContact}
            onChange={(e) => setOrganizerContact(e.target.value)}
            placeholder="e.g., 0123456789"
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <div>
          <label className={labelClass}>Split Mode</label>
          <div className="grid grid-cols-3 gap-1 border-4 border-black">
            {(['equal', 'custom', 'shares'] as SplitMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSplitMode(mode)}
                className={cn(
                  'px-2 py-3 text-xs font-bold uppercase',
                  splitMode === mode ? 'bg-black text-white' : 'bg-white hover:bg-yellow/30'
                )}
              >
                {mode}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {splitMode === 'equal' && 'Split total evenly among all participants'}
            {splitMode === 'custom' && 'Set each participant\'s amount manually'}
            {splitMode === 'shares' && 'Use share weights (e.g., 2 shares = double portion)'}
          </p>
        </div>
      </div>

      <div className="border-4 border-black p-6 bg-bg-secondary">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-xl uppercase m-0 flex items-center gap-2">
            <Icon icon="majesticons:users" className="h-6 w-6" />
            Participants ({participants.filter((p) => p.name.trim()).length})
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

        {splitMode !== 'equal' && total > 0 && (
          <div className="mb-3 p-2 bg-yellow/20 border-2 border-black text-sm font-bold">
            {splitMode === 'custom' && participants.filter((p) => p.name.trim()).reduce((s, p) => s + (p.share_amount || 0), 0) !== total && (
              <span className="text-red">⚠️ Custom amounts don't match total!</span>
            )}
            {splitMode === 'shares' && (
              <span>Equal share if equal mode: {formatCurrency(equalShare, currency)} per person</span>
            )}
          </div>
        )}

        <div className="space-y-4">
          {participants.map((participant, index) => {
            const previewShare = splitMode === 'equal' ? equalShare
              : splitMode === 'shares' ? (participant.share_weight ?? 1) / weightsSum * total
              : participant.share_amount ?? 0;
            return (
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
                    maxLength={255}
                    required
                  />
                  <div>
                    <input
                      type="tel"
                      value={participant.phone}
                      onChange={(e) => updateParticipant(index, 'phone', e.target.value)}
                      placeholder="Phone — e.g., 0123456789"
                      className="border-4 border-black px-3 py-2 focus:outline-none focus:bg-yellow w-full"
                    />
                    <p className="text-[10px] text-gray-500 mt-0.5 m-0">Auto-formats to WhatsApp format (6XXXXXXXXXX)</p>
                  </div>
                </div>

                {splitMode !== 'equal' && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    {splitMode === 'custom' ? (
                      <div>
                        <label className="text-xs font-bold uppercase">Share ({sym})</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={participant.share_amount ?? ''}
                          onChange={(e) => updateParticipant(index, 'share_amount', e.target.value)}
                          placeholder="0.00"
                          className="border-2 border-black px-2 py-1 w-full focus:outline-none focus:bg-yellow"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs font-bold uppercase">Shares</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={participant.share_weight ?? 1}
                          onChange={(e) => updateParticipant(index, 'share_weight', e.target.value)}
                          className="border-2 border-black px-2 py-1 w-full focus:outline-none focus:bg-yellow"
                        />
                      </div>
                    )}
                    <div className="flex items-center">
                      <span className="text-xs font-bold uppercase">
                        → {formatCurrency(previewShare, currency)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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
