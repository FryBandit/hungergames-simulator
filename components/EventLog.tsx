
import React, { forwardRef } from 'react';
import type { GameDay, GameEvent } from '../types';
import { PlayIcon } from './icons/PlayIcon';

interface EventLogProps {
  log: GameDay[];
  isLoading: boolean;
  currentDay: number;
  onNextDay?: () => void;
  showImportantEventsOnly: boolean;
  setShowImportantEventsOnly: React.Dispatch<React.SetStateAction<boolean>>;
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

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-slate-400">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg">The Gamemakers are deciding the fate of the tributes...</p>
    </div>
);

const EventLog = forwardRef<HTMLDivElement, EventLogProps>(({ log, isLoading, currentDay, onNextDay, showImportantEventsOnly, setShowImportantEventsOnly }, ref) => {
  const renderDay = (dayData: GameDay) => {
    let dayTitle = `Day ${dayData.day}`;
    if (dayData.day === 0) dayTitle = "Training Day";
    if (dayData.day === -0.5) dayTitle = "The Culling";
    if (dayData.day === 0.5 || dayData.day > 100) dayTitle = "The Finale"; // Finale day
    
    const importantEventTypes: ReadonlyArray<GameEvent['type']> = ['death', 'combat', 'alliance', 'betrayal', 'arena', 'trap', 'negative'];
    const eventsToRender = showImportantEventsOnly
        ? dayData.events.filter(e => importantEventTypes.includes(e.type))
        : dayData.events;

    return (
        <div key={dayData.day} className="mb-6 last:mb-0">
            <h3 className="text-2xl font-bold text-amber-400 border-b-2 border-slate-700 pb-2 mb-4">
                {dayTitle}
            </h3>
            <p className="italic text-slate-400 mb-4">{dayData.summary}</p>
            <ul className="space-y-2">
                {eventsToRender.map((event, index) => (
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
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg h-full flex flex-col">
       <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h2 className="text-3xl font-bold text-amber-400">Event Log</h2>
            <div className="flex items-center space-x-2">
                <label htmlFor="event-filter-toggle" className="text-sm text-slate-400 cursor-pointer">Important Events Only</label>
                <button
                    id="event-filter-toggle"
                    onClick={() => setShowImportantEventsOnly(!showImportantEventsOnly)}
                    role="switch"
                    aria-checked={showImportantEventsOnly}
                    className={`${
                        showImportantEventsOnly ? 'bg-amber-600' : 'bg-slate-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                >
                    <span
                        className={`${
                            showImportantEventsOnly ? 'translate-x-6' : 'translate-x-1'
                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>
      </div>
      <div className="overflow-y-auto flex-grow" ref={ref}>
        {log.length === 0 && !isLoading && (
            <div className="flex items-center justify-center h-full text-slate-400">
                <p>The arena is quiet. Start the simulation to begin the games.</p>
            </div>
        )}
        {log.map(renderDay)}
        {isLoading && (
          <div>
             {log.length > 0 && <hr className="my-6 border-slate-700" />}
             <h3 className="text-2xl font-bold text-amber-400 border-b-2 border-slate-700 pb-2 mb-4 animate-pulse">
                {currentDay <= 0 ? "The Games Begin..." : `Day ${currentDay}...`}
            </h3>
            <LoadingSpinner/>
          </div>
        )}
      </div>
       {onNextDay && (
          <div className="pt-4 mt-4 border-t border-slate-700 flex-shrink-0">
              <button
                onClick={onNextDay}
                className="w-full flex items-center justify-center gap-2 bg-amber-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-amber-700 transition-all duration-200 transform hover:scale-105"
                >
                <PlayIcon className="h-5 w-5" />
                Proceed to Next Day
              </button>
          </div>
        )}
    </div>
  );
});

EventLog.displayName = 'EventLog';

export default EventLog;
