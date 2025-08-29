import React from 'react';

export default function Controls({
  bet,
  bankroll,
  onBetChange,
  onDeal,
  onHit,
  onStand,
  onDouble,
  onNextRound,
  onResetBank,
  canDeal,
  canHit,
  canStand,
  canDouble,
  status,
}) {
  const disabledBetting = status !== 'betting';

  const changeBet = (delta) => {
    const next = Math.max(1, Math.min(bankroll, bet + delta));
    onBetChange(next);
  };

  return (
    <div className="bg-emerald-950/60 border border-emerald-800 rounded-xl p-4 grid gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => changeBet(-25)}
            disabled={disabledBetting}
            className={`px-3 py-2 rounded-md border border-emerald-800 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50`}
          >-25</button>
          <button
            onClick={() => changeBet(-5)}
            disabled={disabledBetting}
            className={`px-3 py-2 rounded-md border border-emerald-800 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50`}
          >-5</button>
          <div className="px-4 py-2 rounded-md bg-emerald-900 border border-emerald-800 font-mono">
            Bet: {bet}
          </div>
          <button
            onClick={() => changeBet(5)}
            disabled={disabledBetting}
            className={`px-3 py-2 rounded-md border border-emerald-800 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50`}
          >+5</button>
          <button
            onClick={() => changeBet(25)}
            disabled={disabledBetting}
            className={`px-3 py-2 rounded-md border border-emerald-800 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-50`}
          >+25</button>
        </div>
        <div className="text-sm text-emerald-200">Bankroll: <span className="font-mono">{bankroll}</span></div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onDeal}
          disabled={!canDeal}
          className="px-4 py-2 rounded-md bg-lime-600 hover:bg-lime-500 text-emerald-50 font-semibold disabled:opacity-50"
        >Deal</button>
        <button
          onClick={onHit}
          disabled={!canHit}
          className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
        >Hit</button>
        <button
          onClick={onStand}
          disabled={!canStand}
          className="px-4 py-2 rounded-md bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50"
        >Stand</button>
        <button
          onClick={onDouble}
          disabled={!canDouble}
          className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
        >Double</button>

        <div className="flex-1" />

        {status === 'round-over' && (
          <button
            onClick={onNextRound}
            className="px-4 py-2 rounded-md bg-sky-600 hover:bg-sky-500"
          >Next Round</button>
        )}

        <button
          onClick={onResetBank}
          className="px-4 py-2 rounded-md bg-rose-700/90 hover:bg-rose-600"
        >Reset Bank</button>
      </div>
    </div>
  );
}
