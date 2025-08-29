import React, { useMemo } from 'react';

export default function AIAssistant({ advice, status }) {
  const color = advice?.action === 'Hit' ? 'bg-emerald-800' : advice?.action === 'Stand' ? 'bg-emerald-700' : advice?.action === 'Double' ? 'bg-amber-700' : 'bg-emerald-900';

  const odds = advice?.odds || { win: 0, lose: 0, push: 0 };
  const formatPct = (x) => `${Math.round(x * 100)}%`;

  const evs = advice?.evs || {};

  return (
    <div className="bg-emerald-950/60 border border-emerald-800 rounded-xl p-4 grid gap-4">
      <h3 className="text-lg font-semibold">AI Coach</h3>

      {advice ? (
        <>
          <div className={`rounded-lg ${color} border border-emerald-800 p-3`}>
            <div className="text-sm text-emerald-200">Recommended Action</div>
            <div className="text-2xl font-bold">{advice.action}</div>
            {advice.note && <div className="text-emerald-200 mt-1 text-sm">{advice.note}</div>}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-md p-3">
              <div className="text-xs text-emerald-300">Win</div>
              <div className="text-lg font-semibold">{formatPct(odds.win)}</div>
            </div>
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-md p-3">
              <div className="text-xs text-emerald-300">Push</div>
              <div className="text-lg font-semibold">{formatPct(odds.push)}</div>
            </div>
            <div className="bg-emerald-900/60 border border-emerald-800 rounded-md p-3">
              <div className="text-xs text-emerald-300">Lose</div>
              <div className="text-lg font-semibold">{formatPct(odds.lose)}</div>
            </div>
          </div>

          <div className="bg-emerald-900/60 border border-emerald-800 rounded-md p-3 text-sm">
            <div className="font-semibold mb-1">Expected Value (per 1 unit bet)</div>
            <ul className="grid gap-1">
              {'Hit' in evs && <li className="flex justify-between"><span>Hit</span><span className="font-mono">{evs.Hit.toFixed(3)}</span></li>}
              {'Stand' in evs && <li className="flex justify-between"><span>Stand</span><span className="font-mono">{evs.Stand.toFixed(3)}</span></li>}
              {'Double' in evs && <li className="flex justify-between"><span>Double</span><span className="font-mono">{evs.Double.toFixed(3)}</span></li>}
            </ul>
          </div>

          {advice.explanation && (
            <div className="text-sm text-emerald-200 leading-relaxed">
              {advice.explanation}
            </div>
          )}
        </>
      ) : (
        <div className="text-emerald-200">Place a bet and deal to see recommendations.</div>
      )}

      <div className="text-xs text-emerald-300 opacity-80">
        The coach uses basic strategy with a quick simulation using the remaining shoe (dealer hits soft 17).
      </div>
    </div>
  );
}
