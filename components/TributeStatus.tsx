
import React, { useState, useRef, useEffect } from 'react';
import type { Tribute } from '../types';
import { AliveIcon } from './icons/AliveIcon';
import { FallenIcon } from './icons/FallenIcon';
import { UsersIcon } from './icons/UsersIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { SkillIcon } from './icons/SkillIcon';
import { TraitIcon } from './icons/TraitIcon';

interface TributeStatusProps {
  tributes: Tribute[];
}

const statDescriptions = {
    strength: "Strength: Affects melee combat effectiveness and physical tasks.",
    agility: "Agility: Influences dodging and complex physical actions.",
    speed: "Speed: Determines ability to flee from combat and travel quickly.",
    intelligence: "Intelligence: Governs crafting, trap detection, and strategy.",
    charisma: "Charisma: Increases chances of forming alliances and receiving sponsor gifts."
};

const StatBar: React.FC<{ value: number; max: number; color: string; label: string; change: number }> = ({ value, max, color, label, change }) => {
    const [flash, setFlash] = useState('');

    useEffect(() => {
        if (change > 0) {
            setFlash('flash-green');
        } else if (change < 0) {
            setFlash('flash-red');
        }
        const timer = setTimeout(() => setFlash(''), 1000);
        return () => clearTimeout(timer);
    }, [change, value]); // Rerun effect when change or value changes

    return (
        <div className="w-full">
            <span className="text-xs font-medium text-slate-300">{label}</span>
            <div className={`bg-slate-600 rounded-full h-2.5 transition-all duration-300 ${flash}`}>
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${(value / max) * 100}%` }}></div>
            </div>
        </div>
    );
};

const TributeCard: React.FC<{ tribute: Tribute; prevTribute: Tribute | undefined, allTributes: Tribute[] }> = ({ tribute, prevTribute, allTributes }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const isInAlliance = tribute.allies.length > 0;
    const allyNames = isInAlliance ? tribute.allies.map(id => allTributes.find(t => t.id === id)?.name).filter(Boolean).join(', ') : '';

    const healthChange = tribute.health - (prevTribute?.health ?? tribute.health);
    const foodChange = tribute.food - (prevTribute?.food ?? tribute.food);
    const waterChange = tribute.water - (prevTribute?.water ?? tribute.water);

    return (
        <div className={`rounded-md transition-all duration-300 ${tribute.status === 'alive' ? 'bg-slate-700' : 'bg-slate-800/50'}`}>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full p-3 text-left focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-md"
                aria-expanded={isExpanded}
                aria-controls={`tribute-details-${tribute.id}`}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <p className={`font-semibold ${tribute.status === 'alive' ? 'text-slate-100' : 'text-slate-500 line-through'}`}>{tribute.name}</p>
                        <p className={`text-xs ${tribute.status === 'alive' ? 'text-slate-400' : 'text-slate-600'}`}>District {tribute.district}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {tribute.status === 'alive' && isInAlliance && (
                            <div title={`Allied with: ${allyNames}`}>
                                <UsersIcon className="h-4 w-4 text-sky-400" />
                            </div>
                        )}
                        <ChevronDownIcon className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                </div>
            </button>
            {isExpanded && (
                <div id={`tribute-details-${tribute.id}`} className="px-3 pb-3 space-y-3 bg-slate-700/50 rounded-b-md">
                    {tribute.status === 'alive' && (
                        <div className="space-y-2">
                            <StatBar value={tribute.health} max={tribute.maxHealth} color="bg-green-500" label={`Health (${tribute.health.toFixed(0)}/${tribute.maxHealth.toFixed(0)})`} change={healthChange} />
                            <StatBar value={tribute.food} max={100} color="bg-orange-500" label="Food" change={foodChange} />
                            <StatBar value={tribute.water} max={100} color="bg-sky-500" label="Water" change={waterChange} />
                        </div>
                    )}
                    <div className="text-xs text-slate-300 grid grid-cols-5 gap-1 text-center">
                        <div title={statDescriptions.strength}><span className="font-bold">STR:</span> {tribute.strength}</div>
                        <div title={statDescriptions.agility}><span className="font-bold">AGI:</span> {tribute.agility}</div>
                        <div title={statDescriptions.speed}><span className="font-bold">SPD:</span> {tribute.speed}</div>
                        <div title={statDescriptions.intelligence}><span className="font-bold">INT:</span> {tribute.intelligence}</div>
                        <div title={statDescriptions.charisma}><span className="font-bold">CHA:</span> {tribute.charisma}</div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-300">Skills:</h4>
                        {tribute.skills.length > 0 ? (
                             <ul className="text-xs text-slate-400 space-y-1 mt-1">
                                {tribute.skills.map((skill) => (
                                    <li key={skill.name} className="flex items-start gap-2">
                                        <SkillIcon className="h-3 w-3 mt-0.5 text-amber-400 flex-shrink-0" />
                                        <span><span className="font-semibold text-slate-300">{skill.name}:</span> {skill.description}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-xs text-slate-500 italic">None</p>}
                    </div>
                     {tribute.traits.length > 0 && (
                        <div>
                            <h4 className="text-xs font-bold text-red-400">Traits:</h4>
                            <ul className="text-xs text-slate-400 space-y-1 mt-1">
                                {tribute.traits.map((trait) => (
                                    <li key={trait.name} className="flex items-start gap-2">
                                        <TraitIcon className="h-3 w-3 mt-0.5 text-red-400 flex-shrink-0" />
                                        <span><span className="font-semibold text-red-300">{trait.name}:</span> {trait.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div>
                        <h4 className="text-xs font-bold text-slate-300">Inventory:</h4>
                        {tribute.inventory.length > 0 ? (
                            <ul className="list-disc list-inside text-xs text-slate-400">
                                {tribute.inventory.map((item, index) => <li key={index}>{item.name}</li>)}
                            </ul>
                        ) : <p className="text-xs text-slate-500 italic">Empty</p>}
                    </div>
                     {tribute.status === 'dead' && tribute.causeOfDeath && (
                         <p className="text-xs text-red-400 italic">Fallen: {tribute.causeOfDeath}</p>
                     )}
                </div>
            )}
        </div>
    );
};


const TributeStatus: React.FC<TributeStatusProps> = ({ tributes }) => {
  const aliveTributes = tributes.filter((t) => t.status === 'alive');
  const fallenTributes = tributes.filter((t) => t.status === 'dead');
  
  const prevTributesRef = useRef<Tribute[]>([]);
  
  useEffect(() => {
    prevTributesRef.current = JSON.parse(JSON.stringify(tributes));
  }, [tributes]);

  const findPrevTribute = (id: number) => prevTributesRef.current.find(t => t.id === id);

  return (
    <>
      <style>{`
          @keyframes flash-green-anim {
              0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
              50% { box-shadow: 0 0 8px 3px rgba(74, 222, 128, 0.7); }
              100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
          }
          .flash-green {
              animation: flash-green-anim 1s ease-out;
          }
          @keyframes flash-red-anim {
              0% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); }
              50% { box-shadow: 0 0 8px 3px rgba(248, 113, 113, 0.7); }
              100% { box-shadow: 0 0 0 0 rgba(248, 113, 113, 0); }
          }
          .flash-red {
              animation: flash-red-anim 1s ease-out;
          }
      `}</style>
      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <div>
          <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-3">
            <AliveIcon className="h-6 w-6" />
            Alive Tributes ({aliveTributes.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
              {aliveTributes.length > 0 ? (
                  aliveTributes.map((tribute) => <TributeCard key={tribute.id} tribute={tribute} prevTribute={findPrevTribute(tribute.id)} allTributes={tributes} />)
              ) : (
                  <p className="text-slate-400">No tributes are alive.</p>
              )}
          </div>
        </div>
        <hr className="my-6 border-slate-700" />
        <div>
          <h3 className="text-xl font-bold text-red-500 mb-4 flex items-center gap-3">
            <FallenIcon className="h-6 w-6" />
            Fallen Tributes ({fallenTributes.length})
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
              {fallenTributes.length > 0 ? (
                  fallenTributes.map((tribute) => <TributeCard key={tribute.id} tribute={tribute} prevTribute={findPrevTribute(tribute.id)} allTributes={tributes} />)
              ) : (
                  <p className="text-slate-400">No tributes have fallen yet.</p>
              )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TributeStatus;
