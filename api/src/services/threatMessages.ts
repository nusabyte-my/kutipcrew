const THREATS = [
  "💀 {name}, your unpaid debt has been reported to the Council of Makan Elders. They are NOT amused.",
  "⚰️ HEY {name}! Your wallet called. It said you're BROKE. Pay up before we send the ghost of nasi lemak past to haunt your dreams!",
  "🔪 {name}, this is your FINAL WARNING. The consequences meter is at CRITICAL LEVELS. Your friends have already bought your tombstone (it says 'Here lies {name}, too cheap to pay RM{amount}')",
  "☠️ BREAKING NEWS: Local person named {name} refuses to pay RM{amount}. Authorities have been notified. Your mother has been contacted. YOUR CAT KNOWS.",
  "💣 {name}, the bomb squad has been dispatched to your location. The bomb is your UNPAID BILL. Defuse it by paying RM{amount} IMMEDIATELY.",
  "🪦 R.I.P. {name}'s social life. Cause of death: refusing to pay RM{amount} for {bill}. Funeral arrangements pending.",
  "👻 {name}, I am the ghost of payments past. I will haunt your WhatsApp, your dreams, and your bank account until you pay RM{amount}. THIS IS NOT A DRILL.",
  "🎯 WANTED: {name}. Crime: Stealing RM{amount} from friends' wallets by not paying their share. Last seen: pretending to be asleep. Reward: RM{amount} (the amount you owe lol)",
  "🚨 EMERGENCY ALERT: {name} has triggered the CONSEQUENCES PROTOCOL. All unpaid debts must be settled within 24 hours or face ETERNAL SHAME. Amount due: RM{amount}",
  "🐊 {name}, a crocodile has been released in your direction. It's hungry and it smells UNPAID BILLS. Pay RM{amount} to call it off. We're not joking. (We are joking. But PAY.)",
  "⚡ {name}, Zeus himself has demanded your payment of RM{amount}. Even the GODS think you're being cheap. Don't make lightning strike twice.",
  "🧟 {name}, the zombie apocalypse has started and guess who's first on the menu? That's right — people who don't pay their bills. RM{amount} could save your life.",
];

const PAID_COMPLIMENTS = [
  "🎉 {name} has PAID! Legend. Hero. Icon. The rest of you should be ASHAMED.",
  "✅ {name} just paid RM{amount}. Unlike SOME people (*cough* {unpaid_names} *cough*). Be more like {name}.",
  "🏆 GOLD MEDAL goes to {name} for actually paying RM{amount}! Meanwhile {unpaid_count} others are still living in DENIAL.",
];

export function getThreatMessage(params: {
  name: string;
  amount: number;
  bill: string;
  currency?: string;
}): string {
  const index = Math.floor(Math.random() * THREATS.length);
  return THREATS[index]
    .replace(/{name}/g, params.name)
    .replace(/{amount}/g, params.amount.toFixed(2))
    .replace(/{bill}/g, params.bill);
}

export function getPaidCompliment(params: {
  name: string;
  amount: number;
  unpaidNames: string[];
  unpaidCount: number;
}): string {
  const index = Math.floor(Math.random() * PAID_COMPLIMENTS.length);
  return PAID_COMPLIMENTS[index]
    .replace(/{name}/g, params.name)
    .replace(/{amount}/g, params.amount.toFixed(2))
    .replace(/{unpaid_names}/g, params.unpaidNames.join(', ') || 'nobody')
    .replace(/{unpaid_count}/g, String(params.unpaidCount));
}

export function buildPaymentMessage(params: {
  participantName: string;
  organizerName: string;
  billTitle: string;
  amount: number;
  currency: string;
  bankName?: string;
  bankAccount?: string;
  bankHolder?: string;
  shareUrl: string;
  dueDate?: string;
}): string {
  const threat = getThreatMessage({
    name: params.participantName,
    amount: params.amount,
    bill: params.billTitle,
    currency: params.currency,
  });

  let msg = `${threat}\n\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📋 *${params.billTitle}*\n`;
  msg += `💰 You owe: *RM${params.amount.toFixed(2)}*\n`;
  msg += `👤 Organizer: ${params.organizerName}\n`;

  if (params.dueDate) {
    const daysLeft = Math.ceil((new Date(params.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    msg += `⏰ Due: ${daysLeft > 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days OVERDUE 💀`}\n`;
  }

  if (params.bankName && params.bankAccount) {
    msg += `\n🏦 *PAYMENT DETAILS:*\n`;
    msg += `Bank: ${params.bankName}\n`;
    msg += `Account: ${params.bankAccount}\n`;
    if (params.bankHolder) msg += `Name: ${params.bankHolder}\n`;
  }

  msg += `\n🔗 View bill: ${params.shareUrl}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `_KutipCrew never forgets. Pay up!_ 💀🔫`;

  return msg;
}
