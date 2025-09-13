import React from 'react';
import type { GameSettings } from '../types';
import { GameState } from '../types';
import { ARENAS } from '../constants';
import { PlayIcon } from './icons/PlayIcon';
import { ResetIcon } from './icons/ResetIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ForestIcon, DesertIcon, JungleIcon, TundraIcon, RuinsIcon, MountainIcon, SwampIcon, RandomIcon } from './icons/ArenaIcons';

interface ConfigPanelProps {
  settings: GameSettings;
  setSettings: React.Dispatch<React.SetStateAction<GameSettings>>;
  onStart: () => void;
  onReset: () => void;
  gameState: GameState;
}

const ArenaIcon: React.FC<{ arenaName: string }> = ({ arenaName }) => {
    const iconProps = { className: "h-12 w-12 text-slate-400" };
    switch (arenaName) {
        case "Temperate Forest": return <ForestIcon {...iconProps} />;
        case "Scorching Desert": return <DesertIcon {...iconProps} />;
        case "Tropical Jungle": return <JungleIcon {...iconProps} />;
        case "Frozen Tundra": return <TundraIcon {...iconProps} />;
        case "Decaying Urban Ruins": return <RuinsIcon {...iconProps} />;
        case "Mountain Range": return <MountainIcon {...iconProps} />;
        case "Swampy Marshlands": return <SwampIcon {...iconProps} />;
        default: return <RandomIcon {...iconProps} />;
    }
};

const ConfigPanel: React.FC<ConfigPanelProps> = ({ settings, setSettings, onStart, onReset, gameState }) => {
  const isSimulating = gameState !== GameState.Idle && gameState !== GameState.Finished;
  const selectedArenaDetails = ARENAS.find(a => a.name === settings.arenaType);

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3">
        <SettingsIcon className="h-6 w-6" />
        Game Settings
      </h2>

      <div className="space-y-6">
        {/* Tribute Set */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tribute Set</label>
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setSettings({ ...settings, tributeSet: 'book' })}
              disabled={isSimulating}
              aria-pressed={settings.tributeSet === 'book'}
              className={`relative inline-flex items-center justify-center w-1/2 px-4 py-2 rounded-l-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50 ${
                settings.tributeSet === 'book' ? 'bg-amber-600 border-amber-600 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Book Characters
            </button>
            <button
              onClick={() => setSettings({ ...settings, tributeSet: 'generic' })}
              disabled={isSimulating}
              aria-pressed={settings.tributeSet === 'generic'}
              className={`relative -ml-px inline-flex items-center justify-center w-1/2 px-4 py-2 rounded-r-md border text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50 ${
                settings.tributeSet === 'generic' ? 'bg-amber-600 border-amber-600 text-white' : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Generic Tributes
            </button>
          </div>
        </div>
        
        {/* Pacing */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Event Pacing</label>
          <div className="grid grid-cols-3 rounded-md shadow-sm border border-slate-600">
             <button
              onClick={() => setSettings({ ...settings, pacing: 'stream' })}
              disabled={isSimulating}
              aria-pressed={settings.pacing === 'stream'}
              className={`relative inline-flex items-center justify-center px-4 py-2 rounded-l-md text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50 ${
                settings.pacing === 'stream' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Stream
            </button>
            <button
              onClick={() => setSettings({ ...settings, pacing: 'day' })}
              disabled={isSimulating}
              aria-pressed={settings.pacing === 'day'}
              className={`relative -ml-px inline-flex items-center justify-center px-4 py-2 text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50 border-x border-slate-600 ${
                settings.pacing === 'day' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Day-by-Day
            </button>
            <button
              onClick={() => setSettings({ ...settings, pacing: 'instant' })}
              disabled={isSimulating}
              aria-pressed={settings.pacing === 'instant'}
              className={`relative -ml-px inline-flex items-center justify-center px-4 py-2 rounded-r-md text-sm font-medium focus:z-10 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50 ${
                settings.pacing === 'instant' ? 'bg-amber-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Instant
            </button>
          </div>
        </div>
      
        {/* Arena Type */}
        <div>
          <label htmlFor="arenaType" className="block text-sm font-medium text-slate-300 mb-2">Arena Type</label>
          <select id="arenaType" value={settings.arenaType} onChange={(e) => setSettings({ ...settings, arenaType: e.target.value })} disabled={isSimulating} className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-slate-200 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition disabled:opacity-50">
            <option value="Random">Random</option>
            {ARENAS.map((type) => (<option key={type.name} value={type.name}>{type.name}</option>))}
          </select>
        </div>
        
        {selectedArenaDetails && settings.arenaType !== 'Random' && (
            <div className="mt-2 p-4 bg-slate-700/50 rounded-lg border border-slate-600 animate-fade-in">
                <div className="w-full h-24 bg-slate-600 rounded-md flex items-center justify-center mb-3">
                    <ArenaIcon arenaName={settings.arenaType} />
                </div>
                <p className="text-sm text-slate-300 mb-2">{selectedArenaDetails.description}</p>
                {selectedArenaDetails.effects.length > 0 && (
                    <div>
                        <h4 className="font-semibold text-amber-400 text-sm">Arena Effects:</h4>
                        <ul className="list-disc list-inside text-sm text-slate-400 mt-1 space-y-1">
                            {selectedArenaDetails.effects.map(effect => (
                                <li key={effect.description}>{effect.description}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        )}


        {/* Event Speed */}
        <div>
          <label htmlFor="eventSpeed" className="block text-sm font-medium text-slate-300 mb-2">Event Speed (Fast to Slow)</label>
          <input id="eventSpeed" type="range" min="100" max="2000" step="100" value={settings.eventSpeed} onChange={(e) => setSettings({...settings, eventSpeed: parseInt(e.target.value, 10)})} disabled={isSimulating || settings.pacing !== 'stream'} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50 disabled:cursor-not-allowed" />
        </div>

        {/* Max Days */}
        <div>
          <label htmlFor="maxDays" className="block text-sm font-medium text-slate-300 mb-2">Max Days ({settings.maxDays})</label>
          <input id="maxDays" type="range" min="5" max="20" step="1" value={settings.maxDays} onChange={(e) => setSettings({...settings, maxDays: parseInt(e.target.value, 10)})} disabled={isSimulating} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50" />
        </div>

        {/* Bloodbath Deaths */}
        <div>
          <label htmlFor="bloodbathDeaths" className="block text-sm font-medium text-slate-300 mb-2">Bloodbath Deaths ({settings.bloodbathDeaths})</label>
          <input id="bloodbathDeaths" type="range" min="0" max="12" step="1" value={settings.bloodbathDeaths} onChange={(e) => setSettings({...settings, bloodbathDeaths: parseInt(e.target.value, 10)})} disabled={isSimulating} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-50" />
        </div>
      </div>
      
      <div className="mt-8 space-y-3">
        <button onClick={onStart} disabled={isSimulating} className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-all duration-200 disabled:bg-slate-600 disabled:cursor-not-allowed transform hover:scale-105">
          <PlayIcon className="h-5 w-5" />
          {gameState === GameState.Finished ? 'Play Again' : 'Proceed to The Reaping'}
        </button>
      </div>
      <style>{`
          @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out forwards;
          }
        `}</style>
    </div>
  );
};

export default ConfigPanel;