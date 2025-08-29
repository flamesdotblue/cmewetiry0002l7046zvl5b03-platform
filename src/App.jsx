import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import GameTable from './components/GameTable.jsx';
import Controls from './components/Controls.jsx';
import AIAssistant from './components/AIAssistant.jsx';
import {
  createDeck,
  dealCard,
  handValue,
  isBlackjack,
  dealerPlayOut,
  adviseAction,
} from './utils/blackjack.js';

export default function App() {
  const [deck, setDeck] = useState(() => createDeck(6));
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(25);
  const [status, setStatus] = useState('betting'); // betting | player | dealer | round-over
  const [message, setMessage] = useState('Place your bet and deal');
  const [firstAction, setFirstAction] = useState(true);

  // Auto-reshuffle when deck is low
  useEffect(() => {
    if (deck.length < 52 && status === 'betting') {
      setDeck(createDeck(6));
      setMessage('Reshuffled the shoe. Place your bet and deal');
    }
  }, [deck.length, status]);

  const canDeal = useMemo(() => bet > 0 && bet <= bankroll && status === 'betting', [bet, bankroll, status]);
  const canHit = status === 'player';
  const canStand = status === 'player';
  const canDouble = status === 'player' && firstAction && bankroll >= bet;

  function resetHands() {
    setPlayerHand([]);
    setDealerHand([]);
    setFirstAction(true);
  }

  function startRound() {
    if (!canDeal) return;
    let d = [...deck];
    const ph = [dealCard(d), dealCard(d)];
    const dh = [dealCard(d), dealCard(d)];

    setDeck(d);
    setPlayerHand(ph);
    setDealerHand(dh);
    setStatus('player');
    setFirstAction(true);
    setBankroll((b) => b - bet); // place bet

    const playerBJ = isBlackjack(ph);
    const dealerBJ = isBlackjack(dh);

    if (playerBJ || dealerBJ) {
      // Immediate resolution
      if (playerBJ && dealerBJ) {
        setMessage('Both have Blackjack. Push.');
        setBankroll((b) => b + bet); // return bet
      } else if (playerBJ) {
        const win = Math.floor(bet * 2.5); // return bet + 1.5x
        setMessage('Blackjack! You win 3:2');
        setBankroll((b) => b + win);
      } else if (dealerBJ) {
        setMessage('Dealer has Blackjack. You lose.');
        // bet already deducted
      }
      setStatus('round-over');
    } else {
      setMessage('Your move. Hit, Stand, or Double.');
    }
  }

  function onHit() {
    if (!canHit) return;
    let d = [...deck];
    const newCard = dealCard(d);
    const newHand = [...playerHand, newCard];
    setDeck(d);
    setPlayerHand(newHand);
    setFirstAction(false);

    const val = handValue(newHand).total;
    if (val > 21) {
      setMessage('You busted. Dealer wins.');
      setStatus('round-over');
    } else {
      setMessage('Your move.');
    }
  }

  function onStand() {
    if (!canStand) return;
    setFirstAction(false);
    setStatus('dealer');

    // Dealer plays out
    const { finalHand: dealerFinal, deckAfter } = dealerPlayOut(dealerHand, deck);
    setDealerHand(dealerFinal);
    setDeck(deckAfter);

    // Resolve
    const p = handValue(playerHand).total;
    const dVal = handValue(dealerFinal).total;

    if (dVal > 21) {
      setMessage('Dealer busts. You win!');
      setBankroll((b) => b + bet * 2);
    } else if (p > dVal) {
      setMessage('You win!');
      setBankroll((b) => b + bet * 2);
    } else if (p < dVal) {
      setMessage('Dealer wins.');
      // bet already lost
    } else {
      setMessage('Push. Bet returned.');
      setBankroll((b) => b + bet);
    }

    setStatus('round-over');
  }

  function onDouble() {
    if (!canDouble) return;
    // Deduct additional bet
    setBankroll((b) => b - bet);

    let d = [...deck];
    const newCard = dealCard(d);
    const newHand = [...playerHand, newCard];
    setDeck(d);
    setPlayerHand(newHand);

    const pVal = handValue(newHand).total;

    // Then stand automatically
    const { finalHand: dealerFinal, deckAfter } = dealerPlayOut(dealerHand, d);
    setDealerHand(dealerFinal);
    setDeck(deckAfter);

    const dVal = handValue(dealerFinal).total;

    if (pVal > 21) {
      setMessage('You busted after doubling. Dealer wins.');
    } else if (dVal > 21 || pVal > dVal) {
      setMessage('You win on double!');
      setBankroll((b) => b + bet * 4); // total return: 2x bet profit + both bets back
    } else if (pVal < dVal) {
      setMessage('Dealer wins on double.');
    } else {
      setMessage('Push on double.');
      setBankroll((b) => b + bet * 2);
    }

    setStatus('round-over');
  }

  function nextRound() {
    resetHands();
    setStatus('betting');
    setMessage('Place your bet and deal');
  }

  function resetBank() {
    setBankroll(1000);
    setMessage('Bankroll reset to 1000');
  }

  const advice = useMemo(() => {
    const canSplit = false; // not implemented in this version
    const hideDealerHole = !(status === 'dealer' || status === 'round-over');
    const up = dealerHand[0];
    return adviseAction({
      playerHand,
      dealerUp: hideDealerHole ? up : dealerHand[0],
      deck,
      canDouble,
      canSplit,
      status,
    });
  }, [playerHand, dealerHand, deck, canDouble, status]);

  return (
    <div className="min-h-screen w-full bg-emerald-900 text-emerald-50 flex flex-col">
      <Header bankroll={bankroll} />

      <main className="flex-1 container mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <GameTable
            playerHand={playerHand}
            dealerHand={dealerHand}
            status={status}
            message={message}
          />

          <div className="mt-6">
            <Controls
              bet={bet}
              bankroll={bankroll}
              onBetChange={setBet}
              onDeal={startRound}
              onHit={onHit}
              onStand={onStand}
              onDouble={onDouble}
              onNextRound={nextRound}
              onResetBank={resetBank}
              canDeal={canDeal}
              canHit={canHit}
              canStand={canStand}
              canDouble={canDouble}
              status={status}
            />
          </div>
        </section>

        <aside className="lg:col-span-1">
          <AIAssistant advice={advice} status={status} />
        </aside>
      </main>

      <footer className="text-center text-emerald-200 text-sm py-4 opacity-80">
        Blackjack 2D + AI Coach • Practice responsible gaming
      </footer>
    </div>
  );
}
