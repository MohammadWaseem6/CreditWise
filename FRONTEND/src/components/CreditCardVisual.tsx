 ============================================================

import { useRef, useState } from 'react';
import type { CreditCard } from '../types';
import { Wifi, Eye, EyeOff } from 'lucide-react';

interface Props {
  card: CreditCard;
  cardholderName: string;
  fullNumber?: string;
}

const CARD_GRADIENTS = [
  'from-purple-600 via-pink-500 to-red-500',
  'from-blue-600 via-cyan-500 to-teal-400',
  'from-gray-900 via-gray-800 to-black',
  'from-amber-500 via-orange-500 to-red-500',
  'from-emerald-600 via-green-500 to-teal-400',
  'from-indigo-600 via-purple-500 to-pink-500',
];

const DRAG_THRESHOLD = 60;

export default function CreditCardVisual({ card, cardholderName, fullNumber }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [hover, setHover] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartX = useRef(0);

  const gradient = CARD_GRADIENTS[card.id % CARD_GRADIENTS.length];

  const getNetwork = (name: string): string => {
    const lower = name.toLowerCase();
    if (lower.includes('visa')) return 'VISA';
    if (lower.includes('amex') || lower.includes('american')) return 'AMEX';
    if (lower.includes('discover')) return 'DISCOVER';
    if (lower.includes('chase')) return 'VISA';
    return 'MASTERCARD';
  };
  const network = getNetwork(card.card_name);

  const maskedNumber = `•••• •••• •••• ${card.last_four}`;
  const revealedNumber = fullNumber ? fullNumber.replace(/(.{4})/g, '$1 ').trim() : maskedNumber;
  const displayNumber = revealed ? revealedNumber : maskedNumber;
  const canReveal = Boolean(fullNumber);

  const formatExpiry = (): string => {
    const month = card.expiry_month || 12;
    const year = card.expiry_year || 2028;
    const mm = month.toString().padStart(2, '0');
    const yy = (year % 100).toString().padStart(2, '0');
    return `${mm}/${yy}`;
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    dragStartX.current = e.clientX;
    setIsDragging(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;
    setDragX(Math.max(-100, Math.min(100, e.clientX - dragStartX.current)));
  };
  const endDrag = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragX) > DRAG_THRESHOLD) setFlipped((f) => !f);
    setDragX(0);
  };

  // Live slide offset while dragging, snaps back once released
  const liveOffset = isDragging ? dragX * 0.3 : 0;

  return (
    <div
      className="relative select-none cursor-grab active:cursor-grabbing"
      style={{ aspectRatio: '1.586', minHeight: '220px' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="relative w-full h-full transition-transform duration-300"
        style={{
          transform: `translateX(${liveOffset}px) scale(${hover ? 1.03 : 1})`,
          filter: hover
            ? 'drop-shadow(0 18px 30px rgba(0,0,0,0.35))'
            : 'drop-shadow(0 8px 14px rgba(0,0,0,0.2))',
        }}
      >
        {/* ---------- FRONT ---------- */}
        <div
          className={`absolute inset-0 rounded-2xl p-6 bg-gradient-to-br ${gradient} text-white overflow-hidden transition-all duration-300`}
          style={{
            opacity: flipped ? 0 : 1,
            transform: `translateX(${flipped ? -24 : 0}px)`,
            pointerEvents: flipped ? 'none' : 'auto',
          }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 -ml-16 -mb-16" />
          <div
            className="absolute inset-0 opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage:
                'repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 8px)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: hover && !isDragging ? 1 : 0,
              background:
                'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 45%, transparent 60%)',
              backgroundSize: '250% 250%',
              backgroundPosition: hover ? '20% 20%' : '80% 80%',
              transition: 'background-position 700ms ease, opacity 300ms ease',
            }}
          />

          <div className="relative flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-5 border border-yellow-700/40 rounded-sm grid grid-cols-3 gap-px">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-yellow-700/10" />
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealed((r) => !r);
                }}
                disabled={!canReveal}
                title={canReveal ? (revealed ? 'Hide number' : 'Show full number') : 'Full number unavailable'}
                className="p-1.5 rounded-full bg-white/15 hover:bg-white/25 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="my-4">
              <p className="text-2xl tracking-widest font-mono [font-variant-numeric:tabular-nums] drop-shadow-sm">
                {displayNumber}
              </p>
            </div>

            <div className="flex justify-between items-end">
              <div className="flex gap-6">
                <div>
                  <p className="text-[10px] uppercase opacity-60 tracking-wider">Card Holder</p>
                  <p className="text-sm font-semibold uppercase tracking-wide">{cardholderName}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase opacity-60 tracking-wider">Expires</p>
                  <p className="text-sm font-semibold">{formatExpiry()}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Wifi className="h-6 w-6 rotate-90 opacity-60" />
                <p className="text-lg font-bold italic tracking-wider opacity-90">{network}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- BACK ---------- */}
        <div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${gradient} text-white overflow-hidden transition-all duration-300`}
          style={{
            opacity: flipped ? 1 : 0,
            transform: `translateX(${flipped ? 0 : 24}px)`,
            pointerEvents: flipped ? 'auto' : 'none',
          }}
        >
          <div className="w-full h-11 bg-black/80 mt-6" />

          <div className="px-6 mt-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-9 bg-white/80 rounded-sm flex items-center px-3">
                <span className="text-gray-500 italic text-sm truncate">{cardholderName}</span>
              </div>
              <div className="h-9 min-w-[3.5rem] px-2 bg-white/90 rounded-sm flex items-center justify-center">
                <span className="text-gray-800 font-mono text-sm tracking-widest">
                  {revealed && card.cvv ? card.cvv : '•••'}
                </span>
              </div>
            </div>

            <p className="text-[10px] opacity-60 leading-relaxed">
              This card is property of the issuing bank. Unauthorized use is prohibited. If found,
              please return to the nearest branch.
            </p>

            <div className="flex justify-between items-center">
              <p className="text-xs font-mono opacity-70">{maskedNumber}</p>
              <p className="text-base font-bold italic opacity-90">{network}</p>
            </div>
          </div>

          <p className="absolute bottom-3 right-4 text-[10px] opacity-40">Drag to flip back</p>
        </div>
      </div>

      {!flipped && !isDragging && (
        <p className="absolute -bottom-5 left-1 text-[10px] text-gray-400">Drag to flip</p>
      )}
    </div>
  );
}