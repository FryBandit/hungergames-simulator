
import React, { useState } from 'react';
import type { GameSummary, Tribute, GameDay, GameEvent } from '../types';
import { ResetIcon } from './icons/ResetIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { PodiumIcon } from './icons/PodiumIcon';
import { TimelineIcon } from './icons/TimelineIcon';
import { ScrollIcon } from './icons/ScrollIcon';
import GameStatistics from './GameStatistics';

interface GameSummaryProps {
  summary: GameSummary;
  onReset: () => void;
}

const eventTypeColorMap: Record<GameEvent['type'], string> = {
  death: 'text-red-400',
  combat: 'text-orange-400',
  alliance: 'text-sky-400',
  betrayal: 'text-pink-400',
  item: 'text-amber-400',
  neutral: 'text-slate-300',
  arena: 'text-purple-400 font-semibold',
  negative: 'text-yellow-400',
  crafting: 'text-lime-400',
  positive: 'text-green-400',
  trap: 'text-fuchsia-400',
};

const getPlacementColor = (place: number) => {
    if (place === 1) return 'text-amber-400 border-amber-400';
    if (place === 2) return 'text-slate-300 border-slate-400';
    if (place === 3) return 'text-yellow-600 border-yellow-700';
    return 'text-slate-500 border-slate-700';
}

const WinnerCard: React.FC<{ winner: Tribute | null }> = ({ winner }) => {
    if (!winner) {
        return (
            <div className="text-center p-6 bg-slate-900 rounded-lg">
                <h2 className="text-3xl font-bold text-red-500" style={{fontFamily: `'Cinzel', serif`}}>NO VICTOR</h2>
                <p className="text-slate-400 mt-2">The arena has gone silent. There are no survivors.</p>
            </div>
        )
    }
    return (
        <div className="text-center p-6 bg-slate-900 rounded-lg">
            <TrophyIcon className="h-16 w-16 text-amber-400 mx-auto mb-2" />
            <h2 className="text-4xl font-extrabold text-amber-400" style={{fontFamily: `'Cinzel', serif`}}>VICTOR</h2>
            <p className="text-slate-300 mt-2">The winner of the Hunger Games is</p>
            <p className="text-5xl font-bold text-white my-2">{winner.name}</p>
            <p className="text-2xl text-slate-400">from District {winner.district}</p>
        </div>
    );
};

const FullLogModal: React.FC<{ log: GameDay[], onClose: () => void }> = ({ log, onClose }) => {
    const renderDay = (dayData: GameDay) => {
        let dayTitle = `Day ${dayData.day}`;
        if (dayData.day === 0) dayTitle = "Training Day";
        if (dayData.day === -0.5) dayTitle = "The Culling";
        if (dayData.day === 0.5 || dayData.day > 100) dayTitle = "The Finale";
        
        return (
            <div key={dayData.day} className="mb-6 last:mb-0">
                <h3 className="text-2xl font-bold text-amber-400 border-b-2 border-slate-700 pb-2 mb-4">
                    {dayTitle}
                </h3>
                <p className="italic text-slate-400 mb-4">{dayData.summary}</p>
                <ul className="space-y-2">
                    {dayData.events.map((event, index) => (
                        <li key={`${dayData.day}-${index}`} className={`pl-2 ${eventTypeColorMap[event.type] || 'text-slate-300'} flex`}>
                            <span className="text-xs text-slate-500 mr-2 font-mono w-20 shrink-0">[{event.timestamp}]</span>
                            <span>{event.text}</span>
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-4 flex-shrink-0 p-6 border-b border-slate-700">
                    <h2 className="text-3xl font-bold text-amber-400 flex items-center gap-3"><ScrollIcon />Full Game Log</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-3xl leading-none">&times;</button>
                </div>
                <div className="overflow-y-auto flex-grow p-6">
                    {log.map(renderDay)}
                </div>
            </div>
        </div>
    );
};

const GameSummary: React.FC<GameSummaryProps> = ({ summary, onReset }) => {
  const { winner, placements, timeline, log } = summary;
  const [showLog, setShowLog] = useState(false);

  return (
    <>
    {showLog && <FullLogModal log={log} onClose={() => setShowLog(false)} />}
    <div className="fixed inset-0 bg-slate-900 bg-opacity-95 z-50 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto animate-fade-in">
            <WinnerCard winner={winner} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Placements & Stats Column */}
                <div className="space-y-8">
                    {/* Placements */}
                    <div className="bg-slate-800 p-6 rounded-lg">
                        <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-3"><PodiumIcon />Placements</h3>
                        <ul className="space-y-2 max-h-96 overflow-y-auto">
                            {placements.map((t, i) => (
                                <li key={t.id} className={`flex justify-between items-center p-2 rounded ${i < 3 ? 'bg-slate-700/50' : ''}`}>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold text-lg w-8 text-center border-r-2 ${getPlacementColor(i + 1)}`}>{i + 1}</span>
                                        <div>
                                            <p className="font-semibold text-slate-200">{t.name}</p>
                                            <p className="text-xs text-slate-400">District {t.district}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-300">{t.kills} Kill{t.kills !== 1 && 's'}</p>
                                        <p className="text-xs text-slate-500">Survived {t.daysSurvived} Day{t.daysSurvived !== 1 && 's'}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <GameStatistics summary={summary} />
                </div>

                {/* Timeline Column */}
                <div className="bg-slate-800 p-6 rounded-lg">
                    <h3 className="text-2xl font-bold text-amber-400 mb-4 flex items-center gap-3"><TimelineIcon />Timeline of the Fallen</h3>
                    <ul className="space-y-3 max-h-[calc(30rem+190px)] overflow-y-auto">
                        {timeline.map((entry, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm">
                                <span className="font-bold text-amber-500 w-16 shrink-0">Day {entry.day}:</span>
                                <p className="text-slate-300 flex-1"><span className="font-semibold">{entry.tributeName}</span> - {entry.cause}</p>
                            </li>
                        ))}
                         {timeline.length === 0 && <p className="text-slate-400">An unbelievable result! No one has fallen.</p>}
                    </ul>
                </div>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-xl mx-auto">
                <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-700 transition-all duration-200 transform hover:scale-105"
                    >
                    <ResetIcon className="h-5 w-5" />
                    Play Again
                </button>
                 <button
                    onClick={() => setShowLog(true)}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-700 transition-all duration-200"
                    >
                    <ScrollIcon className="h-5 w-5" />
                    View Full Event Log
                </button>
            </div>
        </div>
       <style>{`
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.7s ease-out forwards;
          }
        `}</style>
    </div>
    </>
  );
};

export default GameSummary;
