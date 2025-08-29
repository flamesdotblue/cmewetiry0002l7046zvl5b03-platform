import React from 'react';

function Card({ card, hidden = false }) {
  if (hidden) {
    return (
      <div className="w-16 h-24 md:w-20 md:h-28 rounded-lg bg-emerald-800/80 border border-emerald-700 shadow-inner flex items-center justify-center">
        <div className="w-10 h-16 bg-emerald-900 rounded-md" />
      </div>
    );
  }

  const { rank, suit } = card;
  const red = suit === '♥' || suit === '♦';

  return (
    <div className={`w-16 h-24 md:w-20 md:h-28 rounded-lg bg-white text-gray-900 border border-gray-200 shadow-md flex flex-col justify-between p-1 select-none`}
         style={{ perspective: '800px' }}>
      <div className={`text-xs font-bold ${red ? 'text-red-600' : 'text-gray-900'}`}>{rank}</div>
      <div className={`text-2xl md:text-3xl text-center ${red ? 'text-red-600' : 'text-gray-800'}`}>{suit}</div>
      <div className={`text-xs font-bold self-end ${red ? 'text-red-600' : 'text-gray-900'}`}>{rank}</div>
    </div>
  );
}

export default function Hand({ cards = [], hideHole = false }) {
  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {cards.map((c, i) => (
        <Card key={i} card={c} hidden={hideHole && i === 1} />
      ))}
    </div>
  );
}
