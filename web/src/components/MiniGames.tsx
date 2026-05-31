import { useState } from 'react';
import { Icon } from '@iconify/react';
import { BrutalistButton } from './BrutalistButton';
import { cn } from '../lib/utils';

const ROULETTE_CONSEQUENCES = [
  "🫗 You must buy everyone teh tarik next session!",
  "🎤 Sing 'Rasa Sayang' in the group voice call!",
  "📸 Post an embarrassing selfie and tag the organizer!",
  "🍛 You're buying nasi kandar for the whole table next time!",
  "💃 Do a TikTok dance and send it to the group!",
  "🧹 You're on cleanup duty for the next gathering!",
  "📱 Change your WhatsApp status to 'I OWE MONEY' for 24 hours!",
  "🎭 Act as the group's personal waiter for one meal!",
];

const RPS_CHOICES = ['rock', 'paper', 'scissors'] as const;
const RPS_ICONS: Record<string, string> = { rock: 'majesticons:fist', paper: 'majesticons:hand-open', scissors: 'majesticons:scissors' };
const RPS_EMOJIS: Record<string, string> = { rock: '🪨', paper: '📄', scissors: '✂️' };

const DICE_CONSEQUENCES = [
  { min: 1, max: 2, text: "CRITICAL FAIL! 💀 You owe DOUBLE the amount (just kidding... unless?)" },
  { min: 3, max: 4, text: "Bad luck! 😢 Buy the organizer a drink as apology." },
  { min: 5, max: 6, text: "Mediocre. 😐 You survive... but the shame remains." },
  { min: 7, max: 9, text: "Not bad! 😏 Small mercy granted. Pay when you can." },
  { min: 10, max: 12, text: "LUCKY! 🎉 Dato' Jalal bagi you 24 jam lagi! Rezeki! 🤲" },
];

type GameType = 'roulette' | 'rps' | 'dice' | null;

interface MiniGamesProps {
  participantName: string;
  onClose?: () => void;
}

export function MiniGames({ participantName, onClose }: MiniGamesProps) {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [result, setResult] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const resetGame = () => {
    setActiveGame(null);
    setResult(null);
    setSpinning(false);
  };

  return (
    <div className="border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {!activeGame && (
        <>
          <div className="text-center mb-6">
            <Icon icon="majesticons:game-controller" className="h-12 w-12 mx-auto mb-2 text-red" />
            <h3 className="font-heading text-2xl uppercase m-0">Can't Pay? Play!</h3>
            <p className="text-sm text-gray-600 mt-1">Choose your fate, {participantName}...</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveGame('roulette')}
              className="border-4 border-black p-4 bg-red/10 hover:bg-red hover:text-white transition-all cursor-pointer group"
            >
              <Icon icon="majesticons:target" className="h-10 w-10 mx-auto mb-2 group-hover:text-white" />
              <p className="font-heading text-lg uppercase m-0">Russian Roulette</p>
              <p className="text-xs mt-1 m-0 opacity-70">Spin the wheel of doom</p>
            </button>

            <button
              onClick={() => setActiveGame('rps')}
              className="border-4 border-black p-4 bg-yellow/20 hover:bg-yellow transition-all cursor-pointer group"
            >
              <Icon icon="majesticons:fist" className="h-10 w-10 mx-auto mb-2" />
              <p className="font-heading text-lg uppercase m-0">Batu Gunting Kertas</p>
              <p className="text-xs mt-1 m-0 opacity-70">Kalahkan Dato' Jalal</p>
            </button>

            <button
              onClick={() => setActiveGame('dice')}
              className="border-4 border-black p-4 bg-cyan/10 hover:bg-cyan transition-all cursor-pointer group"
            >
              <Icon icon="majesticons:dice-d6" className="h-10 w-10 mx-auto mb-2" />
              <p className="font-heading text-lg uppercase m-0">Debt Dice</p>
              <p className="text-xs mt-1 m-0 opacity-70">Roll for mercy</p>
            </button>
          </div>

          {onClose && (
            <button onClick={onClose} className="mt-4 w-full text-center text-sm text-gray-500 underline cursor-pointer">
              Close games
            </button>
          )}
        </>
      )}

      {activeGame === 'roulette' && (
        <div className="text-center">
          <h3 className="font-heading text-2xl uppercase mb-4">🔫 Russian Roulette</h3>
          <p className="mb-4 text-sm">6 chambers. 1 consequence. Spin if you dare.</p>

          {!result ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={cn(
                    "w-10 h-10 border-4 border-black flex items-center justify-center font-bold text-lg",
                    spinning ? "animate-pulse bg-gray-200" : "bg-white"
                  )}>
                    {spinning ? '?' : i}
                  </div>
                ))}
              </div>
              <BrutalistButton
                variant="red"
                onClick={() => {
                  setSpinning(true);
                  setTimeout(() => {
                    const consequence = ROULETTE_CONSEQUENCES[Math.floor(Math.random() * ROULETTE_CONSEQUENCES.length)];
                    setResult(consequence);
                    setSpinning(false);
                  }, 1500);
                }}
                disabled={spinning}
                className="w-full animate-pulse-brutalist"
              >
                {spinning ? 'SPINNING...' : 'PULL THE TRIGGER 🔫'}
              </BrutalistButton>
            </div>
          ) : (
            <div className="border-4 border-black bg-red/10 p-6 animate-shake">
              <Icon icon="majesticons:skull" className="h-16 w-16 mx-auto mb-3 text-red" />
              <p className="font-heading text-xl uppercase mb-2">Your Fate:</p>
              <p className="font-body text-lg">{result}</p>
              <BrutalistButton variant="outline" onClick={resetGame} className="mt-4">
                Try Another Game
              </BrutalistButton>
            </div>
          )}
        </div>
      )}

      {activeGame === 'rps' && (
        <div className="text-center">
          <h3 className="font-heading text-2xl uppercase mb-4">✊✋✌️ Batu Gunting Kertas</h3>
          <p className="mb-4 text-sm">Kalahkan Dato' Jalal untuk dapat mercy!</p>

          {!result ? (
            <div className="flex justify-center gap-4">
              {RPS_CHOICES.map((choice) => (
                <button
                  key={choice}
                  onClick={() => {
                    const botChoice = RPS_CHOICES[Math.floor(Math.random() * 3)];
                    let outcome: string;
                    if (choice === botChoice) {
                      outcome = `DRAW! 🤝 Both chose ${RPS_EMOJIS[choice]}. No mercy, no punishment. Try again!`;
                    } else if (
                      (choice === 'rock' && botChoice === 'scissors') ||
                      (choice === 'paper' && botChoice === 'rock') ||
                      (choice === 'scissors' && botChoice === 'paper')
                    ) {
                      outcome = `YOU WIN! 🎉 ${RPS_EMOJIS[choice]} beats ${RPS_EMOJIS[botChoice]}! Dato' Jalal bagi you 24 jam lagi! Rezeki! 🤲`;
                    } else {
                      outcome = `YOU LOSE! 💀 ${RPS_EMOJIS[botChoice]} beats ${RPS_EMOJIS[choice]}! Dato' Jalal cakap: "Belanja aku roti canai sebagai tribute!" 🫓`;
                    }
                    setResult(outcome);
                  }}
                  className="border-4 border-black p-6 bg-white hover:bg-yellow transition-all cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                >
                  <Icon icon={RPS_ICONS[choice]} className="h-12 w-12 mx-auto mb-2" />
                  <p className="font-heading text-sm uppercase m-0">{choice}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="border-4 border-black bg-yellow/10 p-6">
              <p className="font-body text-lg mb-4">{result}</p>
              <BrutalistButton variant="outline" onClick={resetGame}>
                Play Again
              </BrutalistButton>
            </div>
          )}
        </div>
      )}

      {activeGame === 'dice' && (
        <div className="text-center">
          <h3 className="font-heading text-2xl uppercase mb-4">🎲 Debt Dice</h3>
          <p className="mb-4 text-sm">Roll 2 dice. Higher roll = more mercy from The Crew.</p>

          {!result ? (
            <div className="space-y-4">
              <div className="flex justify-center gap-4">
                <div className={cn("w-20 h-20 border-4 border-black flex items-center justify-center text-4xl font-bold bg-white", spinning && "animate-spin")}>
                  {spinning ? '🎲' : '?'}
                </div>
                <div className={cn("w-20 h-20 border-4 border-black flex items-center justify-center text-4xl font-bold bg-white", spinning && "animate-spin")}>
                  {spinning ? '🎲' : '?'}
                </div>
              </div>
              <BrutalistButton
                variant="green"
                onClick={() => {
                  setSpinning(true);
                  setTimeout(() => {
                    const d1 = Math.floor(Math.random() * 6) + 1;
                    const d2 = Math.floor(Math.random() * 6) + 1;
                    const total = d1 + d2;
                    const consequence = DICE_CONSEQUENCES.find((c) => total >= c.min && total <= c.max) || DICE_CONSEQUENCES[2];
                    setResult(`You rolled ${d1} + ${d2} = ${total}!\n\n${consequence.text}`);
                    setSpinning(false);
                  }, 1200);
                }}
                disabled={spinning}
                className="w-full"
              >
                {spinning ? 'ROLLING...' : 'ROLL THE DICE 🎲'}
              </BrutalistButton>
            </div>
          ) : (
            <div className="border-4 border-black bg-cyan/10 p-6">
              <p className="font-body text-lg mb-4 whitespace-pre-line">{result}</p>
              <BrutalistButton variant="outline" onClick={resetGame}>
                Roll Again
              </BrutalistButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
