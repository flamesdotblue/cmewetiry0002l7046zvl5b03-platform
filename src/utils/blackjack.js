// Card and deck utilities
export function createDeck(numDecks = 6) {
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const suits = ['♠', '♥', '♦', '♣'];
  const deck = [];
  for (let d = 0; d < numDecks; d++) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ rank, suit });
      }
    }
  }
  // shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function dealCard(deck) {
  return deck.shift();
}

export function cardValue(rank) {
  if (rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(rank)) return 10;
  return parseInt(rank, 10);
}

export function handValue(hand) {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    const v = cardValue(c.rank);
    total += v;
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10; // count Ace as 1
    aces--;
  }
  const soft = hand.some((c) => c.rank === 'A') && total <= 11 + (hand.filter((c) => c.rank === 'A').length > 0 ? 10 : 0);
  return { total, soft };
}

export function isBlackjack(hand) {
  if (hand.length !== 2) return false;
  const ranks = hand.map((c) => c.rank);
  const hasAce = ranks.includes('A');
  const hasTen = ranks.some((r) => ['10', 'J', 'Q', 'K'].includes(r));
  return hasAce && hasTen;
}

// Dealer logic: dealer hits soft 17 (H17)
export function dealerShouldHit(total, isSoft) {
  if (total < 17) return true;
  if (total === 17 && isSoft) return true; // hit soft 17
  return false;
}

export function dealerPlayOut(dealerHand, deck) {
  let d = [...deck];
  let h = [...dealerHand];
  while (true) {
    const v = handValue(h);
    if (dealerShouldHit(v.total, isSoft(h))) {
      h.push(dealCard(d));
    } else {
      break;
    }
  }
  return { finalHand: h, deckAfter: d };
}

function isSoft(hand) {
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10; aces--;
  }
  // soft if any ace counted as 11
  return hand.some((c) => c.rank === 'A') && total <= 21 && total - 10 >= 0 && total <= 21 && (total + 10 <= 31);
}

// Basic Strategy (no splits), dealer hits soft 17
function basicStrategyAction(playerHand, dealerUp, canDouble) {
  if (!playerHand.length || !dealerUp) return 'Hit';

  const pVal = handValue(playerHand);
  const upRank = dealerUp.rank;

  const upVal = ['J', 'Q', 'K'].includes(upRank) ? 10 : upRank === 'A' ? 11 : parseInt(upRank, 10);

  // Pair handling (very simplified: only A,A and 8,8 -> treat as Hit recommendation since we don't implement split)
  if (playerHand.length === 2 && playerHand[0].rank === playerHand[1].rank) {
    const r = playerHand[0].rank;
    if (r === 'A' || r === '8') {
      // would be split, fallback: Hit on 8s vs 9/10/A else Stand on 8s total 16 is bad; we'll recommend Hit generally
      return 'Hit';
    }
  }

  // Soft totals
  const hasAce = playerHand.some((c) => c.rank === 'A');
  if (hasAce && pVal.total <= 21) {
    // treat as soft total if counting Ace as 11 possible
    const softTotal = softTotalValue(playerHand);
    if (softTotal) {
      const t = softTotal;
      if (t <= 17) {
        if (canDouble && (upVal >= 4 && upVal <= 6) && playerHand.length === 2) return 'Double';
        return 'Hit';
      }
      if (t === 18) {
        if (canDouble && (upVal >= 2 && upVal <= 6) && playerHand.length === 2) return 'Double';
        if (upVal >= 9 || upVal === 11) return 'Hit';
        return 'Stand';
      }
      if (t >= 19) return 'Stand';
    }
  }

  // Hard totals
  const t = pVal.total;
  if (t <= 8) return 'Hit';
  if (t === 9) {
    if (canDouble && upVal >= 3 && upVal <= 6 && playerHand.length === 2) return 'Double';
    return 'Hit';
  }
  if (t === 10) {
    if (canDouble && upVal <= 9 && playerHand.length === 2) return 'Double';
    return 'Hit';
  }
  if (t === 11) {
    if (canDouble && upVal !== 11 && playerHand.length === 2) return 'Double';
    return 'Hit';
  }
  if (t === 12) {
    if (upVal >= 4 && upVal <= 6) return 'Stand';
    return 'Hit';
  }
  if (t >= 13 && t <= 16) {
    if (upVal <= 6) return 'Stand';
    return 'Hit';
  }
  return 'Stand';
}

function softTotalValue(hand) {
  // return soft total (Ace counted as 11) if possible, else null
  let total = 0;
  let aces = 0;
  for (const c of hand) {
    total += cardValue(c.rank);
    if (c.rank === 'A') aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10; aces--;
  }
  // if at least one ace counted as 11, then soft
  const hasAce = hand.some((c) => c.rank === 'A');
  if (!hasAce) return null;
  // check if one ace is counted as 11 in final total
  let raw = 0; let aceCount = 0;
  for (const c of hand) {
    if (c.rank === 'A') { aceCount++; raw += 11; }
    else raw += cardValue(c.rank);
  }
  // reduce by 10 per ace until <=21
  while (raw > 21 && aceCount > 0) { raw -= 10; aceCount--; }
  // if an ace is still 11, it's soft
  if (hand.some((c) => c.rank === 'A') && raw <= 21 && handValue(hand).total !== raw) {
    return raw;
  }
  // Another approach: if hand contains Ace and total <= 21 and total -10 >= 2, we can treat soft.
  const hv = handValue(hand).total;
  if (hand.some((c) => c.rank === 'A') && hv <= 21) {
    // try to re-add 10 to see if could be soft
    let hvRaw = hv + 10;
    if (hvRaw <= 21) return hvRaw;
  }
  return null;
}

// Simulation helpers
function drawRandom(deck) {
  const i = Math.floor(Math.random() * deck.length);
  return { card: deck[i], rest: deck.slice(0, i).concat(deck.slice(i + 1)) };
}

function cloneHand(hand) { return hand.map((c) => ({ ...c })); }

function simulateStand(playerHand, dealerHand, deck, sims = 300) {
  let win = 0, lose = 0, push = 0;
  for (let s = 0; s < sims; s++) {
    let d = [...deck];
    let dh = cloneHand(dealerHand);

    // If dealer's hole is unknown (length 1), draw one
    if (dh.length === 1) {
      const draw = drawRandom(d); dh.push(draw.card); d = draw.rest;
    }

    // Play dealer
    while (true) {
      const v = handValue(dh);
      if (dealerShouldHit(v.total, isSoft(dh))) {
        const draw = drawRandom(d); dh.push(draw.card); d = draw.rest;
      } else break;
    }

    const p = handValue(playerHand).total;
    const dv = handValue(dh).total;
    if (dv > 21) win++;
    else if (p > dv) win++;
    else if (p < dv) lose++;
    else push++;
  }
  return { win: win / sims, lose: lose / sims, push: push / sims };
}

function simulateHit(playerHand, dealerHand, deck, sims = 300) {
  let results = { win: 0, lose: 0, push: 0 };
  for (let s = 0; s < sims; s++) {
    let d = [...deck];
    let ph = cloneHand(playerHand);
    let dh = cloneHand(dealerHand);

    // If dealer hole unknown
    if (dh.length === 1) { const draw = drawRandom(d); dh.push(draw.card); d = draw.rest; }

    // Draw one for player
    const pDraw = drawRandom(d); ph.push(pDraw.card); d = pDraw.rest;
    const pVal = handValue(ph).total;

    if (pVal > 21) { results.lose++; continue; }

    // Dealer play
    while (true) {
      const v = handValue(dh);
      if (dealerShouldHit(v.total, isSoft(dh))) {
        const draw = drawRandom(d); dh.push(draw.card); d = draw.rest;
      } else break;
    }

    const dv = handValue(dh).total;
    if (dv > 21) results.win++;
    else if (pVal > dv) results.win++;
    else if (pVal < dv) results.lose++;
    else results.push++;
  }
  const simsCount = sims;
  return { win: results.win / simsCount, lose: results.lose / simsCount, push: results.push / simsCount };
}

function evFromOdds(odds) {
  // per 1 unit bet EV
  return odds.win * 1 + odds.push * 0 + odds.lose * -1;
}

export function adviseAction({ playerHand, dealerUp, deck, canDouble, status }) {
  if (!playerHand || playerHand.length === 0) return null;
  if (!dealerUp) return null;

  const baseAction = basicStrategyAction(playerHand, dealerUp, canDouble);

  // Build minimal dealer hand for simulation: include up card only when round ongoing
  const dealerKnown = status === 'player' ? [dealerUp] : [];

  const standOdds = simulateStand(playerHand, dealerKnown, deck, 240);
  const hitOdds = simulateHit(playerHand, dealerKnown, deck, 240);

  const evs = {
    Hit: evFromOdds(hitOdds),
    Stand: evFromOdds(standOdds),
  };

  // Approximate Double EV as EV(hit) scaled with 2x exposure; very rough but indicative
  if (canDouble && playerHand.length === 2) {
    evs.Double = evs.Hit * 2; // naive approximation
  }

  // Choose action by EV comparison, but bias to basic strategy to avoid sim noise when close
  let best = baseAction;
  const ranked = Object.entries(evs).sort((a, b) => b[1] - a[1]);
  if (ranked.length) {
    const [topAction, topEV] = ranked[0];
    // if top EV is meaningfully better than base action EV, take it
    const baseEV = evs[baseAction] ?? -Infinity;
    if (topEV - baseEV > 0.03) best = topAction;
  }

  const note = `Basic strategy suggests ${baseAction}. Simulation checks remaining-shoe outcomes.`;

  return {
    action: best,
    evs,
    odds: best === 'Stand' ? standOdds : hitOdds,
    explanation: generateExplanation(playerHand, dealerUp, baseAction),
    note,
  };
}

function generateExplanation(playerHand, dealerUp, baseAction) {
  const pv = handValue(playerHand);
  const up = dealerUp.rank === 'A' ? 'Ace' : ['J','Q','K'].includes(dealerUp.rank) ? '10' : dealerUp.rank;
  const kind = playerHand.some((c) => c.rank === 'A') && softTotalValue(playerHand) ? 'soft' : 'hard';
  return `You have a ${kind} ${pv.total} against dealer ${up}. Basic strategy recommends ${baseAction} considering dealer hits soft 17.`;
}
