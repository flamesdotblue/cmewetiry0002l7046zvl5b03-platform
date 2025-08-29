import { DollarSign } from 'lucide-react';

export default function Header({ bankroll }) {
  return (
    <header className="w-full bg-emerald-950/70 backdrop-blur border-b border-emerald-800">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-lime-500 shadow-inner" />
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight">Blackjack 2D + AI Coach</h1>
        </div>
        <div className="flex items-center gap-2 text-emerald-100">
          <DollarSign className="w-5 h-5" />
          <span className="font-mono text-lg">{bankroll}</span>
        </div>
      </div>
    </header>
  );
}
