import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { BrutalistButton } from '../components/BrutalistButton';
import { BrutalistCard } from '../components/BrutalistCard';
import { Footer } from '../components/Footer';

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
  "Bro, serious talk — if you don't pay, Dato' Jalal will make you watch his 3-hour presentation about 'maruah' and 'hutang' while eating YOUR roti canai! 🤌🫓",
  "Dengar sini baik-baik! Kalau lambat bayar, nama anda akan diumumkan di speaker masjid... eh silap, di WhatsApp group! Malu wei! 🕌📢",
  "Ini bukan amaran, ini LAGU sedih. Sedih sebab you belum bayar. Sedih sebab group dah start plan makan tak invite you. Sedih wei... 🥲🫠",
  "Sila jelaskan hutang anda sebelum 12 tengah malam. Lepas tu, kami invoke Bomoh Hutang. Last time dia panggil orang — orang tu bayar ASAP. 👻🔮",
  "Heads up: the unpaid list is now published daily on a billboard near Jalan Alor. Free advertising untuk nama you. Bagus kan? 📺💀",
  "Dato' Jalal ada AI sekarang. Dia tidak pernah tidur, tidak pernah makan (well, dia makan teh tarik je). So technically, you're being watched 24/7. 👀☕",
  "Bekas kekasih, makcik bawang, dan jiran tetangga — semua akan tahu hutang anda kalau lambat bayar. Confidentiality policy: TAKDE. 📢😈",
  "Kalau you rasa ini gurau, sila baca Term & Condition. Oh ya, Term & Condition kami ialah: BAYAR LA WEI. That's it. That's the term. 📜💀",
  "Fun fact: Setiap minit yang you tak bayar, satu bayi magnet makan satu magnet. Bayi tu takde kaitan. Tapi you tetap rasa bersalah kan? 🧲👶",
  "Minggu ni kami bagi DISKAUN 5% kalau bayar awal. Bulan depan, interest 200% dalam bentuk teh tarik. Pilih sekarang, atau pilih lifestyle mamak seumur hidup. ⏰🍵",
  "WARNING: Your 'lupa' sudah expire. Sekarang turn 'sengaja' pula. Lagi sikit boleh 'melampau' dan kena blacklist dari semua group WhatsApp se-Malaysia. 📵🫡",
  "Tahukah anda: KutipCrew ada achievement 'Debt Dodger Supreme' untuk orang yang selalu lari dari bayar. Prize: tidakde kawan, tidakde makan, tidakde maruah. 🏆💀",
  "Plot twist: Duit yang you tak bayar tu sebenarnya boleh buat Dato' Jalal beli rumah. Tapi tak, dia nak duduk makan dengan you. So... bayar la sikit? 🏠🤌",
  "Peringatan mesra: Kawan-kawan kami di ATM sedang menanti anda. Kalau withdraw nampak duit tapi takde dalam rekod kami — that's a sign. Bayar. 🏧🤑",
  "Bayaran lewat = relationship lewat. Choose your fighter: dompet you, atau kawan-kawan you. Spoiler: kawan-kawan menang lagi-lagi bila you kena tinggal masa gathering. 👥💔",
  "KutipCrew telah disahkan oleh 9/10 dentist, 11/10 makcik pasar, dan 13/10 pakcik security. Anda yang ke-10? Jom settle. 🦷🛒🛡️",
  "Heads up! Sekarang ada NEW feature: Auto-public-shame. Bila hutang lebih 7 hari, status WhatsApp anda akan auto bertukar kepada 'Saya berhutang RMXX dan saya malu'. Setuju? Tak agree pun. Terpaksa. 📱😤",
  "Daily reminder: Duit RM10 yang anda pinjam hari tu dah jadi RM15 (teh tarik inflation), RM20 (roti canai), dan RM30 (mee goreng seafood) hari ni. Compound mamak, bro. 📈🍜",
  "Jangan risau, Dato' Jalal bukan angry. Dia cuma sedih. T_T Sebab kawan sendiri tak bayar. Friendship is over, hutang pun tak settle. Both sides menang. 🏆💀",
  "You know what's worse than paying late? Paying NEVER. So sekarang juga, please. Open banking app, type amount, transfer. That's it. That's the post. 🏦🙏",
  "Last warning before Dato' activate 'panggilan hormat' ke mak you. Ye, kami ada contact dia. Ye, kami akan WhatsApp. Ye, dia akan tanya kenapa anak dia macam ni. 📞👩‍👧",
  "Riddle me this: Apa beza kawan baik dengan kawan yang tak bayar hutang? Jawapan: Kawan baik bayar awal, kawan yang tak bayar tu sebenarnya bukan kawan. Mereka pelanggan Dato' Jalal. 🎭🤔",
  "Duit bukan segalanya, tapi hutang boleh rosakkan segalanya. Including your standing dalam group, your reputation kat mamak, dan your chance to be朋友的伴郎 tahun depan. 💔",
  "Sila ambil perhatian: AI kami (Dato' Jalal v3.3) telah belajar dari 10,000 perbualan hutang. Dia tahu semua excuse. 'Lupa', 'bank maintenance', 'esok bayar' — semua dahde database. Tiada excuse tertinggal. 🧠📚",
  "Quick math: Bayar hari ni = 1 group WhatsApp happy. Bayar esok = 1 thread panjang pasal hutang. Bayar minggu depan = 1 thread panjang + 1 screenshot. Bayar takde = 1 billboard. PICK YOUR FATE. 🧮",
  "Walawei, kalau anda baca ni, bermakna anda tengah cari alasan untuk tak bayar. Kami nampak. AI nampak. Dato' nampak. Mamak depan rumah anda nampak. 👁️👁️👁️",
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

        <Footer />
      </div>
    </div>
  );
}
