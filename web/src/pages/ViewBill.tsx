import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icon } from '@iconify/react';
import { BrutalistCard } from '../components/BrutalistCard';
import { BrutalistButton } from '../components/BrutalistButton';
import { ParticipantList } from '../components/ParticipantList';
import { PaymentProgress } from '../components/PaymentProgress';
import { MiniGames } from '../components/MiniGames';
import { ChatSession } from '../components/ChatSession';
import { ChatTranscript } from '../components/ChatTranscript';
import { api } from '../lib/api';
import { formatCurrency, getDaysUntil, getConsequenceMessage, generateShareUrl, copyToClipboard } from '../lib/utils';

export function ViewBill() {
  const { token, id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<string | null>(null);
  const [confirmCode, setConfirmCode] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [waConnected, setWaConnected] = useState(false);
  const [sendingThreats, setSendingThreats] = useState(false);
  const [threatResult, setThreatResult] = useState<{ sent: number; failed: number } | null>(null);
  const [activeChat, setActiveChat] = useState<{ participantId: string; participantName: string } | null>(null);
  const [chatMinimized, setChatMinimized] = useState(false);
  const [showGames, setShowGames] = useState(false);

  const { data: bill, isLoading, error } = useQuery({
    queryKey: ['bill', token || id],
    queryFn: () => token ? api.getBillByToken(token) : api.getBill(id!),
    enabled: !!(token || id),
  });

  const markPaidMutation = useMutation({
    mutationFn: ({ participantId, confirmedBy }: { participantId: string; confirmedBy?: string }) =>
      api.markAsPaid(participantId, confirmedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill'] });
    },
  });

  const markUnpaidMutation = useMutation({
    mutationFn: (participantId: string) => api.markAsUnpaid(participantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill'] });
    },
  });

  const confirmPaymentMutation = useMutation({
    mutationFn: ({ participantId, code }: { participantId: string; code: string }) =>
      api.confirmPayment(participantId, code),
    onSuccess: () => {
      setShowConfirmModal(null);
      setConfirmCode('');
      queryClient.invalidateQueries({ queryKey: ['bill'] });
    },
    onError: (error) => {
      alert(`Invalid code! ${error.message}`);
    },
  });

  const handleTogglePaid = (participantId: string, currentPaid: boolean) => {
    if (currentPaid) {
      markUnpaidMutation.mutate(participantId);
    } else {
      markPaidMutation.mutate({ participantId, confirmedBy: 'organizer' });
    }
  };

  const handleCopyLink = async () => {
    if (bill) {
      const url = generateShareUrl(bill.share_token);
      const success = await copyToClipboard(url);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleWhatsAppShare = () => {
    if (bill) {
      const url = generateShareUrl(bill.share_token);
      const message = `💀 SPLIT OR SIP 💀\n\nYou owe RM${bill.total_amount / bill.participants.length} for "${bill.title}"!\n\nPay up or face the consequences...\n\nView bill: ${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleOpenQR = async () => {
    setShowQRModal(true);
    setQrImage(null);
    setWaConnected(false);
    try {
      await api.startWhatsApp();
      const pollQR = setInterval(async () => {
        try {
          const status = await api.getWhatsAppStatus();
          if (status.connected) {
            setWaConnected(true);
            setQrImage(null);
            clearInterval(pollQR);
            return;
          }
          const qr = await api.getWhatsAppQR();
          if (qr.qr) setQrImage(qr.qr);
          if (qr.connected) {
            setWaConnected(true);
            setQrImage(null);
            clearInterval(pollQR);
          }
        } catch { /* keep polling */ }
      }, 2000);
      setTimeout(() => clearInterval(pollQR), 120000);
    } catch (err: any) {
      alert(err.message);
      setShowQRModal(false);
    }
  };

  const handleSendThreats = async () => {
    if (!bill) return;
    setSendingThreats(true);
    setThreatResult(null);
    try {
      const result = await api.sendWhatsAppThreats(bill.id);
      setThreatResult({ sent: result.sent, failed: result.failed });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSendingThreats(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Icon icon="majesticons:spinner" className="h-16 w-16 animate-spin mx-auto mb-4" />
          <p className="font-heading text-xl uppercase">Loading the consequences...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <BrutalistCard className="max-w-md text-center">
          <Icon icon="majesticons:skull" className="h-20 w-20 mx-auto mb-4 text-red" />
          <h2 className="font-heading text-3xl uppercase mb-4">Bill Not Found</h2>
          <p className="mb-6">This bill has vanished into the void. Or maybe it never existed.</p>
          <BrutalistButton onClick={() => navigate('/')}>Go Home</BrutalistButton>
        </BrutalistCard>
      </div>
    );
  }

  const daysLeft = bill.due_date ? getDaysUntil(bill.due_date) : null;
  const isOverdue = daysLeft !== null && daysLeft < 0;
  const allPaid = bill.stats.unpaid_count === 0 && bill.stats.total_participants > 0;

  return (
    <div className="min-h-screen bg-bg-primary py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 hover:text-black font-bold mb-6 cursor-pointer"
        >
          <Icon icon="majesticons:arrow-left" className="h-5 w-5" />
          Back
        </button>

        {allPaid && (
          <div className="mb-6 border-4 border-green bg-green/20 p-6 text-center shadow-[8px_8px_0px_0px_rgba(0,255,102,1)]">
            <Icon icon="majesticons:party-popper" className="h-16 w-16 mx-auto mb-2" />
            <h2 className="font-heading text-3xl uppercase m-0">Everyone Paid!</h2>
            <p className="font-body mt-2 mb-0">No sipping required. You're all safe... for now. 🎉</p>
          </div>
        )}

        <div className={`border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-6 ${isOverdue ? 'animate-shake border-red' : ''}`}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="font-heading text-3xl md:text-4xl uppercase m-0">{bill.title}</h1>
              <p className="text-gray-600 mt-1">Organized by <span className="font-bold">{bill.organizer_name}</span></p>
            </div>
            <div className="bg-black text-white px-6 py-3 text-center">
              <p className="text-xs uppercase opacity-70 m-0">Total Amount</p>
              <p className="font-heading text-3xl m-0">{formatCurrency(bill.total_amount, bill.currency)}</p>
            </div>
          </div>

          {bill.description && (
            <p className="text-lg mb-6 pb-6 border-b-4 border-black">{bill.description}</p>
          )}

          <PaymentProgress 
            percentage={bill.stats.progress_percentage}
            collected={bill.stats.collected_amount}
            total={bill.total_amount}
            currency={bill.currency}
            className="mb-6"
          />

          {daysLeft !== null && (
            <div className={`text-center py-3 font-bold uppercase ${isOverdue ? 'bg-red text-white animate-pulse' : daysLeft <= 3 ? 'bg-yellow text-black' : 'bg-gray-200'}`}>
              <Icon icon={isOverdue ? 'majesticons:skull' : 'majesticons:clock'} className="inline h-5 w-5 mr-2" />
              {getConsequenceMessage(daysLeft)}
              {!isOverdue && daysLeft >= 0 && ` (${daysLeft} days left)`}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <BrutalistButton 
            variant="outline"
            onClick={handleCopyLink}
            icon={copied ? 'majesticons:check' : 'majesticons:link'}
            className="w-full"
          >
            {copied ? 'Copied!' : 'Copy Share Link'}
          </BrutalistButton>
          
          <BrutalistButton 
            variant="green"
            onClick={handleWhatsAppShare}
            icon="majesticons:whatsapp"
            className="w-full"
          >
            Share on WhatsApp
          </BrutalistButton>
        </div>

        {(bill.bank_name || bill.bank_account || bill.payment_qr_url) && (
          <BrutalistCard icon="majesticons:money" title="Payment Details" className="mb-6 bg-green/10">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {bill.payment_qr_url && (
                <div className="flex-shrink-0 text-center">
                  <div className="border-4 border-black bg-white p-2 inline-block shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img 
                      src={import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}${bill.payment_qr_url}` : bill.payment_qr_url} 
                      alt="Payment QR Code" 
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                  <p className="text-xs font-bold uppercase mt-2 m-0">Scan to Pay</p>
                </div>
              )}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {bill.bank_name && (
                    <div>
                      <p className="text-xs uppercase text-gray-500 m-0">Bank</p>
                      <p className="font-bold text-lg m-0">{bill.bank_name}</p>
                    </div>
                  )}
                  {bill.bank_account && (
                    <div>
                      <p className="text-xs uppercase text-gray-500 m-0">Account</p>
                      <p className="font-bold text-lg m-0">{bill.bank_account}</p>
                    </div>
                  )}
                  {bill.bank_holder && (
                    <div>
                      <p className="text-xs uppercase text-gray-500 m-0">Holder</p>
                      <p className="font-bold text-lg m-0">{bill.bank_holder}</p>
                    </div>
                  )}
                </div>
                {!bill.bank_name && !bill.bank_account && bill.payment_qr_url && (
                  <p className="text-sm text-gray-600 mt-2">Scan the QR code above to make payment.</p>
                )}
              </div>
            </div>
          </BrutalistCard>
        )}

        <BrutalistCard 
          icon="majesticons:skull" 
          title="Threat Center 💀"
          className="mb-6 border-red"
        >
          <p className="mb-4 text-sm">Send personalized death threats (jokes lah 😂) to unpaid members via WhatsApp with bank details included.</p>
          
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {!waConnected ? (
              <BrutalistButton onClick={handleOpenQR} icon="majesticons:qr-code" variant="outline" className="flex-1">
                Connect WhatsApp
              </BrutalistButton>
            ) : (
              <div className="flex items-center gap-2 bg-green/20 border-4 border-black px-4 py-3 font-bold">
                <Icon icon="majesticons:check-circle" className="h-5 w-5 text-green-700" />
                WhatsApp Connected
              </div>
            )}
            
            <BrutalistButton 
              onClick={handleSendThreats}
              disabled={!waConnected || sendingThreats || bill.stats.unpaid_count === 0}
              loading={sendingThreats}
              icon="majesticons:whatsapp"
              variant="red"
              className="flex-1"
            >
              Send Threats ({bill.stats.unpaid_count} unpaid)
            </BrutalistButton>
          </div>

          {threatResult && (
            <div className={`border-4 border-black p-3 text-center font-bold ${threatResult.failed > 0 ? 'bg-yellow' : 'bg-green'}`}>
              {threatResult.sent} threats sent! {threatResult.failed > 0 && `${threatResult.failed} failed.`} 💀
            </div>
          )}

          {bill.stats.unpaid_count === 0 && (
            <p className="text-center text-gray-500 text-sm m-0">Everyone paid! No threats needed. 🎉</p>
          )}
        </BrutalistCard>

        <BrutalistCard 
          icon="majesticons:users" 
          title={`Participants (${bill.stats.paid_count}/${bill.stats.total_participants})`}
        >
<ParticipantList
            participants={bill.participants}
            currency={bill.currency}
            onTogglePaid={handleTogglePaid}
          />
          <div className="mt-4 space-y-2">
            {bill.participants.map((p) => (
              <ChatTranscript
                key={p.id}
                billId={bill.id}
                participantId={p.id}
                participantName={p.name}
              />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t-4 border-dashed border-gray-300">
            <p className="text-xs text-gray-500 mb-2 uppercase font-bold">Chat dengan Dato' Jalal - Pilih ahli untuk settle hutang:</p>
            <div className="flex flex-wrap gap-2">
              {bill.participants.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setActiveChat({ participantId: p.id, participantName: p.name }); setChatMinimized(false); }}
                  className={`border-4 border-black px-3 py-2 text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red hover:text-white transition-colors cursor-pointer flex items-center gap-1 ${p.paid ? 'bg-green text-black' : 'bg-black text-white'}`}
                >
                  <Icon icon="majesticons:chat" className="h-4 w-4" />
                  {p.name}
                  {p.paid && <span className="text-xs opacity-70"> ✅</span>}
                </button>
              ))}
            </div>
          </div>
        </BrutalistCard>

        {isOverdue && bill.stats.unpaid_count > 0 && (
          <BrutalistCard icon="majesticons:game-controller" title="Can't Pay? Play!" className="mb-6 border-yellow">
            <p className="text-sm mb-4">Deadline passed! Unpaid members can try their luck with mini-games for mercy.</p>
            {!showGames ? (
              <BrutalistButton variant="red" onClick={() => setShowGames(true)} className="w-full animate-pulse-brutalist" icon="majesticons:skull">
                Enter The Arena 💀
              </BrutalistButton>
            ) : (
              <MiniGames participantName="Debtor" onClose={() => setShowGames(false)} />
            )}
          </BrutalistCard>
        )}

        {bill.organizer_contact && (
          <div className="mt-6 text-center text-sm text-gray-500">
            <Icon icon="majesticons:phone" className="inline h-4 w-4 mr-1" />
            Organizer contact: {bill.organizer_contact}
          </div>
        )}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black p-6 max-w-sm w-full shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="font-heading text-2xl uppercase mb-4">Confirm Payment</h3>
            <p className="mb-4">Enter your confirmation code to prove you paid:</p>
            <input
              type="text"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              placeholder="Enter code"
              className="w-full border-4 border-black px-4 py-3 mb-4 focus:outline-none focus:bg-yellow"
            />
            <div className="flex gap-3">
              <BrutalistButton 
                variant="green"
                className="flex-1"
                onClick={() => confirmPaymentMutation.mutate({ participantId: showConfirmModal, code: confirmCode })}
                loading={confirmPaymentMutation.isPending}
              >
                Confirm
              </BrutalistButton>
              <BrutalistButton 
                variant="outline"
                className="flex-1"
                onClick={() => { setShowConfirmModal(null); setConfirmCode(''); }}
              >
                Cancel
              </BrutalistButton>
            </div>
          </div>
        </div>
      )}

      {showQRModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black p-6 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] text-center">
            <h3 className="font-heading text-2xl uppercase mb-4">Connect WhatsApp 💀</h3>
            
            {waConnected ? (
              <div>
                <Icon icon="majesticons:check-circle" className="h-20 w-20 mx-auto mb-4 text-green" />
                <p className="font-bold text-xl mb-4">Connected!</p>
                <p className="text-gray-600 mb-4">Ready to send threats to unpaid members.</p>
                <BrutalistButton variant="green" onClick={() => setShowQRModal(false)} className="w-full">
                  Start Threatening
                </BrutalistButton>
              </div>
            ) : qrImage ? (
              <div>
                <p className="mb-4 font-bold">Scan with WhatsApp on your phone:</p>
                <div className="border-4 border-black p-4 inline-block mb-4">
                  <img src={qrImage} alt="WhatsApp QR Code" className="w-64 h-64" />
                </div>
                <p className="text-xs text-gray-500 mb-4">Open WhatsApp → Linked Devices → Link a Device</p>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Icon icon="majesticons:spinner" className="animate-spin h-4 w-4" />
                  Waiting for scan...
                </div>
              </div>
            ) : (
              <div>
                <Icon icon="majesticons:spinner" className="h-16 w-16 animate-spin mx-auto mb-4" />
                <p className="font-bold">Initializing WhatsApp...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            )}

            <button 
              onClick={() => setShowQRModal(false)}
              className="mt-4 text-gray-500 underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {activeChat && bill && !chatMinimized && (
        <ChatSession
          billId={bill.id}
          participantId={activeChat.participantId}
          participantName={activeChat.participantName}
          paymentQrUrl={bill.payment_qr_url}
          onClose={() => setActiveChat(null)}
          onMinimize={() => setChatMinimized(true)}
        />
      )}

      {activeChat && chatMinimized && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
          <button
            onClick={() => { setActiveChat(null); setChatMinimized(false); }}
            className="border-4 border-black bg-black text-white p-3 shadow-[4px_4px_0px_0px_rgba(255,0,51,1)] hover:bg-red transition-all cursor-pointer"
            title="Close chat"
          >
            <Icon icon="majesticons:x" className="h-5 w-5" />
          </button>
          <button
            onClick={() => setChatMinimized(false)}
            className="border-4 border-black bg-red text-white p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all animate-pulse-brutalist cursor-pointer"
          >
            <Icon icon="majesticons:chat" className="h-6 w-6 inline" />
            <span className="ml-2 font-bold uppercase text-sm hidden sm:inline">Dato' Jalal — {activeChat.participantName}</span>
          </button>
        </div>
      )}
    </div>
  );
}
