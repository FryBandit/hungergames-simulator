
import React from 'react';
import type { Tribute } from '../types';
import { ResetIcon } from './icons/ResetIcon';
import { TrophyIcon } from './icons/TrophyIcon';

interface WinnerDisplayProps {
  winner: Tribute;
  onReset: () => void;
}

const WinnerDisplay: React.FC<WinnerDisplayProps> = ({ winner, onReset }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-8 max-w-lg w-full text-center border-2 border-amber-400 transform transition-all animate-fade-in-up">
        <TrophyIcon className="h-20 w-20 text-amber-400 mx-auto mb-4" />
        <h2 className="text-4xl font-extrabold text-amber-400" style={{fontFamily: `'Cinzel', serif`}}>
          VICTOR
        </h2>
        <p className="text-slate-300 mt-2">The winner of the Hunger Games is</p>
        <p className="text-5xl font-bold text-white my-4">{winner.name}</p>
        <p className="text-2xl text-slate-400">from District {winner.district}</p>
        <button
          onClick={onReset}
          className="mt-8 w-full flex items-center justify-center gap-2 bg-amber-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-700 transition-all duration-200 transform hover:scale-105"
        >
          <ResetIcon className="h-5 w-5" />
          Play Again
        </button>
      </div>
       <style>{`
          @keyframes fade-in-up {
            0% {
              opacity: 0;
              transform: translateY(20px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default WinnerDisplay;
