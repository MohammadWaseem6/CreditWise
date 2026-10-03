import type { CreditCard } from '../types/types';
import { Wifi } from 'lucide-react';

interface Props {
    card: CreditCard;
    cardholderName: string;
}

const CARD_GRADIENTS = [
    'from-purple-600 via-pink-500 to-red-500',
    'from-blue-600 via-cyan-500 to-teal-400',
    'from-gray-900 via-gray-800 to-black',
    'from-amber-500 via-orange-500 to-red-500',
    'from-emerald-600 via-green-500 to-teal-400',
    'from-indigo-600 via-purple-500 to-pink-500',
];

export default function CreditCardVisual({ card, cardholderName }: Props) {
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
    const displayName = card.cardholder_name || cardholderName || 'YOUR NAME';  // ← ADD THIS LINE


    const formatCardNumber = (): string => {
        const number = card.card_number;
        if (!number) {
            return `•••• •••• •••• ${card.last_four}`;
        }
        const clean = number.replace(/\D/g, '');
        return clean.match(/.{1,4}/g) ?.join(' ') || number;
    };

    const formatExpiry = (): string => {
        const month = card.expiry_month || 12;
        const year = card.expiry_year || 2028;
        const mm = month.toString().padStart(2, '0');
        const yy = (year % 100).toString().padStart(2, '0');
        return `${mm}/${yy}`;
    };

    return (
        <div
            className={`relative rounded-2xl p-6 bg-gradient-to-br ${gradient} text-white shadow-xl overflow-hidden`}
            style={{ aspectRatio: '1.586', minHeight: '220px' }}
        >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 -ml-16 -mb-16" />

            <div className="relative flex flex-col justify-between h-full">
                <div className="flex justify-between items-start">
                    <div className="w-12 h-9 rounded-md bg-gradient-to-br from-yellow-300 to-yellow-500 relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-5 border border-yellow-700/30 rounded-sm" />
                        </div>
                    </div>
                    <p className="text-2xl font-bold italic tracking-wider opacity-90">
                        {network}
                    </p>
                </div>

                <div className="my-4">
                    <p className="text-lg md:text-xl tracking-widest font-mono whitespace-nowrap">
                        {formatCardNumber()}
                    </p>
                </div>

                <div className="flex justify-between items-end">
                    <div className="flex gap-6">
                        <div>
                            <p className="text-[10px] uppercase opacity-60 tracking-wider">
                                Card Holder
</p>
                            <p className="text-sm font-semibold uppercase tracking-wide truncate max-w-[140px]">
                                {displayName}                      
</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase opacity-60 tracking-wider">
                                Expires
              </p>
                            <p className="text-sm font-semibold">{formatExpiry()}</p>
                        </div>
                    </div>
                    <Wifi className="h-6 w-6 rotate-90 opacity-60" />
                </div>
            </div>
        </div>
    );
}