import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { BrutalistButton } from '../components/BrutalistButton';
import { BrutalistCard } from '../components/BrutalistCard';

const WARNINGS = [
  "Unpaid bills will result in EXTREME CONSEQUENCES. Dato' Jalal will personally visit your dreams carrying extra-pedasy nasi lemak as a final warning! 🔥",
  "Siapa tak bayar, jangan harap boleh tidur lena! Dato' Jalal akan hantar anak buah dia pergi ronda rumah kau sambil bawak resit hutang! 😱",
  "Eh bro, lu tak bayar ah? Lu mau kena 'special treatment' ka? The Crew sudah pasang CCTV di hati lu. Pay up or face the teh tarik of DOOM! ☕💀",
  "WARNING: Our debt collectors are trained in advanced guilt-tripping, passive-aggressive WhatsApp messages, and showing up at your mamak session uninvited.",
  "Peringatan keras! Hutang yang tidak dibayar akan dilaporkan kepada Majlis Tetua Makan-Makan. Anda mungkin diharamkan dari semua kenduri selama-lamanya! 😱",
  "Walao eh, you think KutipCrew main-main ah? We got AI mafia boss that never sleep! He will WhatsApp you at 3AM with pantang about unpaid debts! 🌙💀",
  "By using KutipCrew, you acknowledge that unpaid members may be subjected to: dramatic sighs, disappointed head shakes, and being tagged in group chats indefinitely.",
  "Amaran! Sesiapa yang berhutang dan enggan membayar akan dikenakan tindakan: dipaksa belanja satu meja, dilarang order air sendiri, dan dikutuk sampai kiamat! 💸",
  "You owe money but act like nothing happen? Alamak, Dato' Jalal sudah buka fail ni lah! Next step: hantar pakcik-pakcik mamak pergi ronda rumah you! 👻📱",
  "The consequences meter is REAL. When it hits 100%, a mysterious uncle will appear at your doorstep holding a calculator and a plate of nasi kandar.",
  "Don't play play ah! Last time one guy didn't pay RM15, now he still owe us PLUS interest in teh tarik. Compound interest, bro. COMPOUND. 📈☕",
  "KutipCrew tidak pernah lupa. Kami ada senarai nama, nombor telefon, dan menu kegemaran anda. Bayar hutang atau kami order makanan paling mahal atas nama anda! 🍛💀",
  "Eh, you know what happens when the deadline pass? Nothing... at first. Then suddenly your friends start 'forgetting' to invite you to makan. Coincidence? I THINK NOT! 😈",
  "LEGAL DISCLAIMER (not really): KutipCrew reserves the right to send increasingly dramatic messages, deploy emoji warfare, and compose diss tracks about chronic non-payers.",
  "Bro, serious talk — if you don't pay, Don Salvatore will make you watch his 3-hour monologue about 'respect' and 'family values' while eating YOUR roti canai! 🤌🫓",
  "Dengar sini baik-baik! Kalau lambat bayar, nama anda akan diumumkan di speaker masjid... eh silap, di WhatsApp group! Malu wei! 🕌📢",
];

export function Home() {
  const navigate = useNavigate();
  const [warningIndex, setWarningIndex] = useState(() => Math.floor(Math.random() * WARNINGS.length));
  const [animating, setAnimating] = useState(false);

  const shuffleWarning = useCallback(() => {
    setAnimating(true);
    setTimeout(() => {
      setWarningIndex((prev) => {
        let next = Math.floor(Math.random() * WARNINGS.length);
        while (next === prev && WARNINGS.length > 1) next = Math.floor(Math.random() * WARNINGS.length);
        return next;
      });
      setAnimating(false);
    }, 400);
  }, []);

  useEffect(() => {
    const interval = setInterval(shuffleWarning, 60000);
    return () => clearInterval(interval);
  }, [shuffleWarning]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <div className="inline-block border-4 border-black bg-yellow px-6 py-2 mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] -rotate-2">
            <span className="font-heading text-2xl uppercase">KutipCrew Assembles!</span>
          </div>

          <div className="inline-block border-4 border-black bg-red px-4 py-1 mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-1">
            <span className="font-accent text-lg">The Debt Collection Squad</span>
          </div>
          <h1 className="font-heading text-6xl md:text-8xl uppercase mb-6 leading-none">
            Kutip<span className="text-red">Crew</span>
          </h1>

          <p className="font-body text-xl md:text-2xl max-w-2xl mx-auto mb-8">
            The brutalist bill splitter that makes collecting money
            <span className="bg-black text-white px-2 mx-1">dramatic</span>,
            <span className="bg-red text-white px-2 mx-1">fun</span>, and
            <span className="bg-green text-black px-2 mx-1">effective</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <BrutalistButton
              onClick={() => navigate('/create')}
              className="text-xl px-8 py-4 animate-pulse-brutalist"
              icon="majesticons:plus-circle"
            >
              Create a Bill
            </BrutalistButton>

            <BrutalistButton
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="text-xl px-8 py-4"
              icon="majesticons:clipboard-list"
            >
              View Dashboard
            </BrutalistButton>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <BrutalistCard icon="majesticons:pencil" title="Create">
            <p className="m-0">Set up your bill with participants, amounts, and deadlines. The hunt begins.</p>
          </BrutalistCard>

          <BrutalistCard icon="majesticons:share" title="Share">
            <p className="m-0">Send the link via WhatsApp. Everyone sees what they owe. No excuses.</p>
          </BrutalistCard>

          <BrutalistCard icon="majesticons:money" title="Collect">
            <p className="m-0">Track who paid, who didn't. Watch the consequences meter fill up.</p>
          </BrutalistCard>
        </div>

        <div className="border-4 border-black bg-black text-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(255,0,51,1)] relative overflow-hidden min-h-[220px] flex flex-col justify-center">
          <Icon icon="majesticons:skull" className="h-16 w-16 mx-auto mb-4 text-red" />
          <h2 className="font-heading text-3xl uppercase mb-4 text-red">KutipCrew Warning</h2>
          <p className={`font-body text-lg mb-4 transition-all duration-500 ${animating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {WARNINGS[warningIndex]}
          </p>
          <button
            onClick={shuffleWarning}
            className="text-xs text-gray-400 hover:text-yellow underline cursor-pointer font-body uppercase tracking-wider mt-auto"
          >
            <Icon icon="majesticons:refresh" className="inline h-3 w-3 mr-1" />
            Spin the wheel of consequences
          </button>
        </div>

        <div className="mt-16 text-center">
          <p className="font-accent text-gray-500">
            KutipCrew — We collect so you don't have to chase 💀
          </p>
        </div>
      </div>
    </div>
  );
}
