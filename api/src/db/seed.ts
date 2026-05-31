import { db } from './client';

const DEMO_CHATS: Record<string, Array<{ role: string; content: string }>> = {
  // === PAID PARTICIPANTS — complete conversations with Dato' Jalal ===
  budi: [
    { role: 'user', content: "Eh Dato' Jalal! I'm Budi." },
    { role: 'assistant', content: "Budi! RM49 untuk Friday Malam Makan Session. Bila nak settle? Dato' dah tunggu dari lepas Maghrib ni. ☕" },
    { role: 'user', content: "Dah bayar dah Dato'! Transfer dah pergi ke Maybank." },
    { role: 'assistant', content: "Wah betul ke? Hantar resit screenshot biar Dato' verify dulu. 📸" },
    { role: 'user', content: "Nih resitnya. Dah bank in ke akaun Maybank 16234567890." },
    { role: 'assistant', content: "Hmm nampak legit. Okay Budi, Dato' tanda kau PAID. Selamat! Jangan lupa bayar next round eh? 😏💀" },
  ],
  farid: [
    { role: 'user', content: "Yo Dato' Jalal! Farid sini." },
    { role: 'assistant', content: "Fariddddd! Kau dah bayar ke belum untuk RM49 makan-makan? Dato' check buku besar, nama kau ada kat list orang baik. 😏" },
    { role: 'user', content: "Dah lama bayar Dato'! Semalam gak. Transfer Touch n Go." },
    { role: 'assistant', content: "Betul ke? Alamak, Dato' memang tak perasan. Biar Dato' check balik... 🤔" },
    { role: 'user', content: "Confirm dah Dato'. Resit ada dalam gallery. Upload skrg." },
    { role: 'assistant', content: "Mampus Dato' lupa tandakan! Ok Farid, Dato' minta maaf. Dah PAID dah ni. You memang legenda! 🎉🤌" },
  ],
  amir: [
    { role: 'user', content: "Assalamualaikum Dato' Jalal. Amir here." },
    { role: 'assistant', content: "Waalaikumsalam! Amir, RM30 untuk badminton court. You main badminton you kena bayar. Fair kan? 🤣🏸" },
    { role: 'user', content: "Haha betul Dato'. Dah bayar dah. Transfer Touch n Go semalam." },
    { role: 'assistant', content: "TnG? Power. Dato' suka orang guna e-wallet. Dah masuk record ni. ✅" },
    { role: 'user', content: "Confirm dah. Boleh check dari pihak Dato'." },
    { role: 'assistant', content: "Confirm Dato' dah check. You PAID. Next week main badminton lagi? Kang Dato' join ah! 😂🏸" },
  ],
  jason: [
    { role: 'user', content: "Jason here. Aku dah bayar ke belum ehh? 😅" },
    { role: 'assistant', content: "Jason weii. Kau tanya Dato' ke kau tanya diri sendiri? Haha okay Dato' check buku besar... Alamak, you DAH BAYAR rupanya dah 2 hari lepas! Dato' lupa update. Sorry sorry! 🤦‍♂️" },
    { role: 'user', content: "Hahaha dah la Dato'. Tu la, baik check dulu before cakap orang tak bayar." },
    { role: 'assistant', content: "Dato' malu kat mamak ni. Ok confirmed PAID. Teh tarik Dato' belanja next session! 😂☕" },
  ],

  // === UNPAID PARTICIPANTS — conversations in progress ===
  chongwei: [
    { role: 'user', content: "Chong Wei sini. Ada hutang ye?" },
    { role: 'assistant', content: "Chong Wei! RM49 untuk Friday Malam Makan. You order nasi kandar goreng telur mata hebat, sekarang kena bayar. Bila nak settle nih? 🍛💀" },
    { role: 'user', content: "Nanti gaji masuk hujung minggu ni. Sabar Dato'." },
    { role: 'assistant', content: "Sabar? Dato' ni dah bersabar dari zaman dial-up internet! Tapi ok lah Dato' bagi tempoh sampai hujung minggu. Tapi kalau lewat... Dato' hantar anak buah pergi ronda rumah you ah! 😈" },
  ],
  devi: [
    { role: 'user', content: "Hi Dato' Jalal! Sorry lambat reply." },
    { role: 'assistant', content: "Devi! Dato' dah tunggu lama ni. RM49 je pun. Kau pergi Sephora belanja beratus ringgit tapi hutang Dato' tak bayar-bayar? 😤💄" },
    { role: 'user', content: "Hahaha Dato' tau je. Ok ok nanti petang Dato' transfer." },
    { role: 'assistant', content: "Petang ni Dato' tunggu. Kalau tak masuk pukul 6, Dato' WhatsApp mak kau! 📱👩‍👧‍👦" },
  ],
  siti: [
    { role: 'user', content: "Assalamualaikum Dato'. Siti." },
    { role: 'assistant', content: "Waalaikumsalam Siti. RM49 untuk makan kat Pelita. Kenapa belum bayar lagi ni? Siti kan orang baik, jangan buat Dato' terpaksa ambil tindakan. 😌💀" },
    { role: 'user', content: "Maaf Dato'! Lupa. Nanti malam transfer." },
    { role: 'assistant', content: "Ok Dato' percaya. Tapi kalau tipu... Dato' tahu rumah you kat mana tau. Kang Dato' datang bawak nasi kandar... dan resit hutang! 😂🏠" },
  ],
  kamal: [
    { role: 'user', content: "Yo Dato'! Kamal sini. Pasal badminton bill tu..." },
    { role: 'assistant', content: "Kamallll! RM30 untuk badminton dah lama OVERDUE tau. Dato' dah start panas sikit ni. 🔥🏸" },
    { role: 'user', content: "Sabar Dato'! Aku transfer petang ni. Janji." },
    { role: 'assistant', content: "Janji? Janji Dato' dengan mak Dato' pun kadang tak jadi. Ok Dato' bagi chance last. Petang ni jugak atau Dato' naikkan interest jadi 1 roti canai! 😤🫓" },
  ],
  weijie: [
    { role: 'user', content: "Dato' jangan marah dulu. Wei Jie sini." },
    { role: 'assistant', content: "WEI JIE! You memang tahu Dato' tunggu you berapa lama? RM30 untuk badminton dah lewat sehari! You ingat Dato' ni apa? Bank? 🤬💰" },
    { role: 'user', content: "Haha sorry Dato'. Gaji delay." },
    { role: 'assistant', content: "Delay? Dato' punya hutang tak pernah delay! Ok dengar sini. Dato' bagi tempoh 24 jam. Lepas tu... you main Russian Roulette dengan Dato'. Siapa kalah bayang gaji? 🔫😈" },
  ],
  aiman: [
    { role: 'user', content: "Hey Dato'. Aiman." },
    { role: 'assistant', content: "Aiman! RM49.67 untuk WiFi bulan ni. You nak internet laju ke nak kena disconnect? Bayar cepat! 🌐💀" },
    { role: 'user', content: "Nanti Dato'. Tunggu roommate bayar dulu." },
    { role: 'assistant', content: "Roommate? Dato' nak roomate punya number jugak. Dato' collect from everyone! 😂 Kalau tak bayar, Dato' suruh Unifi cutoff! Hahaha... (tapi seriously bayar ah)" },
  ],
  haziq: [
    { role: 'user', content: "Wassup Dato' Jalal!" },
    { role: 'assistant', content: "Haziq! Jangan wassup-wassup kat Dato'. RM49.67 untuk WiFi. You streaming movie every night, internet tak putus. Tapi duit WiFi you tak bayar lagi. Hypocrite! 🎬💀" },
    { role: 'user', content: "Haha okay okay. Transfer skrg." },
    { role: 'assistant', content: "Skrg? Bagus! Dato' suka orang decisive. Dah transfer? Hantar resit screenshot sini biar Dato' confirm. 📸✅" },
  ],
  yusuf: [
    { role: 'user', content: "Dato'. Yusuf here. Ada hutang WiFi kan?" },
    { role: 'assistant', content: "Yusuf! Baru first message dah TANYA Dato'? Of course ada hutang! RM49.67. Bayar sebelum maghrib kang Dato' naikkan jadi RM69.67. Dato' bukannya kedai runcit! 😤💰" },
    { role: 'user', content: "Okay mengalah. Dato' punya pasal." },
    { role: 'assistant', content: "Ni baru betul! Dato' respect orang yang sedar diri. Jangan buat Dato' marah tau nanti Dato' pakai power disconnect WiFi dari jauh! 🔌😈" },
  ],
};

async function seedDemo() {
  console.log('🎭 Seeding demo data for KutipCrew...');

  await db.query('DELETE FROM payment_confirmations');
  await db.query('DELETE FROM participants');
  await db.query('DELETE FROM bills');

  const bills = [
    {
      title: 'Friday Malam Makan Session',
      description: 'Nasi kandar + teh tarik + roti canai feast at Pelita SS1! Everyone ate like kings — now pay up before Dato\' Jalal sends the mamak squad to your house!',
      total_amount: 245.00,
      organizer_name: 'Ahmad',
      organizer_contact: '60123456789',
      bank_name: 'Maybank',
      bank_account: '16234567890',
      bank_holder: 'Ahmad bin Ismail',
      due_date: new Date(Date.now() + 3 * 86400000).toISOString(),
      share_token: 'demo-makan-01',
      participants: [
        { name: 'Budi', phone: '60123456789', paid: true, chatKey: 'budi' },
        { name: 'Chong Wei', phone: '60169876543', paid: false, chatKey: 'chongwei' },
        { name: 'Devi', phone: '60112233445', paid: false, chatKey: 'devi' },
        { name: 'Farid', phone: '60135556667', paid: true, chatKey: 'farid' },
        { name: 'Siti', phone: '60178889990', paid: false, chatKey: 'siti' },
      ],
    },
    {
      title: 'Badminton Court Booking',
      description: 'Weekly badminton session at Arena Cyberjaya. Court fee + shuttlecocks. Already settled by Amir & Jason — the rest better follow!',
      total_amount: 120.00,
      organizer_name: 'Raj',
      organizer_contact: '60198765432',
      bank_name: 'CIMB',
      bank_account: '76234567890',
      bank_holder: 'Rajesh Kumar',
      due_date: new Date(Date.now() - 1 * 86400000).toISOString(),
      share_token: 'demo-badminton-02',
      participants: [
        { name: 'Amir', phone: '60121112222', paid: true, chatKey: 'amir' },
        { name: 'Jason', phone: '60163334444', paid: true, chatKey: 'jason' },
        { name: 'Kamal', phone: '60135556666', paid: false, chatKey: 'kamal' },
        { name: 'Wei Jie', phone: '60177778888', paid: false, chatKey: 'weijie' },
      ],
    },
    {
      title: 'House WiFi Bill - June',
      description: 'Unifi 300Mbps monthly bill. Jangan buat bodoh bayar lambat — internet putus everybody marah!',
      total_amount: 149.00,
      organizer_name: 'Nurul',
      organizer_contact: '60145678901',
      bank_name: 'Touch n Go eWallet',
      bank_account: '0145678901',
      bank_holder: 'Nurul Aisyah',
      due_date: new Date(Date.now() + 7 * 86400000).toISOString(),
      share_token: 'demo-wifi-03',
      participants: [
        { name: 'Aiman', phone: '60141234567', paid: false, chatKey: 'aiman' },
        { name: 'Haziq', phone: '60149876543', paid: false, chatKey: 'haziq' },
        { name: 'Yusuf', phone: '60145556667', paid: false, chatKey: 'yusuf' },
      ],
    },
  ];

  for (const billData of bills) {
    const shareAmount = parseFloat((billData.total_amount / billData.participants.length).toFixed(2));

    const result = await db.query(`
      INSERT INTO bills (title, description, total_amount, currency, organizer_name, organizer_contact, bank_name, bank_account, bank_holder, due_date, share_token)
      VALUES ($1, $2, $3, 'MYR', $4, $5, $6, $7, $8, $9, $10)
      RETURNING id
    `, [
      billData.title,
      billData.description,
      billData.total_amount,
      billData.organizer_name,
      billData.organizer_contact,
      billData.bank_name,
      billData.bank_account,
      billData.bank_holder,
      billData.due_date,
      billData.share_token,
    ]);

    const billId = result.rows[0].id;

    for (const p of billData.participants) {
      const paidAt = p.paid ? new Date(Date.now() - 2 * 86400000).toISOString() : null;
      const participantResult = await db.query(`
        INSERT INTO participants (bill_id, name, phone, share_amount, paid, paid_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [billId, p.name, p.phone, shareAmount, p.paid, paidAt]);

      const participantId = participantResult.rows[0].id;

      if (p.chatKey && DEMO_CHATS[p.chatKey]) {
        const chat = DEMO_CHATS[p.chatKey];
        for (const msg of chat) {
          await db.query(`
            INSERT INTO chat_history (bill_id, participant_id, role, content)
            VALUES ($1, $2, $3, $4)
          `, [billId, participantId, msg.role, msg.content]);
        }
        const paidAt = p.paid ? new Date(Date.now() - 2 * 86400000).toISOString() : null;

        if (p.paid) {
          await db.query(`
            INSERT INTO payment_confirmations (participant_id, confirmed_by, notes)
            VALUES ($1, $2, $3)
          `, [
            participantId,
            'Dato Jalal',
            JSON.stringify({ completedChats: chat.length, completedAt: paidAt }),
          ]);
        }
      }
    }
  }

  console.log('✅ Demo data seeded successfully!');
  console.log('');
  console.log('📋 DEMO BILLS:');
  console.log('');
  console.log('  1️⃣  Friday Malam Makan Session');
  console.log('     → http://localhost:5174/bill/demo-makan-01');
  console.log('     → Budi ✅ (with chat history), Farid ✅ (chat history), Chong Wei ❌, Devi ❌, Siti ❌');
  console.log('     → Chat session includes: greetings → payment flow → receipt verification → Dato marks as paid');
  console.log('');
  console.log('  2️⃣  Badminton Court Booking (OVERDUE)');
  console.log('     → http://localhost:5174/bill/demo-badminton-02');
  console.log('     → Amir ✅ (chat history), Jason ✅ (chat history), Kamal ❌, Wei Jie ❌');
  console.log('     → Mini-games unlocked! Kamal & Wei Jie can play Russian Roulette/RPS/Debt Dice');
  console.log('     → Chat Dato\' Jalal for payment guidance with QR scan support');
  console.log('');
  console.log('  3️⃣  House WiFi Bill - June');
  console.log('     → http://localhost:5174/bill/demo-wifi-03');
  console.log('     → All unpaid — Aiman ❌, Haziq ❌, Yusuf ❌');
  console.log('     → Fresh bill, no one paid yet. Perfect for testing full flow.');
  console.log('');
  console.log('💡 HOW TO TEST:');
  console.log('  1. Click any bill link above');
  console.log('  2. Click a participant name → Chat with Dato\' Jalal');
  console.log('  3. Say "dah bayar" → auto requests receipt screenshot');
  console.log('  4. Click 📷 → upload any image → Receipt Inspector verifies');
  console.log('  5. Dato\' Jalal auto-marks as PAID!');
  console.log('  6. Send threats via WhatsApp (requires QR scan)');
  console.log('');
  console.log('💀 The Crew is ready. KutipCheng! 🔫💰');

  process.exit(0);
}

seedDemo().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});