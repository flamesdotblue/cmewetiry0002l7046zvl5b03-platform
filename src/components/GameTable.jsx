import Hand from './Hand.jsx';
import { handValue, isBlackjack } from '../utils/blackjack.js';

export default function GameTable({ playerHand, dealerHand, status, message }) {
  const revealDealer = status === 'dealer' || status === 'round-over' || isBlackjack(dealerHand);
  const dealerTotal = revealDealer ? handValue(dealerHand).total : handValue([dealerHand[0]]).total;
  const playerTotal = handValue(playerHand).total;

  return (
    <div className="bg-emerald-950/60 border border-emerald-800 rounded-xl p-4 md:p-6 shadow-xl">
      <div className="grid gap-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Dealer</h2>
            <div className="text-emerald-200 font-mono">{dealerHand.length ? dealerTotal : '-'}</div>
          </div>
          <Hand cards={dealerHand} hideHole={!revealDealer} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">You</h2>
            <div className="text-emerald-200 font-mono">{playerHand.length ? playerTotal : '-'}</div>
          </div>
          <Hand cards={playerHand} />
        </div>
      </div>

      <div className="mt-6 bg-emerald-900/60 border border-emerald-800 rounded-lg p-3 text-center">
        <p className="text-emerald-100">{message}</p>
      </div>
    </div>
  );
}
